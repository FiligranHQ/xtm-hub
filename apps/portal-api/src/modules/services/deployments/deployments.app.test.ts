import { describe, expect, it } from 'vitest';
import { contextAdminUser } from '../../../../tests/tests.const';
import {
  DeploymentRequestStatus,
  DeploymentType,
  PlatformIdentifier,
  PlatformRegion,
  ServiceInstanceCreationStatus,
} from '../../../__generated__/resolvers-types';
import { DeploymentRequestId } from '../../../model/kanel/public/DeploymentRequest';
import ServiceInstance from '../../../model/kanel/public/ServiceInstance';
import { ADMIN_UUID, PLATFORM_ORGANIZATION_UUID } from '../../../portal.const';
import { loadServiceInstanceBy } from '../service-instance.domain';
import { DeploymentsApp } from './deployments.app';
import { loadDeploymentRequestBy } from './deployments.domain';

describe('Deployment app', () => {
  describe('createDeploymentRequest', () => {
    it('should create a deployment request with associated registration', async () => {
      const deployment = await DeploymentsApp.createDeployment({
        activity_sector: 'cybersecurity',
        job_title: 'myJob',
        use_case: 'use_case',
        platform_identifier: PlatformIdentifier.Opencti,
        region: PlatformRegion.Us,
        type: DeploymentType.Trial,
      });

      const dbDeploymentRequest = await loadDeploymentRequestBy({
        id: deployment.id as DeploymentRequestId,
      });
      expect(dbDeploymentRequest).toMatchObject({
        activity_sector: 'cybersecurity',
        id: expect.any(String),
        job_title: 'myJob',
        organization_requester_id: PLATFORM_ORGANIZATION_UUID,
        platform_identifier: PlatformIdentifier.Opencti,
        platform_token: expect.any(String),
        region: PlatformRegion.Us,
        request_date: expect.any(Date),
        service_instance_id: expect.any(String),
        status: DeploymentRequestStatus.Pending,
        type: DeploymentType.Trial,
        use_case: 'use_case',
        user_requester_id: ADMIN_UUID,
      });

      const serviceInstance: ServiceInstance = await loadServiceInstanceBy(
        contextAdminUser,
        'id',
        dbDeploymentRequest.service_instance_id
      );
      expect(serviceInstance.creation_status).toBe(
        ServiceInstanceCreationStatus.Pending
      );
    });
  });
});
