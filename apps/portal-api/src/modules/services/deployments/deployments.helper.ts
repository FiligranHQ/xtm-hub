import {
  DeploymentRequestDeploymentType,
  DeploymentRequestHubStatus,
  DeploymentRequestPlatformState,
} from '../../../__generated__/resolvers-types';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import { AlreadyExistsErrorCode } from '../../../utils/error/error.code';
import { DeploymentRequestDomain } from './deployments.domain';

type HubStatusTransition = {
  from: DeploymentRequestHubStatus;
  to: DeploymentRequestHubStatus;
};

type PlatformStateTransition = {
  from: DeploymentRequestPlatformState;
  to: DeploymentRequestPlatformState;
};

const VALID_HUB_STATUS_TRANSITIONS: HubStatusTransition[] = [
  {
    from: DeploymentRequestHubStatus.Queued,
    to: DeploymentRequestHubStatus.Pending,
  },
  {
    from: DeploymentRequestHubStatus.Queued,
    to: DeploymentRequestHubStatus.Cancelled,
  },
  {
    from: DeploymentRequestHubStatus.Pending,
    to: DeploymentRequestHubStatus.Active,
  },
  {
    from: DeploymentRequestHubStatus.Pending,
    to: DeploymentRequestHubStatus.Failed,
  },
  {
    from: DeploymentRequestHubStatus.Pending,
    to: DeploymentRequestHubStatus.Cancelled,
  },
  {
    from: DeploymentRequestHubStatus.Active,
    to: DeploymentRequestHubStatus.Expired,
  },
  {
    from: DeploymentRequestHubStatus.Active,
    to: DeploymentRequestHubStatus.Cancelled,
  },
  {
    from: DeploymentRequestHubStatus.Failed,
    to: DeploymentRequestHubStatus.Pending,
  },
  {
    from: DeploymentRequestHubStatus.Failed,
    to: DeploymentRequestHubStatus.Active,
  },
];

const VALID_PLATFORM_STATE_TRANSITIONS: PlatformStateTransition[] = [
  {
    from: null,
    to: DeploymentRequestPlatformState.Provisioning,
  },
  {
    from: DeploymentRequestPlatformState.Provisioning,
    to: DeploymentRequestPlatformState.Active,
  },
  {
    from: DeploymentRequestPlatformState.Active,
    to: DeploymentRequestPlatformState.Removing,
  },
  {
    from: DeploymentRequestPlatformState.Active,
    to: DeploymentRequestPlatformState.Inactive,
  },
  {
    from: DeploymentRequestPlatformState.Removing,
    to: DeploymentRequestPlatformState.Removed,
  },
  {
    from: DeploymentRequestPlatformState.Inactive,
    to: DeploymentRequestPlatformState.Active,
  },
];

export const isHubStatusTransitionValid = (
  from: DeploymentRequestHubStatus,
  to: DeploymentRequestHubStatus
): boolean => {
  return (
    from === to ||
    VALID_HUB_STATUS_TRANSITIONS.some((t) => t.from === from && t.to === to)
  );
};

export const isPlatformStateTransitionValid = (
  from: DeploymentRequestPlatformState | null,
  to: DeploymentRequestPlatformState | null
): boolean => {
  return (
    from === to ||
    VALID_PLATFORM_STATE_TRANSITIONS.some((t) => t.from === from && t.to === to)
  );
};

export const assertFreeTrialsLimit = async (organizationId: OrganizationId) => {
  const freeTrialsRequests =
    await DeploymentRequestDomain.loadDeploymentRequestBy({
      organization_requester_id: organizationId,
      type: DeploymentRequestDeploymentType.Trial,
    });
  if (freeTrialsRequests) {
    throw new Error(AlreadyExistsErrorCode.FreeTrialAlreadyExists);
  }
};
