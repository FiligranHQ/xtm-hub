import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import { DeploymentRequestStatus } from '../../../__generated__/resolvers-types';
import DeploymentRequest from '../../../model/kanel/public/DeploymentRequest';
import { PLATFORM_ORGANIZATION_UUID } from '../../../portal.const';
import { AlreadyExistsErrorCode } from '../../../utils/error/error.code';
import { DeploymentRequestDomain } from './deployments.domain';
import { assertFreeTrialsLimit, isTransitionValid } from './deployments.helper';

describe('isTransitionValid', () => {
  const validTransitions = [
    [DeploymentRequestStatus.Queued, DeploymentRequestStatus.Pending],
    [DeploymentRequestStatus.Queued, DeploymentRequestStatus.Cancelled],
    [DeploymentRequestStatus.Pending, DeploymentRequestStatus.Provisioning],
    [DeploymentRequestStatus.Pending, DeploymentRequestStatus.Failed],
    [DeploymentRequestStatus.Pending, DeploymentRequestStatus.Cancelled],
    [DeploymentRequestStatus.Provisioning, DeploymentRequestStatus.Active],
    [DeploymentRequestStatus.Provisioning, DeploymentRequestStatus.Failed],
    [DeploymentRequestStatus.Active, DeploymentRequestStatus.Expired],
  ] as const;

  it.each(validTransitions)(
    'should allow valid transition: %s to %s',
    (from, to) => {
      expect(isTransitionValid(from, to)).toBe(true);
    }
  );

  const invalidTransitions = [
    [DeploymentRequestStatus.Queued, DeploymentRequestStatus.Active],
    [DeploymentRequestStatus.Active, DeploymentRequestStatus.Pending],
    [DeploymentRequestStatus.Expired, DeploymentRequestStatus.Active],
    [DeploymentRequestStatus.Failed, DeploymentRequestStatus.Active],
    [DeploymentRequestStatus.Cancelled, DeploymentRequestStatus.Active],
  ] as const;

  it.each(invalidTransitions)(
    'should reject invalid transition: %s to %s',
    (from, to) => {
      expect(isTransitionValid(from, to)).toBe(false);
    }
  );

  it('should allow same-status transitions', () => {
    const allStatuses = Object.values(DeploymentRequestStatus);
    allStatuses.forEach((status) => {
      expect(isTransitionValid(status, status)).toBe(true);
    });
  });
});
describe('assertFreeTrialsLimit', () => {
  it('should not throw if there is no trial for the organization', async () => {
    vi.spyOn(
      DeploymentRequestDomain,
      'loadDeploymentRequestBy'
    ).mockResolvedValue(undefined);

    await expect(
      assertFreeTrialsLimit(PLATFORM_ORGANIZATION_UUID)
    ).resolves.not.toThrow();
  });
  it('should throw if there is more than one trial for an organization', async () => {
    vi.spyOn(
      DeploymentRequestDomain,
      'loadDeploymentRequestBy'
    ).mockResolvedValue({
      id: uuidv4,
    } as unknown as DeploymentRequest);
    await expect(
      assertFreeTrialsLimit(PLATFORM_ORGANIZATION_UUID)
    ).rejects.toThrow(AlreadyExistsErrorCode.FreeTrialAlreadyExists);
  });
});
