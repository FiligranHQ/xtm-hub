import { afterEach, describe, expect, it } from 'vitest';
import { db } from '../../../../knexfile';
import { TEST_ORGANIZATIONS } from '../../../../tests/tests.const';
import {
  DeploymentRequestActivitySector,
  DeploymentRequestDeploymentType,
  DeploymentRequestHubStatus,
  DeploymentRequestPlatformRegion,
  DeploymentRequestPlatformState,
  DeploymentRequestUseCase,
  PlatformIdentifier,
} from '../../../__generated__/resolvers-types';
import DeploymentRequestQuota from '../../../model/kanel/public/DeploymentRequestQuota';
import { ErrorCode } from '../../../utils/error/error.code';
import { deleteSubscription } from '../../subcription/subscription.helper';
import { deleteServiceInstanceBy } from '../service-instance.domain';
import { DeploymentsApp } from './deployments.app';
import { DeploymentRequestDomain } from './deployments.domain';
import resolver from './deployments.resolver';

describe('Deployment app', () => {
  afterEach(async () => {
    await DeploymentRequestDomain.deleteDeploymentRequestBy({});
    await deleteServiceInstanceBy({});
    await deleteSubscription({});
  });
  describe('createDeploymentRequest', () => {
    it('should return the deployment request created', async () => {
      const deployment = await resolver.Mutation.createDeploymentRequest(
        undefined,
        {
          input: {
            activity_sector:
              DeploymentRequestActivitySector.ComputerNetworkSecurity,
            job_title: 'myJob',
            use_case: DeploymentRequestUseCase.ThreatHunting,
            platform_identifier: PlatformIdentifier.Opencti,
            region: DeploymentRequestPlatformRegion.UsEast,
            type: DeploymentRequestDeploymentType.Trial,
          },
        }
      );
      expect(deployment).toMatchObject({
        activity_sector:
          DeploymentRequestActivitySector.ComputerNetworkSecurity,
        job_title: 'myJob',
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
    it('should return the updated deployment request', async () => {
      const initialDeployment = await DeploymentsApp.createDeploymentRequest({
        activity_sector:
          DeploymentRequestActivitySector.ComputerNetworkSecurity,
        job_title: 'myJob',
        use_case: DeploymentRequestUseCase.ThreatHunting,
        platform_identifier: PlatformIdentifier.Opencti,
        region: DeploymentRequestPlatformRegion.UsEast,
        type: DeploymentRequestDeploymentType.Trial,
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
        job_title: 'myJob',
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
        organization_name: TEST_ORGANIZATIONS.FILIGRAN.NAME,
        organization_domains: [
          TEST_ORGANIZATIONS.FILIGRAN.DOMAINS.FIRST,
          TEST_ORGANIZATIONS.FILIGRAN.DOMAINS.SECOND,
        ],
        requester_email: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.EMAIL,
        requester_first_name:
          TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.FIRST_NAME,
        requester_last_name: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.LAST_NAME,
      });
    });
    it('should return an error when status transition is not allowed', async () => {
      const initialDeployment = await DeploymentsApp.createDeploymentRequest({
        activity_sector:
          DeploymentRequestActivitySector.ComputerNetworkSecurity,
        job_title: 'myJob',
        use_case: DeploymentRequestUseCase.ThreatHunting,
        platform_identifier: PlatformIdentifier.Opencti,
        region: DeploymentRequestPlatformRegion.UsEast,
        type: DeploymentRequestDeploymentType.Trial,
      });
      const updates = {
        id: initialDeployment.id,
        actual_state: DeploymentRequestPlatformState.Removed,
      };

      const call = resolver.Mutation.updateDeploymentRequest(undefined, {
        input: updates,
      });

      await expect(call).rejects.toThrow(
        ErrorCode.DeploymentRequestStatusUpdateNotAllowed
      );
    });
  });
  describe('deploymentRequestsAvailable', () => {
    it('should return the available deployment request', async () => {
      await db<DeploymentRequestQuota>('DeploymentRequestQuota')
        .update({
          availability: 10,
        })
        .whereIn('region', [
          DeploymentRequestPlatformRegion.ApacAu,
          DeploymentRequestPlatformRegion.ApacSg,
        ]);

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
