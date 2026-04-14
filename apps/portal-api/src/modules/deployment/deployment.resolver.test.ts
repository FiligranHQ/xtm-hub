import { afterEach, beforeEach, describe, expect, it } from 'vitest';
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
} from '../../__generated__/resolvers-types';
import { requestContext } from '../../context/request.context';
import DeploymentRequestQuota from '../../model/kanel/public/DeploymentRequestQuota';
import { ErrorCode } from '../../utils/error/error.code';
import { deleteServiceInstanceBy } from '../service/instance/service-instance.domain';
import { deleteSubscription } from '../subscription/subscription.helper';
import { DeploymentApp } from './deployment.app';
import { DeploymentRequestDomain } from './deployment.domain';
import resolver from './deployment.resolver';

describe('Deployment resolver', () => {
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

      await expect(call).rejects.toThrow(
        ErrorCode.DeploymentRequestStatusUpdateNotAllowed
      );
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
