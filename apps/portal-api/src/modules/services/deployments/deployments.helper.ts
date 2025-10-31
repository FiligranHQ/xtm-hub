import {
  DeploymentRequestStatus,
  DeploymentType,
} from '../../../__generated__/resolvers-types';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import { AlreadyExistsErrorCode } from '../../../utils/error/error.code';
import { DeploymentRequestDomain } from './deployments.domain';

type StatusTransition = {
  from: DeploymentRequestStatus;
  to: DeploymentRequestStatus;
};

const VALID_TRANSITIONS: StatusTransition[] = [
  { from: DeploymentRequestStatus.Queued, to: DeploymentRequestStatus.Pending },
  {
    from: DeploymentRequestStatus.Queued,
    to: DeploymentRequestStatus.Cancelled,
  },
  {
    from: DeploymentRequestStatus.Pending,
    to: DeploymentRequestStatus.Provisioning,
  },
  { from: DeploymentRequestStatus.Pending, to: DeploymentRequestStatus.Failed },
  {
    from: DeploymentRequestStatus.Pending,
    to: DeploymentRequestStatus.Cancelled,
  },
  {
    from: DeploymentRequestStatus.Provisioning,
    to: DeploymentRequestStatus.Active,
  },
  {
    from: DeploymentRequestStatus.Provisioning,
    to: DeploymentRequestStatus.Failed,
  },
  { from: DeploymentRequestStatus.Active, to: DeploymentRequestStatus.Expired },
];

export const isTransitionValid = (
  from: DeploymentRequestStatus,
  to: DeploymentRequestStatus
): boolean => {
  return (
    from === to || VALID_TRANSITIONS.some((t) => t.from === from && t.to === to)
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
