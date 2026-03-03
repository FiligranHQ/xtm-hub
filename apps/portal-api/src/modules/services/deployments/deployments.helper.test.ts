import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import { TEST_ORGANIZATIONS } from '../../../../tests/tests.const';
import {
  DeploymentRequestActivitySector,
  DeploymentRequestDeploymentType,
  DeploymentRequestHubStatus,
  DeploymentRequestPlatformRegion,
  DeploymentRequestPlatformState,
  PlatformIdentifier,
} from '../../../__generated__/resolvers-types';
import DeploymentRequestModel, {
  DeploymentRequestId,
} from '../../../model/kanel/public/DeploymentRequest';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { UserId } from '../../../model/kanel/public/User';
import { AlreadyExistsErrorCode } from '../../../utils/error/error.code';
import { DeploymentRequestDomain } from './deployments.domain';
import {
  assertFreeTrialsLimit,
  computeHubStatus,
  hasDeploymentTelemetryDataChanged,
  isHubStatusTransitionValid,
  isPlatformStateTransitionValid,
} from './deployments.helper';

const buildDeploymentRequest = (
  overrides: Partial<DeploymentRequestModel> = {}
): DeploymentRequestModel => ({
  id: uuidv4() as DeploymentRequestId,
  user_requester_id: uuidv4() as UserId,
  organization_requester_id: uuidv4() as OrganizationId,
  service_instance_id: uuidv4() as ServiceInstanceId,
  type: DeploymentRequestDeploymentType.Trial,
  request_date: new Date('2025-01-01'),
  start_date: new Date('2025-01-01'),
  end_date: new Date('2025-02-01'),
  platform_identifier: PlatformIdentifier.Opencti,
  region: DeploymentRequestPlatformRegion.EuWest,
  activity_sector: null,
  platform_token: null,
  platform_id: 'platform-123',
  failure_reason: null,
  job_title: null,
  use_case: null,
  hub_status: DeploymentRequestHubStatus.Pending,
  target_state: DeploymentRequestPlatformState.Active,
  actual_state: DeploymentRequestPlatformState.Provisioning,
  ordering: 0,
  counts_in_orga_quota: true,
  cancellation_user_id: null,
  cancellation_date: null,
  cancellation_reason: null,
  ...overrides,
});

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

describe('hasDeploymentTelemetryDataChanged', () => {
  it('should return false when all telemetry fields are identical', () => {
    const base = buildDeploymentRequest();
    const copy = { ...base };

    expect(hasDeploymentTelemetryDataChanged(base, copy)).toBe(false);
  });

  it('should return true when hub_status changed', () => {
    const previous = buildDeploymentRequest({
      hub_status: DeploymentRequestHubStatus.Pending,
    });
    const current = buildDeploymentRequest({
      ...previous,
      hub_status: DeploymentRequestHubStatus.Active,
    });

    expect(hasDeploymentTelemetryDataChanged(previous, current)).toBe(true);
  });

  it('should return true when platform_id changed', () => {
    const previous = buildDeploymentRequest({ platform_id: 'old-id' });
    const current = { ...previous, platform_id: 'new-id' };

    expect(hasDeploymentTelemetryDataChanged(previous, current)).toBe(true);
  });

  it('should return true when platform_id goes from null to a value', () => {
    const previous = buildDeploymentRequest({ platform_id: null });
    const current = { ...previous, platform_id: 'new-id' };

    expect(hasDeploymentTelemetryDataChanged(previous, current)).toBe(true);
  });

  it('should return true when cancellation_reason changed', () => {
    const previous = buildDeploymentRequest({ cancellation_reason: null });
    const current = { ...previous, cancellation_reason: 'user_request' };

    expect(hasDeploymentTelemetryDataChanged(previous, current)).toBe(true);
  });

  it('should return true when start_date changed', () => {
    const previous = buildDeploymentRequest({
      start_date: new Date('2025-01-01'),
    });
    const current = { ...previous, start_date: new Date('2025-01-15') };

    expect(hasDeploymentTelemetryDataChanged(previous, current)).toBe(true);
  });

  it('should return true when end_date changed', () => {
    const previous = buildDeploymentRequest({
      end_date: new Date('2025-02-01'),
    });
    const current = { ...previous, end_date: new Date('2025-03-01') };

    expect(hasDeploymentTelemetryDataChanged(previous, current)).toBe(true);
  });

  it('should return true when start_date goes from null to a value', () => {
    const previous = buildDeploymentRequest({ start_date: null });
    const current = { ...previous, start_date: new Date('2025-01-01') };

    expect(hasDeploymentTelemetryDataChanged(previous, current)).toBe(true);
  });

  it('should return true when end_date goes from a value to null', () => {
    const previous = buildDeploymentRequest({
      end_date: new Date('2025-02-01'),
    });
    const current = { ...previous, end_date: null };

    expect(hasDeploymentTelemetryDataChanged(previous, current)).toBe(true);
  });

  it('should return false when both start_date and end_date are null', () => {
    const previous = buildDeploymentRequest({
      start_date: null,
      end_date: null,
    });
    const current = { ...previous };

    expect(hasDeploymentTelemetryDataChanged(previous, current)).toBe(false);
  });

  it('should return false when non-telemetry fields changed', () => {
    const previous = buildDeploymentRequest({
      failure_reason: null,
      ordering: 0,
      actual_state: DeploymentRequestPlatformState.Provisioning,
      activity_sector: DeploymentRequestActivitySector.ComputerNetworkSecurity,
    });
    const current = {
      ...previous,
      failure_reason: 'some failure',
      ordering: 5,
      actual_state: DeploymentRequestPlatformState.Active,
      activity_sector: DeploymentRequestActivitySector.FinancialServices,
    };

    expect(hasDeploymentTelemetryDataChanged(previous, current)).toBe(false);
  });

  it('should return true when multiple telemetry fields changed at once', () => {
    const previous = buildDeploymentRequest({
      hub_status: DeploymentRequestHubStatus.Pending,
      platform_id: null,
      start_date: null,
    });
    const current = {
      ...previous,
      hub_status: DeploymentRequestHubStatus.Active,
      platform_id: 'new-platform',
      start_date: new Date('2025-01-01'),
    };

    expect(hasDeploymentTelemetryDataChanged(previous, current)).toBe(true);
  });

  it('should return false when dates have same timestamp', () => {
    const timestamp = new Date('2025-06-15T10:30:00.000Z');
    const previous = buildDeploymentRequest({
      start_date: new Date(timestamp.getTime()),
      end_date: new Date(timestamp.getTime()),
    });
    const current = {
      ...previous,
      start_date: new Date(timestamp.getTime()),
      end_date: new Date(timestamp.getTime()),
    };

    expect(hasDeploymentTelemetryDataChanged(previous, current)).toBe(false);
  });
});
