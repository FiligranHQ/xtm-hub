import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_ADMIN_EMAIL } from '../../../../tests/tests.const';
import {
  DeploymentType,
  HubStatus,
  PlatformIdentifier,
  PlatformRegion,
  PlatformState,
} from '../../../__generated__/resolvers-types';
import { ErrorCode } from '../../../utils/error/error.code';
import { deleteSubscriptionUnsecure } from '../../subcription/subscription.helper';
import { deleteServiceInstanceBy } from '../service-instance.domain';
import { DeploymentsApp } from './deployments.app';
import { DeploymentRequestDomain } from './deployments.domain';
import resolver from './deployments.resolver';

describe('Deployment app', () => {
  afterEach(async () => {
    await DeploymentRequestDomain.deleteDeploymentRequestBy({});
    await deleteServiceInstanceBy({});
    await deleteSubscriptionUnsecure({});
  });
  describe('createDeploymentRequest', () => {
    it('should return the deployment request created', async () => {
      const deployment = await resolver.Mutation.createDeploymentRequest(
        undefined,
        {
          input: {
            activity_sector: 'cybersecurity',
            job_title: 'myJob',
            use_case: 'use_case',
            platform_identifier: PlatformIdentifier.Opencti,
            region: PlatformRegion.Us,
            type: DeploymentType.Trial,
          },
        }
      );
      expect(deployment).toMatchObject({
        activity_sector: 'cybersecurity',
        job_title: 'myJob',
        use_case: 'use_case',
        platform_identifier: PlatformIdentifier.Opencti,
        region: PlatformRegion.Us,
        type: DeploymentType.Trial,
        hub_status: HubStatus.Pending,
        target_state: null,
        actual_state: null,
      });
    });
  });

  describe('updateDeploymentRequest', () => {
    it('should return the updated deployment request', async () => {
      const initialDeploymentData = {
        activity_sector: 'cybersecurity',
        job_title: 'myJob',
        use_case: 'use_case',
        platform_identifier: PlatformIdentifier.Opencti,
        region: PlatformRegion.Us,
        type: DeploymentType.Trial,
        hub_status: HubStatus.Pending,
      };
      const initialDeployment = await DeploymentsApp.createDeploymentRequest(
        initialDeploymentData
      );
      const updates = {
        id: initialDeployment.id,
        actual_state: PlatformState.Active,
        start_date: new Date(2025, 1, 3),
        end_date: new Date(2025, 2, 3),
        product_platform_id: 'fake product instance id',
        failure_reason: 'not failed',
      };

      const updatedDeployment = await resolver.Mutation.updateDeploymentRequest(
        undefined,
        { input: updates }
      );
      expect(updatedDeployment).toMatchObject({
        activity_sector: 'cybersecurity',
        job_title: 'myJob',
        use_case: 'use_case',
        platform_identifier: PlatformIdentifier.Opencti,
        region: PlatformRegion.Us,
        type: DeploymentType.Trial,
        hub_status: HubStatus.Pending,
        target_state: PlatformState.Active,
        actual_state: PlatformState.Active,
        start_date: new Date(2025, 1, 3),
        end_date: new Date(2025, 2, 3),
        product_platform_id: 'fake product instance id',
        failure_reason: 'not failed',
        organization_name: 'Filigran',
        organization_domains: ['filigran.io', 'internal.com'],
        requester_email: DEFAULT_ADMIN_EMAIL,
        requester_first_name: 'firstname',
        requester_last_name: 'lastname',
      });
    });
    it('should return an error when hub status transition is not allowed', async () => {
      const initialDeploymentData = {
        activity_sector: 'cybersecurity',
        job_title: 'myJob',
        use_case: 'use_case',
        platform_identifier: PlatformIdentifier.Opencti,
        region: PlatformRegion.Us,
        type: DeploymentType.Trial,
        hub_status: HubStatus.Pending,
      };
      const initialDeployment = await DeploymentsApp.createDeploymentRequest(
        initialDeploymentData
      );
      const updates = {
        id: initialDeployment.id,
        hub_status: HubStatus.Expired,
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
      const availableDeployments =
        await resolver.Query.deploymentRequestsAvailable(undefined, {
          platformIdentifier: PlatformIdentifier.Opencti,
        });

      expect(availableDeployments).toStrictEqual([
        { region: PlatformRegion.Apac, availableCount: 10 },
        { region: PlatformRegion.Europe, availableCount: 10 },
        { region: PlatformRegion.Us, availableCount: 10 },
      ]);
    });
  });
});
