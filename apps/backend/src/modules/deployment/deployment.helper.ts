import {
  DeploymentRequestDeploymentType,
  DeploymentRequestHubStatus,
  DeploymentRequestPlatformState,
  PlatformIdentifier,
} from '../../__generated__/resolvers-types';
import DeploymentRequestModel from '../../model/kanel/public/DeploymentRequest';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { AlreadyExistsErrorCode } from '../../utils/error/error.code';
import { DeploymentRequestDomain } from './deployment.domain';

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
    from: DeploymentRequestHubStatus.Pending,
    to: DeploymentRequestHubStatus.Provisioning,
  },
  {
    from: DeploymentRequestHubStatus.Provisioning,
    to: DeploymentRequestHubStatus.Active,
  },
  {
    from: DeploymentRequestHubStatus.Provisioning,
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
    to: DeploymentRequestHubStatus.Provisioning,
  },
  {
    from: DeploymentRequestHubStatus.Failed,
    to: DeploymentRequestHubStatus.Active,
  },
];

const VALID_PLATFORM_STATE_TRANSITIONS: PlatformStateTransition[] = [
  {
    from: DeploymentRequestPlatformState.Unprovisioned,
    to: DeploymentRequestPlatformState.Provisioning,
  },
  {
    from: DeploymentRequestPlatformState.Unprovisioned,
    to: DeploymentRequestPlatformState.Active,
  },
  {
    from: DeploymentRequestPlatformState.Provisioning,
    to: DeploymentRequestPlatformState.Active,
  },
  {
    from: DeploymentRequestPlatformState.Provisioning,
    to: DeploymentRequestPlatformState.Removing,
  },
  {
    from: DeploymentRequestPlatformState.Provisioning,
    to: DeploymentRequestPlatformState.Removed,
  },
  {
    from: DeploymentRequestPlatformState.Active,
    to: DeploymentRequestPlatformState.Removing,
  },
  {
    from: DeploymentRequestPlatformState.Active,
    to: DeploymentRequestPlatformState.Removed,
  },
  {
    from: DeploymentRequestPlatformState.Removing,
    to: DeploymentRequestPlatformState.Removed,
  },
  {
    from: DeploymentRequestPlatformState.Removed,
    to: DeploymentRequestPlatformState.Provisioning,
  },
];

export const DeploymentHelper = {
  isHubStatusTransitionValid: (
    from: DeploymentRequestHubStatus,
    to: DeploymentRequestHubStatus
  ): boolean => {
    return (
      from === to ||
      VALID_HUB_STATUS_TRANSITIONS.some((t) => t.from === from && t.to === to)
    );
  },

  isPlatformStateTransitionValid: (
    from: DeploymentRequestPlatformState | null,
    to: DeploymentRequestPlatformState | null
  ): boolean => {
    return (
      from === to ||
      VALID_PLATFORM_STATE_TRANSITIONS.some(
        (t) => t.from === from && t.to === to
      )
    );
  },

  assertFreeTrialsLimit: async (
    organizationId: OrganizationId,
    platformIdentifier: PlatformIdentifier
  ) => {
    const freeTrialsRequests =
      await DeploymentRequestDomain.loadDeploymentRequestBy({
        organization_requester_id: organizationId,
        type: DeploymentRequestDeploymentType.Trial,
        counts_in_orga_quota: true,
        platform_identifier: platformIdentifier,
      });
    if (freeTrialsRequests) {
      throw new Error(AlreadyExistsErrorCode.FreeTrialAlreadyExists);
    }
  },

  hasDeploymentTelemetryDataChanged: (
    previous: DeploymentRequestModel,
    current: DeploymentRequestModel
  ): boolean => {
    return (
      previous.hub_status !== current.hub_status ||
      previous.platform_id !== current.platform_id ||
      previous.cancellation_reason !== current.cancellation_reason ||
      previous.start_date?.getTime() !== current.start_date?.getTime() ||
      previous.end_date?.getTime() !== current.end_date?.getTime()
    );
  },

  computeBundleDates: (
    children: DeploymentRequestModel[]
  ): { start_date: Date | null; end_date: Date | null } => {
    const startTimes = children.flatMap((child) =>
      child.start_date ? [child.start_date.getTime()] : []
    );
    const endTimes = children.flatMap((child) =>
      child.end_date ? [child.end_date.getTime()] : []
    );

    return {
      start_date:
        startTimes.length === 0 ? null : new Date(Math.min(...startTimes)),
      end_date: endTimes.length === 0 ? null : new Date(Math.max(...endTimes)),
    };
  },

  computeHubStatus: (
    currentHubStatus: DeploymentRequestHubStatus,
    actualState: DeploymentRequestPlatformState | null | undefined
  ) => {
    if (!actualState) {
      return currentHubStatus;
    }

    if (
      currentHubStatus === DeploymentRequestHubStatus.Queued ||
      actualState === DeploymentRequestPlatformState.Unprovisioned
    ) {
      return null;
    }

    let newHubStatus = currentHubStatus;

    switch (actualState) {
      case DeploymentRequestPlatformState.Active:
        newHubStatus = DeploymentRequestHubStatus.Active;
        break;
      case DeploymentRequestPlatformState.Provisioning:
        newHubStatus = DeploymentRequestHubStatus.Provisioning;
        break;
      case DeploymentRequestPlatformState.Removing:
      case DeploymentRequestPlatformState.Removed:
        if (
          currentHubStatus !== DeploymentRequestHubStatus.Expired &&
          currentHubStatus !== DeploymentRequestHubStatus.Cancelled
        ) {
          return null;
        }
        newHubStatus = currentHubStatus;
        break;
    }

    if (
      !DeploymentHelper.isHubStatusTransitionValid(
        currentHubStatus,
        newHubStatus
      )
    ) {
      return null;
    }

    return newHubStatus;
  },
};
