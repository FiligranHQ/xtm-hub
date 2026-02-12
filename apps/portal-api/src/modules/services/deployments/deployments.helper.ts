import config from 'config';
import {
  DeploymentRequestDeploymentType,
  DeploymentRequestHubStatus,
  DeploymentRequestPlatformState,
  PlatformIdentifier,
} from '../../../__generated__/resolvers-types';
import DeploymentRequestModel from '../../../model/kanel/public/DeploymentRequest';
import Organization, {
  OrganizationId,
} from '../../../model/kanel/public/Organization';
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

export const assertFreeTrialsLimit = async (
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
};

export const hasDeploymentTelemetryDataChanged = (
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
};

export const computeHubStatus = (
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

  if (!isHubStatusTransitionValid(currentHubStatus, newHubStatus)) {
    return null;
  }

  return newHubStatus;
};

export const isOrganizationBlacklisted = (organization: Organization) => {
  const domainsBlacklist = (config.get<string>('domains_blacklist') ?? '')
    .split(',')
    .map((d) => d.trim());
  return organization.domains.some((domain) =>
    domainsBlacklist.includes(domain)
  );
};
