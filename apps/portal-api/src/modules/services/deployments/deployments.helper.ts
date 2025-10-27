import { DeploymentRequestStatus } from '../../../__generated__/resolvers-types';

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

export const isValidTransition = (
  from: DeploymentRequestStatus,
  to: DeploymentRequestStatus
): boolean => {
  return (
    from === to || VALID_TRANSITIONS.some((t) => t.from === from && t.to === to)
  );
};
