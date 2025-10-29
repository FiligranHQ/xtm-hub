import { describe, expect, it } from 'vitest';
import {
  DeploymentRequestStatus,
  DeploymentType,
  PlatformIdentifier,
  PlatformRegion,
} from '../../../__generated__/resolvers-types';
import { ErrorCode } from '../../../utils/error/error.code';
import { DeploymentsApp } from './deployments.app';
import resolver from './deployments.resolver';

describe('Deployment app', () => {
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
        status: DeploymentRequestStatus.Pending,
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
      };
      const initialDeployment = await DeploymentsApp.createDeploymentRequest(
        initialDeploymentData
      );
      const updates = {
        id: initialDeployment.id,
        status: DeploymentRequestStatus.Provisioning,
        start_date: new Date(2025, 1, 3),
        end_date: new Date(2025, 2, 3),
        product_service_instance_id: 'fake product instance id',
        failure_reason: 'not failed',
      };

      const updatedDeployment = await resolver.Mutation.updateDeploymentRequest(
        undefined,
        { input: updates }
      );
      expect(updatedDeployment).toMatchObject({
        ...initialDeploymentData,
        ...updates,
      });
    });
    it('should return an error when status transition is not allowed', async () => {
      const initialDeploymentData = {
        activity_sector: 'cybersecurity',
        job_title: 'myJob',
        use_case: 'use_case',
        platform_identifier: PlatformIdentifier.Opencti,
        region: PlatformRegion.Us,
        type: DeploymentType.Trial,
      };
      const initialDeployment = await DeploymentsApp.createDeploymentRequest(
        initialDeploymentData
      );
      const updates = {
        id: initialDeployment.id,
        status: DeploymentRequestStatus.Queued,
      };

      const call = resolver.Mutation.updateDeploymentRequest(undefined, {
        input: updates,
      });
      await expect(call).rejects.toThrow(
        ErrorCode.DeploymentRequestStatusUpdateNotAllowed
      );
    });
  });
});
