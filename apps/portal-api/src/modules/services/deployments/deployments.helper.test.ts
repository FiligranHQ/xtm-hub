import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import {
  DeploymentRequestDeploymentType,
  DeploymentRequestHubStatus,
  DeploymentRequestPlatformRegion,
  DeploymentRequestPlatformState,
  PlatformIdentifier,
} from '../../../__generated__/resolvers-types';
import { PLATFORM_ORGANIZATION_UUID } from '../../../portal.const';
import { AlreadyExistsErrorCode } from '../../../utils/error/error.code';
import { DeploymentRequestDomain } from './deployments.domain';
import {
  assertFreeTrialsLimit,
  isHubStatusTransitionValid,
  isPlatformStateTransitionValid,
} from './deployments.helper';

describe('isHubStatusTransitionValid', () => {
  const validTransitions = [
    [DeploymentRequestHubStatus.Queued, DeploymentRequestHubStatus.Pending],
    [DeploymentRequestHubStatus.Queued, DeploymentRequestHubStatus.Canceled],
    [DeploymentRequestHubStatus.Pending, DeploymentRequestHubStatus.Active],
    [DeploymentRequestHubStatus.Pending, DeploymentRequestHubStatus.Failed],
    [DeploymentRequestHubStatus.Pending, DeploymentRequestHubStatus.Canceled],
    [DeploymentRequestHubStatus.Active, DeploymentRequestHubStatus.Expired],
    [DeploymentRequestHubStatus.Active, DeploymentRequestHubStatus.Canceled],
    [DeploymentRequestHubStatus.Failed, DeploymentRequestHubStatus.Pending],
    [DeploymentRequestHubStatus.Failed, DeploymentRequestHubStatus.Active],
  ] as const;

  it.each(validTransitions)(
    'should allow valid hub status transition: %s to %s',
    (from, to) => {
      expect(isHubStatusTransitionValid(from, to)).toBe(true);
    }
  );

  const invalidTransitions = [
    [DeploymentRequestHubStatus.Queued, DeploymentRequestHubStatus.Active],
    [DeploymentRequestHubStatus.Active, DeploymentRequestHubStatus.Pending],
    [DeploymentRequestHubStatus.Expired, DeploymentRequestHubStatus.Active],
    [DeploymentRequestHubStatus.Canceled, DeploymentRequestHubStatus.Active],
    [DeploymentRequestHubStatus.Expired, DeploymentRequestHubStatus.Pending],
  ] as const;

  it.each(invalidTransitions)(
    'should reject invalid hub status transition: %s to %s',
    (from, to) => {
      expect(isHubStatusTransitionValid(from, to)).toBe(false);
    }
  );

  it('should allow same hub status transitions', () => {
    const allStatuses = Object.values(DeploymentRequestHubStatus);
    allStatuses.forEach((status) => {
      expect(isHubStatusTransitionValid(status, status)).toBe(true);
    });
  });
});

describe('isPlatformStateTransitionValid', () => {
  const validTransitions = [
    [null, DeploymentRequestPlatformState.Provisioning],
    [
      DeploymentRequestPlatformState.Provisioning,
      DeploymentRequestPlatformState.Active,
    ],
    [
      DeploymentRequestPlatformState.Active,
      DeploymentRequestPlatformState.Removing,
    ],
    [
      DeploymentRequestPlatformState.Active,
      DeploymentRequestPlatformState.Inactive,
    ],
    [
      DeploymentRequestPlatformState.Removing,
      DeploymentRequestPlatformState.Removed,
    ],
    [
      DeploymentRequestPlatformState.Inactive,
      DeploymentRequestPlatformState.Active,
    ],
  ] as const;

  it.each(validTransitions)(
    'should allow valid platform state transition: %s to %s',
    (from, to) => {
      expect(isPlatformStateTransitionValid(from, to)).toBe(true);
    }
  );

  const invalidTransitions = [
    [null, DeploymentRequestPlatformState.Active],
    [
      DeploymentRequestPlatformState.Provisioning,
      DeploymentRequestPlatformState.Removing,
    ],
    [DeploymentRequestPlatformState.Active, null],
    [
      DeploymentRequestPlatformState.Removed,
      DeploymentRequestPlatformState.Active,
    ],
  ] as const;

  it.each(invalidTransitions)(
    'should reject invalid platform state transition: %s to %s',
    (from, to) => {
      expect(isPlatformStateTransitionValid(from, to)).toBe(false);
    }
  );

  it('should allow same platform state transitions', () => {
    const allStates = Object.values(DeploymentRequestPlatformState);
    allStates.forEach((state) => {
      expect(isPlatformStateTransitionValid(state, state)).toBe(true);
    });
  });
});

describe('assertFreeTrialsLimit', () => {
  it('should not throw if there is no trial for the organization', async () => {
    vi.spyOn(
      DeploymentRequestDomain,
      'loadDeploymentRequestBy'
    ).mockResolvedValue(null);

    await expect(
      assertFreeTrialsLimit(PLATFORM_ORGANIZATION_UUID)
    ).resolves.not.toThrow();
  });

  it('should throw if there is more than one trial for an organization', async () => {
    vi.spyOn(
      DeploymentRequestDomain,
      'loadDeploymentRequestBy'
    ).mockResolvedValue({
      id: uuidv4(),
      platform_identifier: PlatformIdentifier.Opencti,
      region: DeploymentRequestPlatformRegion.EuWest,
      type: DeploymentRequestDeploymentType.Trial,
      hub_status: DeploymentRequestHubStatus.Pending,
      target_state: DeploymentRequestPlatformState.Active,
      actual_state: null,
    });
    await expect(
      assertFreeTrialsLimit(PLATFORM_ORGANIZATION_UUID)
    ).rejects.toThrow(AlreadyExistsErrorCode.FreeTrialAlreadyExists);
  });
});
