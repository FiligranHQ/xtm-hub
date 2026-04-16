import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../../knexfile';
import {
  requestContextRegistererUserSecondOrga,
  TEST_ORGANIZATIONS,
} from '../../../tests/tests.const';
import {
  DeploymentRequestActivitySector,
  DeploymentRequestDeploymentType,
  DeploymentRequestHubStatus,
  DeploymentRequestJobTitle,
  DeploymentRequestPlatformRegion,
  DeploymentRequestPlatformState,
  DeploymentRequestSource,
  DeploymentRequestUseCase,
  PlatformIdentifier,
  ReorderDeploymentRequestInQueueDirection,
} from '../../__generated__/resolvers-types';
import { requestContext } from '../../context/request.context';
import DeploymentRequestQuota from '../../model/kanel/public/DeploymentRequestQuota';
import { ErrorCode } from '../../utils/error/error.code';
import { ErrorType } from '../../utils/error/error.type';
import { deleteServiceInstanceBy } from '../service/instance/service-instance.domain';
import { deleteSubscription } from '../subscription/subscription.helper';
import { DeploymentApp } from './deployment.app';
import { DeploymentRequestDomain } from './deployment.domain';
import resolver from './deployment.resolver';

describe('deployment resolver', () => {
  afterEach(async () => {
    await DeploymentRequestDomain.deleteDeploymentRequestBy({});
    await deleteServiceInstanceBy({});
    await deleteSubscription({});
  });
  describe('createDeploymentRequest', () => {
    beforeEach(() => {
      requestContext.set(requestContextRegistererUserSecondOrga);
    });
    it('should return the deployment request created', async () => {
      const deployment = await resolver.Mutation.createDeploymentRequest(
        undefined,
        {
          input: {
            activity_sector:
              DeploymentRequestActivitySector.ComputerNetworkSecurity,
            job_title: DeploymentRequestJobTitle.CybersecurityEngineer,
            use_case: DeploymentRequestUseCase.ThreatHunting,
            platform_identifier: PlatformIdentifier.Opencti,
            region: DeploymentRequestPlatformRegion.UsEast,
            type: DeploymentRequestDeploymentType.Trial,
            source: DeploymentRequestSource.Xtmhub,
          },
        }
      );
      expect(deployment).toMatchObject({
        activity_sector:
          DeploymentRequestActivitySector.ComputerNetworkSecurity,
        job_title: DeploymentRequestJobTitle.CybersecurityEngineer,
        use_case: DeploymentRequestUseCase.ThreatHunting,
        platform_identifier: PlatformIdentifier.Opencti,
        region: DeploymentRequestPlatformRegion.UsEast,
        type: DeploymentRequestDeploymentType.Trial,
        hub_status: DeploymentRequestHubStatus.Pending,
        target_state: DeploymentRequestPlatformState.Active,
        actual_state: DeploymentRequestPlatformState.Unprovisioned,
      });
    });
  });

  describe('updateDeploymentRequest', () => {
    beforeEach(() => {
      requestContext.set(requestContextRegistererUserSecondOrga);
    });
    it('should return the updated deployment request', async () => {
      const initialDeployment = await DeploymentApp.createDeploymentRequest({
        activity_sector:
          DeploymentRequestActivitySector.ComputerNetworkSecurity,
        job_title: DeploymentRequestJobTitle.CybersecurityEngineer,
        use_case: DeploymentRequestUseCase.ThreatHunting,
        platform_identifier: PlatformIdentifier.Opencti,
        region: DeploymentRequestPlatformRegion.UsEast,
        type: DeploymentRequestDeploymentType.Trial,
        source: DeploymentRequestSource.Xtmhub,
      });

      expect(initialDeployment).toMatchObject({
        platform_identifier: PlatformIdentifier.Opencti,
        region: DeploymentRequestPlatformRegion.UsEast,
        type: DeploymentRequestDeploymentType.Trial,
        start_date: null,
        end_date: null,
        hub_status: DeploymentRequestHubStatus.Pending,
        target_state: DeploymentRequestPlatformState.Active,
        actual_state: DeploymentRequestPlatformState.Unprovisioned,
      });

      const updatedDeployment = await resolver.Mutation.updateDeploymentRequest(
        undefined,
        {
          input: {
            id: initialDeployment.id,
            actual_state: DeploymentRequestPlatformState.Provisioning,
          },
        }
      );

      expect(updatedDeployment).toMatchObject({
        platform_identifier: PlatformIdentifier.Opencti,
        region: DeploymentRequestPlatformRegion.UsEast,
        type: DeploymentRequestDeploymentType.Trial,
        hub_status: DeploymentRequestHubStatus.Provisioning,
        target_state: DeploymentRequestPlatformState.Active,
        actual_state: DeploymentRequestPlatformState.Provisioning,
        start_date: null,
        end_date: null,
      });

      const updatedActiveDeployment =
        await resolver.Mutation.updateDeploymentRequest(undefined, {
          input: {
            id: initialDeployment.id,
            actual_state: DeploymentRequestPlatformState.Provisioning,
            start_date: new Date(2025, 1, 3),
            end_date: new Date(2025, 2, 3),
            platform_id: 'fake product instance id',
            failure_reason: 'not failed',
          },
        });
      expect(updatedActiveDeployment).toMatchObject({
        activity_sector:
          DeploymentRequestActivitySector.ComputerNetworkSecurity,
        job_title: DeploymentRequestJobTitle.CybersecurityEngineer,
        use_case: DeploymentRequestUseCase.ThreatHunting,
        platform_identifier: PlatformIdentifier.Opencti,
        region: DeploymentRequestPlatformRegion.UsEast,
        type: DeploymentRequestDeploymentType.Trial,
        hub_status: DeploymentRequestHubStatus.Provisioning,
        target_state: DeploymentRequestPlatformState.Active,
        actual_state: DeploymentRequestPlatformState.Provisioning,
        start_date: new Date(2025, 1, 3),
        end_date: new Date(2025, 2, 3),
        platform_id: 'fake product instance id',
        failure_reason: 'not failed',
        organization_name: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.NAME,
        organization_domains: [
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.DOMAINS.FIRST.NAME,
        ],
        requester_email:
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.REGISTERER.EMAIL,
        requester_first_name:
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.REGISTERER.FIRST_NAME,
        requester_last_name:
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.REGISTERER.LAST_NAME,
      });
    });
    it('should return an error when status transition is not allowed', async () => {
      const initialDeployment = await DeploymentApp.createDeploymentRequest({
        activity_sector:
          DeploymentRequestActivitySector.ComputerNetworkSecurity,
        job_title: DeploymentRequestJobTitle.CybersecurityEngineer,
        use_case: DeploymentRequestUseCase.ThreatHunting,
        platform_identifier: PlatformIdentifier.Opencti,
        region: DeploymentRequestPlatformRegion.UsEast,
        type: DeploymentRequestDeploymentType.Trial,
        source: DeploymentRequestSource.Xtmhub,
      });
      const updates = {
        id: initialDeployment.id,
        actual_state: DeploymentRequestPlatformState.Removed,
      };

      const call = resolver.Mutation.updateDeploymentRequest(undefined, {
        input: updates,
      });

      await expect(call).rejects.toMatchObject({
        name: ErrorType.BadRequest,
        message: ErrorCode.DeploymentRequestStatusUpdateNotAllowed,
      });
    });
  });
  describe('deploymentRequestsAvailable', () => {
    it('should return the available deployment request', async () => {
      // eslint-disable-next-line no-restricted-syntax
      await db<DeploymentRequestQuota>('DeploymentRequestQuota')
        .update({
          availability: 10,
        })
        .whereIn('region', [
          DeploymentRequestPlatformRegion.ApacAu,
          DeploymentRequestPlatformRegion.ApacSg,
        ]);

      // eslint-disable-next-line no-restricted-syntax
      await db<DeploymentRequestQuota>('DeploymentRequestQuota')
        .update({
          availability: 20,
        })
        .whereIn('region', [
          DeploymentRequestPlatformRegion.EuWest,
          DeploymentRequestPlatformRegion.UsEast,
        ]);
      const availableDeployments =
        await resolver.Query.deploymentRequestsAvailable(undefined, {
          platformIdentifier: PlatformIdentifier.Opencti,
        });

      expect(availableDeployments).toStrictEqual([
        {
          region: DeploymentRequestPlatformRegion.ApacAu,
          availableCount: 10,
          capacity: 10,
          platform_identifier: PlatformIdentifier.Opencti,
        },
        {
          region: DeploymentRequestPlatformRegion.ApacSg,
          availableCount: 10,
          capacity: 10,
          platform_identifier: PlatformIdentifier.Opencti,
        },
        {
          region: DeploymentRequestPlatformRegion.EuWest,
          availableCount: 20,
          capacity: 20,
          platform_identifier: PlatformIdentifier.Opencti,
        },
        {
          region: DeploymentRequestPlatformRegion.UsEast,
          availableCount: 20,
          capacity: 20,
          platform_identifier: PlatformIdentifier.Opencti,
        },
      ]);
    });
  });
});

describe('deployment resolver — unit tests', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('query.deploymentRequests', () => {
    it('should delegate to DeploymentApp.loadPlatformDeploymentRequests and return result', async () => {
      const expected = { edges: [] } as never;
      vi.spyOn(
        DeploymentApp,
        'loadPlatformDeploymentRequests'
      ).mockResolvedValue(expected);

      const result = await resolver.Query.deploymentRequests(
        undefined,
        {} as never
      );

      expect(result).toEqual(expected);
    });

    it('should map to NotFound for DeploymentRequestNotFound error', async () => {
      vi.spyOn(
        DeploymentApp,
        'loadPlatformDeploymentRequests'
      ).mockRejectedValue(new Error(ErrorCode.DeploymentRequestNotFound));

      const call = resolver.Query.deploymentRequests(undefined, {} as never);
      await expect(call).rejects.toMatchObject({ name: ErrorType.NotFound });
    });
  });

  describe('query.deploymentRequestsList', () => {
    it('should delegate to DeploymentRequestDomain.loadDeploymentRequests', async () => {
      const expected = { edges: [] } as never;
      vi.spyOn(
        DeploymentRequestDomain,
        'loadDeploymentRequests'
      ).mockResolvedValue(expected);

      const result = await resolver.Query.deploymentRequestsList(
        undefined,
        {} as never
      );

      expect(result).toEqual(expected);
    });

    it('should map to BadRequest for DeploymentRequestHubStatusNotQueued error', async () => {
      vi.spyOn(
        DeploymentRequestDomain,
        'loadDeploymentRequests'
      ).mockRejectedValue(
        new Error(ErrorCode.DeploymentRequestHubStatusNotQueued)
      );

      const call = resolver.Query.deploymentRequestsList(
        undefined,
        {} as never
      );
      await expect(call).rejects.toMatchObject({ name: ErrorType.BadRequest });
    });
  });

  describe('query.trialDeployments', () => {
    it('should delegate to DeploymentApp.loadTrialDeployments and return result', async () => {
      const expected = [] as never;
      vi.spyOn(DeploymentApp, 'loadTrialDeployments').mockResolvedValue(
        expected
      );

      const result = await resolver.Query.trialDeployments(undefined, {
        input: {} as never,
      });

      expect(result).toEqual(expected);
    });

    it('should map to NotFound for DeploymentRequestQuotaNotFound error', async () => {
      vi.spyOn(DeploymentApp, 'loadTrialDeployments').mockRejectedValue(
        new Error(ErrorCode.DeploymentRequestQuotaNotFound)
      );

      const call = resolver.Query.trialDeployments(undefined, {
        input: {} as never,
      });
      await expect(call).rejects.toMatchObject({ name: ErrorType.NotFound });
    });
  });

  describe('mutation.cancelDeploymentRequest', () => {
    it('should call DeploymentApp.cancelDeploymentRequest with isAdmin=false', async () => {
      const expected = { id: 'req-1' } as never;
      vi.spyOn(DeploymentApp, 'cancelDeploymentRequest').mockResolvedValue(
        expected
      );

      const result = await resolver.Mutation.cancelDeploymentRequest(
        undefined,
        { deploymentRequestId: 'req-1' as never, cancellationReason: 'reason' }
      );

      expect(DeploymentApp.cancelDeploymentRequest).toHaveBeenCalledWith(
        'req-1',
        false,
        'reason'
      );
      expect(result).toEqual(expected);
    });

    it('should map to ForbiddenAccess for NotAllowedByDeploymentStatus error', async () => {
      vi.spyOn(DeploymentApp, 'cancelDeploymentRequest').mockRejectedValue(
        new Error(ErrorCode.NotAllowedByDeploymentStatus)
      );

      const call = resolver.Mutation.cancelDeploymentRequest(undefined, {
        deploymentRequestId: 'req-1' as never,
        cancellationReason: 'reason',
      });

      await expect(call).rejects.toMatchObject({
        name: ErrorType.ForbiddenAccess,
      });
    });
  });

  describe('mutation.adminCancelDeploymentRequest', () => {
    it('should call DeploymentApp.cancelDeploymentRequest with isAdmin=true', async () => {
      const expected = { id: 'req-1' } as never;
      vi.spyOn(DeploymentApp, 'cancelDeploymentRequest').mockResolvedValue(
        expected
      );

      const result = await resolver.Mutation.adminCancelDeploymentRequest(
        undefined,
        { deploymentRequestId: 'req-1' as never }
      );

      expect(DeploymentApp.cancelDeploymentRequest).toHaveBeenCalledWith(
        'req-1',
        true
      );
      expect(result).toEqual(expected);
    });

    it('should map to BadRequest for DeploymentRequestStatusUpdateNotAllowed error', async () => {
      vi.spyOn(DeploymentApp, 'cancelDeploymentRequest').mockRejectedValue(
        new Error(ErrorCode.DeploymentRequestStatusUpdateNotAllowed)
      );

      const call = resolver.Mutation.adminCancelDeploymentRequest(undefined, {
        deploymentRequestId: 'req-1' as never,
      });

      await expect(call).rejects.toMatchObject({ name: ErrorType.BadRequest });
    });
  });

  describe('mutation.reorderDeploymentRequestInQueue', () => {
    it('should delegate to DeploymentApp.reorderDeploymentRequestInQueue and return result', async () => {
      const expected = { success: true } as never;
      vi.spyOn(
        DeploymentApp,
        'reorderDeploymentRequestInQueue'
      ).mockResolvedValue(expected);
      const input = {
        id: 'req-1' as never,
        direction: ReorderDeploymentRequestInQueueDirection.Up,
      };

      const result = await resolver.Mutation.reorderDeploymentRequestInQueue(
        undefined,
        { input }
      );

      expect(
        DeploymentApp.reorderDeploymentRequestInQueue
      ).toHaveBeenCalledWith(input);
      expect(result).toEqual(expected);
    });
  });

  describe('mutation.updateDeploymentQuotaCapacity', () => {
    it('should delegate to DeploymentApp.updateDeploymentQuotaCapacity and return result', async () => {
      const expected = { success: true } as never;
      vi.spyOn(
        DeploymentApp,
        'updateDeploymentQuotaCapacity'
      ).mockResolvedValue(expected);
      const input = {
        region: DeploymentRequestPlatformRegion.UsEast,
        capacity: 10,
        platform_identifier: PlatformIdentifier.Opencti,
      };

      const result = await resolver.Mutation.updateDeploymentQuotaCapacity(
        undefined,
        { input }
      );

      expect(DeploymentApp.updateDeploymentQuotaCapacity).toHaveBeenCalledWith(
        input
      );
      expect(result).toEqual(expected);
    });
  });
});
