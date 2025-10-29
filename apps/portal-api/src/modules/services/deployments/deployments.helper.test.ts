import { describe, expect, it } from 'vitest';
import { DeploymentRequestStatus } from '../../../__generated__/resolvers-types';
import { isTransitionValid } from './deployments.helper';

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
