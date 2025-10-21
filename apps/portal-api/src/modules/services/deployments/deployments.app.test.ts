import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { db } from '../../../../knexfile';
import {
  contextAdminUser,
  DEFAULT_ADMIN_EMAIL,
  SERVICE_OPENCTI_REGISTRATION,
} from '../../../../tests/tests.const';
import {
  DeploymentRequestFilterKey,
  DeploymentRequestStatus,
  DeploymentType,
  PlatformIdentifier,
  PlatformRegion,
  ServiceInstanceCreationStatus,
} from '../../../__generated__/resolvers-types';
import {
  DeploymentRequestId,
  DeploymentRequestInitializer,
} from '../../../model/kanel/public/DeploymentRequest';
import ServiceInstance, {
  ServiceInstanceId,
} from '../../../model/kanel/public/ServiceInstance';
import { ADMIN_UUID, PLATFORM_ORGANIZATION_UUID } from '../../../portal.const';
import { serviceInstanceTagMappedByPlatformIdentifier } from '../registration/registration.mapping';
import { loadServiceInstanceBy } from '../service-instance.domain';
import { DeploymentsApp } from './deployments.app';
import { DeploymentRequestDomain } from './deployments.domain';

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

      const dbDeploymentRequest =
        await DeploymentRequestDomain.loadDeploymentRequestBy({
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

      await DeploymentRequestDomain.deleteDeploymentRequestBy({
        id: deployment?.id as DeploymentRequestId,
      });
    });
  });
  describe('loadDeploymentRequests', () => {
    async function insertOpenCtiDeploymentRequest(
      deploymentRequest: Partial<DeploymentRequestInitializer>
    ) {
      const serviceInstanceId = uuidv4();
      await db('ServiceInstance').insert([
        {
          id: serviceInstanceId,
          name: 'serviceInstance1',
          description: '',
          creation_status: ServiceInstanceCreationStatus.Pending,
          public: false,
          join_type: 'JOIN_AUTO',
          tags: [
            serviceInstanceTagMappedByPlatformIdentifier[
              PlatformIdentifier.Opencti
            ],
          ],
          service_definition_id: SERVICE_OPENCTI_REGISTRATION,
        },
      ]);
      const defaultDeploymentRequestValues = {
        activity_sector: 'cybersecurity',
        id: uuidv4() as DeploymentRequestId,
        job_title: 'myJob',
        organization_requester_id: PLATFORM_ORGANIZATION_UUID,
        platform_identifier: PlatformIdentifier.Opencti,
        platform_token: uuidv4(),
        region: PlatformRegion.Us,
        request_date: new Date(Date.UTC(2025, 1, 3, 13, 12, 15)),
        status: DeploymentRequestStatus.Pending,
        type: DeploymentType.Trial,
        use_case: 'use_case',
        service_instance_id: serviceInstanceId as ServiceInstanceId,
        user_requester_id: ADMIN_UUID,
      };
      return await DeploymentRequestDomain.insertDeploymentRequest({
        ...defaultDeploymentRequestValues,
        ...deploymentRequest,
      });
    }

    it('should return created deployment requests', async () => {
      const deploymentRequest = await insertOpenCtiDeploymentRequest({});

      const deployments = await DeploymentsApp.loadDeploymentRequests({
        first: 10,
      });

      expect(deployments.totalCount).toBe('1');
      expect(deployments.edges[0]?.node).toStrictEqual({
        ...deploymentRequest,
        organization_name: 'Filigran',
        organization_domains: ['filigran.io', 'internal.com'],
        requester_email: DEFAULT_ADMIN_EMAIL,
      });

      await DeploymentRequestDomain.deleteDeploymentRequestBy({
        id: deploymentRequest?.id,
      });
    });

    it('should return pending deployment requests if nothing specified', async () => {
      const deploymentRequest = await insertOpenCtiDeploymentRequest({
        status: DeploymentRequestStatus.Expired,
      });

      const deployments = await DeploymentsApp.loadDeploymentRequests({
        first: 10,
      });

      expect(deployments.totalCount).toBe('0');
      expect(deployments.edges.length).toBe(0);

      await DeploymentRequestDomain.deleteDeploymentRequestBy({
        id: deploymentRequest?.id,
      });
    });

    it('should return filtered deployment requests only', async () => {
      const deploymentRequest1 = await insertOpenCtiDeploymentRequest({});
      const deploymentRequest2 = await insertOpenCtiDeploymentRequest({
        region: PlatformRegion.Europe,
        status: DeploymentRequestStatus.Active,
      });
      const deploymentRequest3 = await insertOpenCtiDeploymentRequest({
        platform_identifier: PlatformIdentifier.Openaev,
        status: DeploymentRequestStatus.Active,
      });

      const deployments = await DeploymentsApp.loadDeploymentRequests({
        first: 10,
        filters: [
          {
            key: DeploymentRequestFilterKey.Region,
            value: [PlatformRegion.Us],
          },
          {
            key: DeploymentRequestFilterKey.Status,
            value: [DeploymentRequestStatus.Active],
          },
          {
            key: DeploymentRequestFilterKey.PlatformIdentifier,
            value: [PlatformIdentifier.Opencti],
          },
        ],
      });

      expect(deployments.totalCount).toBe('0');
      expect(deployments.edges.length).toBe(0);

      await DeploymentRequestDomain.deleteDeploymentRequestBy({
        id: deploymentRequest1?.id,
      });
      await DeploymentRequestDomain.deleteDeploymentRequestBy({
        id: deploymentRequest2?.id,
      });
      await DeploymentRequestDomain.deleteDeploymentRequestBy({
        id: deploymentRequest3?.id,
      });
    });
  });
});
