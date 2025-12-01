import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import {
  DeploymentType,
  HubStatus,
  PlatformIdentifier,
  PlatformRegion,
  PlatformState,
} from '../../../__generated__/resolvers-types';
import { PLATFORM_ORGANIZATION_UUID } from '../../../portal.const';
import { AlreadyExistsErrorCode } from '../../../utils/error/error.code';
import { DeploymentRequestDomain } from './deployments.domain';
import {
  assertFreeTrialsLimit,
  computeTargetState,
  isHubStatusTransitionValid,
  isPlatformStateTransitionValid,
} from './deployments.helper';

describe('computeTargetState', () => {
  it('should return pending for pending hub status', () => {
    expect(computeTargetState(HubStatus.Pending)).toBe(PlatformState.Pending);
  });

  it('should return pending for denied hub status', () => {
    expect(computeTargetState(HubStatus.Denied)).toBe(PlatformState.Pending);
  });

  it('should return pending for cancelled hub status', () => {
    expect(computeTargetState(HubStatus.Cancelled)).toBe(PlatformState.Pending);
  });

  it('should return started for approved hub status', () => {
    expect(computeTargetState(HubStatus.Approved)).toBe(PlatformState.Started);
  });
});

describe('isHubStatusTransitionValid', () => {
  const validTransitions = [
    [HubStatus.Pending, HubStatus.Approved],
    [HubStatus.Pending, HubStatus.Denied],
    [HubStatus.Pending, HubStatus.Cancelled],
    [HubStatus.Approved, HubStatus.Cancelled],
  ] as const;

  it.each(validTransitions)(
    'should allow valid hub status transition: %s to %s',
    (from, to) => {
      expect(isHubStatusTransitionValid(from, to)).toBe(true);
    }
  );

  const invalidTransitions = [
    [HubStatus.Approved, HubStatus.Pending],
    [HubStatus.Denied, HubStatus.Approved],
    [HubStatus.Cancelled, HubStatus.Approved],
    [HubStatus.Denied, HubStatus.Pending],
  ] as const;

  it.each(invalidTransitions)(
    'should reject invalid hub status transition: %s to %s',
    (from, to) => {
      expect(isHubStatusTransitionValid(from, to)).toBe(false);
    }
  );

  it('should allow same hub status transitions', () => {
    const allStatuses = Object.values(HubStatus);
    allStatuses.forEach((status) => {
      expect(isHubStatusTransitionValid(status, status)).toBe(true);
    });
  });
});

describe('isPlatformStateTransitionValid', () => {
  const validTransitions = [
    [PlatformState.Pending, PlatformState.Started],
    [PlatformState.Started, PlatformState.Stopped],
    [PlatformState.Stopped, PlatformState.Started],
  ] as const;

  it.each(validTransitions)(
    'should allow valid platform state transition: %s to %s',
    (from, to) => {
      expect(isPlatformStateTransitionValid(from, to)).toBe(true);
    }
  );

  const invalidTransitions = [
    [PlatformState.Pending, PlatformState.Stopped],
    [PlatformState.Started, PlatformState.Pending],
    [PlatformState.Stopped, PlatformState.Pending],
  ] as const;

  it.each(invalidTransitions)(
    'should reject invalid platform state transition: %s to %s',
    (from, to) => {
      expect(isPlatformStateTransitionValid(from, to)).toBe(false);
    }
  );

  it('should allow same platform state transitions', () => {
    const allStates = Object.values(PlatformState);
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
      region: PlatformRegion.Europe,
      type: DeploymentType.Trial,
      hub_status: HubStatus.Pending,
      target_state: PlatformState.Pending,
      actual_state: PlatformState.Pending,
    } as ReturnType<
      typeof DeploymentRequestDomain.loadDeploymentRequestBy
    > extends Promise<infer T>
      ? T
      : never);
    await expect(
      assertFreeTrialsLimit(PLATFORM_ORGANIZATION_UUID)
    ).rejects.toThrow(AlreadyExistsErrorCode.FreeTrialAlreadyExists);
  });
});
