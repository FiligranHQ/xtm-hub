import {
  DeploymentRequestDeploymentType,
  DeploymentRequestHubStatus,
  DeploymentRequestPlatformRegion,
  PlatformIdentifier,
} from '../../../__generated__/resolvers-types';
import DeploymentRequestModel, {
  DeploymentRequestId,
} from '../../../model/kanel/public/DeploymentRequest';
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

type TakeQuotaInput =
  | {
      type: DeploymentRequestDeploymentType.Bundle;
      region: DeploymentRequestPlatformRegion;
      products: PlatformIdentifier[];
    }
  | {
      type: DeploymentRequestDeploymentType.Trial;
      region: DeploymentRequestPlatformRegion;
      platformIdentifier: PlatformIdentifier | null;
      parentId: DeploymentRequestId | null;
    };

const loadBundleProducts = async (
  bundle: DeploymentRequestModel
): Promise<PlatformIdentifier[]> => {
  const children = await DeploymentRequestDomain.loadDeploymentRequestsBy({
    parent_id: bundle.id,
  });

  return children
    .map((child) => child.platform_identifier)
    .filter(
      (identifier): identifier is PlatformIdentifier => identifier !== null
    );
};

const reserveProductPlaces = async (
  products: PlatformIdentifier[],
  region: DeploymentRequestPlatformRegion
): Promise<void> => {
  for (const platformIdentifier of [...products].sort((a, b) =>
    a.localeCompare(b)
  )) {
    await DeploymentQuotaDomain.reservePlace(
      trialQuotaKey(platformIdentifier, region),
      { blocking: false }
    );
  }
};

const takeQuotaInputOf = async (
  request: DeploymentRequestModel
): Promise<TakeQuotaInput> => {
  if (request.type === DeploymentRequestDeploymentType.Bundle) {
    return {
      type: DeploymentRequestDeploymentType.Bundle,
      region: request.region,
      products: await loadBundleProducts(request),
    };
  }

  return {
    type: DeploymentRequestDeploymentType.Trial,
    region: request.region,
    platformIdentifier: request.platform_identifier,
    parentId: request.parent_id,
  };
};

const demoteLastPendingRequest = async (
  key: QuotaKey
): Promise<DeploymentRequestModel | undefined> => {
  const request = await DeploymentRequestDomain.loadLastPendingRequest(key);
  if (!request) {
    return undefined;
  }

  const family =
    await DeploymentRequestDomain.loadDeploymentRequestWithChildren(
      request,
      DeploymentRequestHubStatus.Pending
    );

  const demotedRequest =
    await DeploymentRequestDomain.setRequestAsQueued(request);

  for (const familyMember of family) {
    await DeploymentQuotaApp.releaseQuotaForRequest(
      familyMember,
      DeploymentRequestHubStatus.Pending,
      { promote: false }
    );
  }

  return demotedRequest;
};

const promoteNextQueuedRequest = async (
  keys: QuotaKey[]
): Promise<DeploymentRequestModel | undefined> => {
  for (const key of keys) {
    const candidate = await DeploymentRequestDomain.loadFirstQueuedRequest(key);
    if (!candidate) {
      continue;
    }

    const { isPlaceAvailable } = await DeploymentQuotaApp.takeQuotaForRequest(
      await takeQuotaInputOf(candidate)
    );
    if (isPlaceAvailable) {
      return DeploymentRequestDomain.setRequestAsPending(candidate);
    }
  }

  return undefined;
};

export const DeploymentQuotaApp = {
  takeQuotaForRequest: async (
    input: TakeQuotaInput
  ): Promise<{ isPlaceAvailable: boolean }> => {
    if (input.type === DeploymentRequestDeploymentType.Bundle) {
      const { isPlaceAvailable } = await DeploymentQuotaDomain.reservePlace(
        bundleQuotaKey(input.region)
      );
      if (isPlaceAvailable) {
        await reserveProductPlaces(input.products, input.region);
      }
      return { isPlaceAvailable };
    }

    if (input.parentId !== null || input.platformIdentifier === null) {
      return { isPlaceAvailable: true };
    }

    const { isPlaceAvailable } = await DeploymentQuotaDomain.reservePlace(
      trialQuotaKey(input.platformIdentifier, input.region)
    );
    if (isPlaceAvailable) {
      await DeploymentQuotaDomain.reservePlace(bundleQuotaKey(input.region), {
        blocking: false,
      });
    }
    return { isPlaceAvailable };
  },

  releaseQuotaForRequest: async (
    request: DeploymentRequestModel,
    previousHubStatus: DeploymentRequestHubStatus,
    { promote = true }: { promote?: boolean } = {}
  ): Promise<DeploymentRequestModel | undefined> => {
    if (!QUOTA_HOLDING_HUB_STATUSES.includes(previousHubStatus)) {
      return undefined;
    }

    if (request.type === DeploymentRequestDeploymentType.Bundle) {
      await DeploymentQuotaDomain.freePlace(bundleQuotaKey(request.region));

      return promote
        ? promoteNextQueuedRequest([bundleQuotaKey(request.region)])
        : undefined;
    }

    if (request.platform_identifier === null) {
      return undefined;
    }

    const trialKey = trialQuotaKey(request.platform_identifier, request.region);

    if (request.parent_id !== null) {
      await DeploymentQuotaDomain.freePlace(trialKey);
      return undefined;
    }

    await DeploymentQuotaDomain.freePlace(bundleQuotaKey(request.region));
    await DeploymentQuotaDomain.freePlace(trialKey);

    return promote
      ? promoteNextQueuedRequest([bundleQuotaKey(request.region), trialKey])
      : undefined;
  },

  applyQuotaCapacityChange: async ({
    platformIdentifier,
    region,
    newCapacity,
    onRequestMoved,
  }: {
    platformIdentifier?: PlatformIdentifier | null;
    region: DeploymentRequestPlatformRegion;
    newCapacity: number;
    onRequestMoved: (request: DeploymentRequestModel) => Promise<void>;
  }): Promise<void> => {
    const key = platformIdentifier
      ? trialQuotaKey(platformIdentifier, region)
      : bundleQuotaKey(region);
    const lockedKeys = platformIdentifier
      ? [bundleQuotaKey(region), key]
      : [key];

    await DeploymentQuotaDomain.withLockedQuotaTransaction(
      lockedKeys,
      async () => {
        const { newAvailability } =
          await DeploymentQuotaDomain.updateQuotaCapacity({
            key,
            newCapacity,
          });

        for (let i = 0; i < -newAvailability; i++) {
          const demotedRequest = await demoteLastPendingRequest(key);
          if (!demotedRequest) {
            break;
          }

          await onRequestMoved(demotedRequest);
        }

        for (let i = 0; i < newAvailability; i++) {
          const promotedRequest = await promoteNextQueuedRequest([key]);
          if (!promotedRequest) {
            break;
          }

          await onRequestMoved(promotedRequest);
        }
      }
    );
  },
};
