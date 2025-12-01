import {
  DeploymentType,
  HubStatus,
  PlatformState,
} from '../../../__generated__/resolvers-types';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import { AlreadyExistsErrorCode } from '../../../utils/error/error.code';
import { DeploymentRequestDomain } from './deployments.domain';

/**
 * Compute the target_state based on hub_status
 *
 * Rules:
 * - If hub_status is 'pending', 'denied', or 'cancelled' → target_state = 'pending'
 * - If hub_status is 'approved' → target_state = 'started' (by default)
 */
export const computeTargetState = (hubStatus: HubStatus): PlatformState => {
  switch (hubStatus) {
    case HubStatus.Pending:
    case HubStatus.Denied:
    case HubStatus.Cancelled:
      return PlatformState.Pending;
    case HubStatus.Approved:
      return PlatformState.Started;
    default:
      return PlatformState.Pending;
  }
};

type HubStatusTransition = {
  from: HubStatus;
  to: HubStatus;
};

type PlatformStateTransition = {
  from: PlatformState;
  to: PlatformState;
};

const VALID_HUB_STATUS_TRANSITIONS: HubStatusTransition[] = [
  { from: HubStatus.Pending, to: HubStatus.Approved },
  { from: HubStatus.Pending, to: HubStatus.Denied },
  { from: HubStatus.Pending, to: HubStatus.Cancelled },
  { from: HubStatus.Approved, to: HubStatus.Cancelled },
];

const VALID_PLATFORM_STATE_TRANSITIONS: PlatformStateTransition[] = [
  { from: PlatformState.Pending, to: PlatformState.Started },
  { from: PlatformState.Started, to: PlatformState.Stopped },
  { from: PlatformState.Stopped, to: PlatformState.Started },
];

export const isHubStatusTransitionValid = (
  from: HubStatus,
  to: HubStatus
): boolean => {
  return (
    from === to ||
    VALID_HUB_STATUS_TRANSITIONS.some((t) => t.from === from && t.to === to)
  );
};

export const isPlatformStateTransitionValid = (
  from: PlatformState,
  to: PlatformState
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
      type: DeploymentType.Trial,
    });
  if (freeTrialsRequests) {
    throw new Error(AlreadyExistsErrorCode.FreeTrialAlreadyExists);
  }
};
