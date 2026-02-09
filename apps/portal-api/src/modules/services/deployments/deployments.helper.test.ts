import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import { TEST_ORGANIZATIONS } from '../../../../tests/tests.const';
import {
  DeploymentRequestDeploymentType,
  DeploymentRequestHubStatus,
  DeploymentRequestPlatformRegion,
  DeploymentRequestPlatformState,
  PlatformIdentifier,
} from '../../../__generated__/resolvers-types';
import { AlreadyExistsErrorCode } from '../../../utils/error/error.code';
import { DeploymentRequestDomain } from './deployments.domain';
import {
  assertFreeTrialsLimit,
  computeHubStatus,
  isHubStatusTransitionValid,
  isPlatformStateTransitionValid,
} from './deployments.helper';

describe('isHubStatusTransitionValid', () => {
  const validTransitions = [
    [DeploymentRequestHubStatus.Queued, DeploymentRequestHubStatus.Pending],
    [DeploymentRequestHubStatus.Queued, DeploymentRequestHubStatus.Cancelled],
    [DeploymentRequestHubStatus.Pending, DeploymentRequestHubStatus.Active],
    [
      DeploymentRequestHubStatus.Pending,
      DeploymentRequestHubStatus.Provisioning,
    ],
    [DeploymentRequestHubStatus.Pending, DeploymentRequestHubStatus.Failed],
    [DeploymentRequestHubStatus.Pending, DeploymentRequestHubStatus.Cancelled],
    [
      DeploymentRequestHubStatus.Provisioning,
      DeploymentRequestHubStatus.Active,
    ],
    [
      DeploymentRequestHubStatus.Provisioning,
      DeploymentRequestHubStatus.Cancelled,
    ],
    [DeploymentRequestHubStatus.Active, DeploymentRequestHubStatus.Expired],
    [DeploymentRequestHubStatus.Active, DeploymentRequestHubStatus.Cancelled],
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
    [DeploymentRequestHubStatus.Cancelled, DeploymentRequestHubStatus.Active],
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
    [
      DeploymentRequestPlatformState.Unprovisioned,
      DeploymentRequestPlatformState.Provisioning,
    ],
    [
      DeploymentRequestPlatformState.Provisioning,
      DeploymentRequestPlatformState.Active,
    ],
    [
      DeploymentRequestPlatformState.Provisioning,
      DeploymentRequestPlatformState.Removing,
    ],
    [
      DeploymentRequestPlatformState.Provisioning,
      DeploymentRequestPlatformState.Removed,
    ],
    [
      DeploymentRequestPlatformState.Active,
      DeploymentRequestPlatformState.Removing,
    ],
    [
      DeploymentRequestPlatformState.Active,
      DeploymentRequestPlatformState.Removed,
    ],
    [
      DeploymentRequestPlatformState.Removing,
      DeploymentRequestPlatformState.Removed,
    ],
    [
      DeploymentRequestPlatformState.Removed,
      DeploymentRequestPlatformState.Provisioning,
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
      DeploymentRequestPlatformState.Unprovisioned,
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
      assertFreeTrialsLimit(
        TEST_ORGANIZATIONS.FILIGRAN.ID,
        PlatformIdentifier.Opencti
      )
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
      actual_state: DeploymentRequestPlatformState.Active,
    });
    await expect(
      assertFreeTrialsLimit(
        TEST_ORGANIZATIONS.FILIGRAN.ID,
        PlatformIdentifier.Opencti
      )
    ).rejects.toThrow(AlreadyExistsErrorCode.FreeTrialAlreadyExists);
  });
});

describe('computeHubStatus', () => {
  describe('when actualState is null/undefined', () => {
    it.each([
      [DeploymentRequestHubStatus.Pending, undefined],
      [DeploymentRequestHubStatus.Active, null],
      [DeploymentRequestHubStatus.Expired, undefined],
      [DeploymentRequestHubStatus.Cancelled, null],
    ])(
      'should return %s when actualState is %s',
      (currentStatus, actualState) => {
        const result = computeHubStatus(currentStatus, actualState);
        expect(result).toBe(currentStatus);
      }
    );
  });

  describe('validation errors', () => {
    it('should throw error when current status is Queued', () => {
      const result = computeHubStatus(
        DeploymentRequestHubStatus.Queued,
        DeploymentRequestPlatformState.Provisioning
      );
      expect(result).toBeNull();
    });

    it.each([
      [DeploymentRequestHubStatus.Pending],
      [DeploymentRequestHubStatus.Active],
      [DeploymentRequestHubStatus.Failed],
      [DeploymentRequestHubStatus.Expired],
      [DeploymentRequestHubStatus.Cancelled],
    ])(
      'should throw error when platform state is Unprovisioned from %s',
      (currentStatus) => {
        const result = computeHubStatus(
          currentStatus,
          DeploymentRequestPlatformState.Unprovisioned
        );
        expect(result).toBeNull();
      }
    );

    it.each([
      [
        DeploymentRequestHubStatus.Active,
        DeploymentRequestPlatformState.Provisioning,
      ],
      [
        DeploymentRequestHubStatus.Expired,
        DeploymentRequestPlatformState.Active,
      ],
      [
        DeploymentRequestHubStatus.Expired,
        DeploymentRequestPlatformState.Provisioning,
      ],
      [
        DeploymentRequestHubStatus.Cancelled,
        DeploymentRequestPlatformState.Active,
      ],
      [
        DeploymentRequestHubStatus.Cancelled,
        DeploymentRequestPlatformState.Provisioning,
      ],
      [
        DeploymentRequestHubStatus.Pending,
        DeploymentRequestPlatformState.Removing,
      ],
      [
        DeploymentRequestHubStatus.Active,
        DeploymentRequestPlatformState.Removing,
      ],
      [
        DeploymentRequestHubStatus.Failed,
        DeploymentRequestPlatformState.Removing,
      ],
      [
        DeploymentRequestHubStatus.Pending,
        DeploymentRequestPlatformState.Removed,
      ],
      [
        DeploymentRequestHubStatus.Active,
        DeploymentRequestPlatformState.Removed,
      ],
      [
        DeploymentRequestHubStatus.Failed,
        DeploymentRequestPlatformState.Removed,
      ],
    ])(
      'should throw error for invalid transition from %s with platform state %s',
      (currentStatus, platformState) => {
        const result = computeHubStatus(currentStatus, platformState);
        expect(result).toBeNull();
      }
    );
  });

  describe('valid state transitions', () => {
    it.each([
      [
        DeploymentRequestHubStatus.Pending,
        DeploymentRequestPlatformState.Active,
        DeploymentRequestHubStatus.Active,
      ],
      [
        DeploymentRequestHubStatus.Pending,
        DeploymentRequestPlatformState.Provisioning,
        DeploymentRequestHubStatus.Provisioning,
      ],
      [
        DeploymentRequestHubStatus.Failed,
        DeploymentRequestPlatformState.Provisioning,
        DeploymentRequestHubStatus.Provisioning,
      ],
      [
        DeploymentRequestHubStatus.Failed,
        DeploymentRequestPlatformState.Active,
        DeploymentRequestHubStatus.Active,
      ],
      [
        DeploymentRequestHubStatus.Active,
        DeploymentRequestPlatformState.Active,
        DeploymentRequestHubStatus.Active,
      ],
      [
        DeploymentRequestHubStatus.Cancelled,
        DeploymentRequestPlatformState.Removing,
        DeploymentRequestHubStatus.Cancelled,
      ],
      [
        DeploymentRequestHubStatus.Cancelled,
        DeploymentRequestPlatformState.Removed,
        DeploymentRequestHubStatus.Cancelled,
      ],
      [
        DeploymentRequestHubStatus.Expired,
        DeploymentRequestPlatformState.Removing,
        DeploymentRequestHubStatus.Expired,
      ],
      [
        DeploymentRequestHubStatus.Expired,
        DeploymentRequestPlatformState.Removed,
        DeploymentRequestHubStatus.Expired,
      ],
    ])(
      'should transition from %s with platform state %s to %s',
      (currentStatus, platformState, expectedStatus) => {
        const result = computeHubStatus(currentStatus, platformState);
        expect(result).toBe(expectedStatus);
      }
    );
  });
});
