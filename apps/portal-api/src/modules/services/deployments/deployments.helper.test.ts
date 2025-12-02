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
  isHubStatusTransitionValid,
  isPlatformStateTransitionValid,
} from './deployments.helper';

describe('isHubStatusTransitionValid', () => {
  const validTransitions = [
    [HubStatus.Queued, HubStatus.Pending],
    [HubStatus.Queued, HubStatus.Canceled],
    [HubStatus.Pending, HubStatus.Active],
    [HubStatus.Pending, HubStatus.Failed],
    [HubStatus.Pending, HubStatus.Canceled],
    [HubStatus.Active, HubStatus.Expired],
    [HubStatus.Active, HubStatus.Canceled],
    [HubStatus.Failed, HubStatus.Pending],
    [HubStatus.Failed, HubStatus.Active],
  ] as const;

  it.each(validTransitions)(
    'should allow valid hub status transition: %s to %s',
    (from, to) => {
      expect(isHubStatusTransitionValid(from, to)).toBe(true);
    }
  );

  const invalidTransitions = [
    [HubStatus.Queued, HubStatus.Active],
    [HubStatus.Active, HubStatus.Pending],
    [HubStatus.Expired, HubStatus.Active],
    [HubStatus.Canceled, HubStatus.Active],
    [HubStatus.Expired, HubStatus.Pending],
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
    [PlatformState.Pending, PlatformState.Provisioning],
    [PlatformState.Provisioning, PlatformState.Active],
    [PlatformState.Provisioning, PlatformState.Pending],
    [PlatformState.Active, PlatformState.Removing],
    [PlatformState.Active, PlatformState.Inactive],
    [PlatformState.Removing, PlatformState.Removed],
    [PlatformState.Inactive, PlatformState.Active],
  ] as const;

  it.each(validTransitions)(
    'should allow valid platform state transition: %s to %s',
    (from, to) => {
      expect(isPlatformStateTransitionValid(from, to)).toBe(true);
    }
  );

  const invalidTransitions = [
    [PlatformState.Pending, PlatformState.Active],
    [PlatformState.Provisioning, PlatformState.Removing],
    [PlatformState.Active, PlatformState.Pending],
    [PlatformState.Removed, PlatformState.Active],
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
      region: PlatformRegion.EuWest,
      type: DeploymentType.Trial,
      hub_status: HubStatus.Pending,
      target_state: PlatformState.Active,
      actual_state: null,
    });
    await expect(
      assertFreeTrialsLimit(PLATFORM_ORGANIZATION_UUID)
    ).rejects.toThrow(AlreadyExistsErrorCode.FreeTrialAlreadyExists);
  });
});
