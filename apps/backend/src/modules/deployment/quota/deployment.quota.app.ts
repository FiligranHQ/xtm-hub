import {
  DeploymentRequestDeploymentType,
  DeploymentRequestHubStatus,
  DeploymentRequestPlatformRegion,
  PlatformIdentifier,
} from '../../../__generated__/resolvers-types';
import DeploymentRequestModel from '../../../model/kanel/public/DeploymentRequest';
import { DeploymentRequestDomain } from '../deployment.domain';
import {
  bundleQuotaKey,
  DeploymentQuotaDomain,
  QuotaKey,
  trialQuotaKey,
} from './deployment.quota.domain';

const QUOTA_HOLDING_HUB_STATUSES = [
  DeploymentRequestHubStatus.Active,
  DeploymentRequestHubStatus.Pending,
  DeploymentRequestHubStatus.Provisioning,
];

const promoteOrFreePlace = async (
  key: QuotaKey
): Promise<DeploymentRequestModel | undefined> => {
  const promotedRequest =
    await DeploymentRequestDomain.setFirstQueuedRequestAsPending(key);

  if (promotedRequest) {
    return promotedRequest;
  }

  await DeploymentQuotaDomain.freePlace(key);
  return undefined;
};

const reserveProductPlacesOfBundle = async (
  bundle: DeploymentRequestModel
): Promise<void> => {
  const children = await DeploymentRequestDomain.loadDeploymentRequestsBy({
    parent_id: bundle.id,
  });

  const platformIdentifiers = children
    .map((child) => child.platform_identifier)
    .filter(
      (identifier): identifier is PlatformIdentifier => identifier !== null
    )
    .sort((a, b) => a.localeCompare(b));

  for (const platformIdentifier of platformIdentifiers) {
    await DeploymentQuotaDomain.reservePlace(
      trialQuotaKey(platformIdentifier, bundle.region),
      { blocking: false }
    );
  }
};

const releaseBundleChildQuota = async (
  platformIdentifier: PlatformIdentifier,
  region: DeploymentRequestPlatformRegion
): Promise<DeploymentRequestModel | undefined> => {
  const trialKey = trialQuotaKey(platformIdentifier, region);

  const promotedTrial =
    await DeploymentRequestDomain.setFirstQueuedRequestAsPending(trialKey);
  if (promotedTrial) {
    await DeploymentQuotaDomain.reservePlace(bundleQuotaKey(region), {
      blocking: false,
    });
    return promotedTrial;
  }

  await DeploymentQuotaDomain.freePlace(trialKey);
  return undefined;
};

const releaseStandaloneTrialQuota = async (
  platformIdentifier: PlatformIdentifier,
  region: DeploymentRequestPlatformRegion
): Promise<DeploymentRequestModel | undefined> => {
  const bundleKey = bundleQuotaKey(region);
  const trialKey = trialQuotaKey(platformIdentifier, region);

  const promotedBundle =
    await DeploymentRequestDomain.setFirstQueuedRequestAsPending(bundleKey);
  if (promotedBundle) {
    await DeploymentQuotaDomain.freePlace(trialKey);
    await reserveProductPlacesOfBundle(promotedBundle);
    return promotedBundle;
  }

  const promotedTrial =
    await DeploymentRequestDomain.setFirstQueuedRequestAsPending(trialKey);
  if (promotedTrial) {
    return promotedTrial;
  }

  await DeploymentQuotaDomain.freePlace(bundleKey);
  await DeploymentQuotaDomain.freePlace(trialKey);
  return undefined;
};

export const DeploymentQuotaApp = {
  takeBundleQuota: async (
    region: DeploymentRequestPlatformRegion,
    products: PlatformIdentifier[]
  ): Promise<{ isPlaceAvailable: boolean }> => {
    const { isPlaceAvailable } = await DeploymentQuotaDomain.reservePlace(
      bundleQuotaKey(region)
    );

    if (isPlaceAvailable) {
      for (const platformIdentifier of [...products].sort((a, b) =>
        a.localeCompare(b)
      )) {
        await DeploymentQuotaDomain.reservePlace(
          trialQuotaKey(platformIdentifier, region),
          { blocking: false }
        );
      }
    }

    return { isPlaceAvailable };
  },

  takeStandaloneTrialQuota: async (
    platformIdentifier: PlatformIdentifier,
    region: DeploymentRequestPlatformRegion
  ): Promise<{ isPlaceAvailable: boolean }> => {
    const { isPlaceAvailable } = await DeploymentQuotaDomain.reservePlace(
      trialQuotaKey(platformIdentifier, region)
    );

    if (isPlaceAvailable) {
      await DeploymentQuotaDomain.reservePlace(bundleQuotaKey(region), {
        blocking: false,
      });
    }

    return { isPlaceAvailable };
  },

  releaseQuotaForRequest: async (
    request: DeploymentRequestModel,
    previousHubStatus: DeploymentRequestHubStatus
  ): Promise<DeploymentRequestModel | undefined> => {
    if (!QUOTA_HOLDING_HUB_STATUSES.includes(previousHubStatus)) {
      return undefined;
    }

    if (request.type === DeploymentRequestDeploymentType.Bundle) {
      const promotedBundle = await promoteOrFreePlace(
        bundleQuotaKey(request.region)
      );
      if (promotedBundle) {
        await reserveProductPlacesOfBundle(promotedBundle);
      }
      return promotedBundle;
    }

    if (request.platform_identifier === null) {
      return undefined;
    }

    if (request.parent_id !== null) {
      return releaseBundleChildQuota(
        request.platform_identifier,
        request.region
      );
    }

    return releaseStandaloneTrialQuota(
      request.platform_identifier,
      request.region
    );
  },
};
