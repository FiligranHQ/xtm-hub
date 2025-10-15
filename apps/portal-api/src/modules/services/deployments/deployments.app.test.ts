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
        intention: 'test',
        job_title: 'myJob',
        use_case: 'use_case',
        platform_identifier: PlatformIdentifier.Opencti,
        region: PlatformRegion.Us,
        type: DeploymentType.Trial,
      });

      const dbDeploymentRequest = await loadDeploymentRequestBy({
        id: deployment.id as DeploymentRequestId,
      });
      expect(dbDeploymentRequest.type).toBe(DeploymentType.Trial);
      expect(dbDeploymentRequest.platform_identifier).toBe(
        PlatformIdentifier.Opencti
      );
      expect(dbDeploymentRequest.region).toBe(PlatformRegion.Us);
      expect(dbDeploymentRequest.intention).toBe('test');
      expect(dbDeploymentRequest.job_title).toBe('myJob');
      expect(dbDeploymentRequest.activity_sector).toBe('cybersecurity');
      expect(dbDeploymentRequest.use_case).toBe('use_case');
      expect(dbDeploymentRequest.status).toBe(DeploymentRequestStatus.Pending);
      expect(dbDeploymentRequest.platform_token).toBeDefined();
      expect(dbDeploymentRequest.request_date).toBeDefined();
      expect(dbDeploymentRequest.organization_requester_id).toBe(
        PLATFORM_ORGANIZATION_UUID
      );
      expect(dbDeploymentRequest.user_requester_id).toBe(ADMIN_UUID);

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
