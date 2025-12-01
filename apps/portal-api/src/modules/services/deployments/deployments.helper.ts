import {
  DeploymentType,
  HubStatus,
  PlatformState,
} from '../../../__generated__/resolvers-types';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import { AlreadyExistsErrorCode } from '../../../utils/error/error.code';
import { DeploymentRequestDomain } from './deployments.domain';

type HubStatusTransition = {
  from: HubStatus;
  to: HubStatus;
};

type PlatformStateTransition = {
  from: PlatformState;
  to: PlatformState;
};

const VALID_HUB_STATUS_TRANSITIONS: HubStatusTransition[] = [
  { from: HubStatus.Queued, to: HubStatus.Pending },
  { from: HubStatus.Queued, to: HubStatus.Canceled },
  { from: HubStatus.Pending, to: HubStatus.Active },
  { from: HubStatus.Pending, to: HubStatus.Failed },
  { from: HubStatus.Pending, to: HubStatus.Canceled },
  { from: HubStatus.Active, to: HubStatus.Expired },
  { from: HubStatus.Active, to: HubStatus.Canceled },
  { from: HubStatus.Failed, to: HubStatus.Pending },
  { from: HubStatus.Failed, to: HubStatus.Active },
];

const VALID_PLATFORM_STATE_TRANSITIONS: PlatformStateTransition[] = [
  { from: PlatformState.Pending, to: PlatformState.Provisioning },
  { from: PlatformState.Provisioning, to: PlatformState.Active },
  { from: PlatformState.Provisioning, to: PlatformState.Pending },
  { from: PlatformState.Active, to: PlatformState.Removing },
  { from: PlatformState.Active, to: PlatformState.Inactive },
  { from: PlatformState.Removing, to: PlatformState.Removed },
  { from: PlatformState.Inactive, to: PlatformState.Active },
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
