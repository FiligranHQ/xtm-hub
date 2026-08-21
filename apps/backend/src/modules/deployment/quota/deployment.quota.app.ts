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
  takeBundleQuota: (
    region: DeploymentRequestPlatformRegion
  ): Promise<{ isPlaceAvailable: boolean }> =>
    DeploymentQuotaDomain.reservePlace(bundleQuotaKey(region)),

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
      return promoteOrFreePlace(bundleQuotaKey(request.region));
    }

    if (request.parent_id !== null || request.platform_identifier === null) {
      return undefined;
    }

    return releaseStandaloneTrialQuota(
      request.platform_identifier,
      request.region
    );
  },
};
