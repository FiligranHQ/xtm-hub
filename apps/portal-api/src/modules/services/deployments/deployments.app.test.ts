import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
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
import DeploymentRequest, {
  DeploymentRequestId,
  DeploymentRequestInitializer,
} from '../../../model/kanel/public/DeploymentRequest';
import ServiceInstance, {
  ServiceInstanceId,
} from '../../../model/kanel/public/ServiceInstance';
import { ADMIN_UUID, PLATFORM_ORGANIZATION_UUID } from '../../../portal.const';
import {
  BadRequestErrorCode,
  NotFoundErrorCode,
} from '../../../utils/error/error.code';
import { loadSubscriptionBy } from '../../subcription/subscription.domain';
import {
  deleteSubscriptionUnsecure,
  insertUnsecureSubscription,
} from '../../subcription/subscription.helper';
import { serviceInstanceTagMappedByPlatformIdentifier } from '../registration/registration.mapping';
import {
  deleteServiceInstanceBy,
  insertServiceInstance,
  loadServiceInstanceBy,
} from '../service-instance.domain';
import { DeploymentsApp } from './deployments.app';
import { DeploymentRequestDomain } from './deployments.domain';

async function insertOpenCtiDeploymentRequest(
  deploymentRequest: Partial<DeploymentRequestInitializer>
) {
  const serviceInstanceId = uuidv4() as ServiceInstanceId;
  await insertServiceInstance({
    id: serviceInstanceId,
    name: 'serviceInstance1',
    description: '',
    creation_status: ServiceInstanceCreationStatus.Pending,
    public: false,
    join_type: 'JOIN_AUTO',
    tags: [
      serviceInstanceTagMappedByPlatformIdentifier[PlatformIdentifier.Opencti],
    ],
    service_definition_id: SERVICE_OPENCTI_REGISTRATION,
  });
  await insertUnsecureSubscription({
    id: uuidv4(),
    organization_id: PLATFORM_ORGANIZATION_UUID,
    service_instance_id: serviceInstanceId,
  });
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

describe('Deployment app', () => {
  afterEach(async () => {
    await DeploymentRequestDomain.deleteDeploymentRequestBy({});
    await deleteServiceInstanceBy({});
    await deleteSubscriptionUnsecure({});
  });
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
    });
  });
  describe('loadDeploymentRequests', () => {
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
    });

    it('should return pending deployment requests if nothing specified', async () => {
      await insertOpenCtiDeploymentRequest({
        status: DeploymentRequestStatus.Expired,
      });

      const deployments = await DeploymentsApp.loadDeploymentRequests({
        first: 10,
      });

      expect(deployments.totalCount).toBe('0');
      expect(deployments.edges.length).toBe(0);
    });

    it('should return pending deployment requests even if other filters are specified', async () => {
      await insertOpenCtiDeploymentRequest({});
      await insertOpenCtiDeploymentRequest({
        status: DeploymentRequestStatus.Expired,
      });

      const deployments = await DeploymentsApp.loadDeploymentRequests({
        first: 10,
        filters: [
          {
            key: DeploymentRequestFilterKey.Region,
            value: [PlatformRegion.Us],
          },
        ],
      });

      expect(deployments.totalCount).toBe('1');
      expect(deployments.edges.length).toBe(1);
      expect(deployments.edges[0]?.node?.status).toBe(
        DeploymentRequestStatus.Pending
      );
    });

    it('should return filtered deployment requests only', async () => {
      await insertOpenCtiDeploymentRequest({});
      await insertOpenCtiDeploymentRequest({
        region: PlatformRegion.Europe,
        status: DeploymentRequestStatus.Active,
      });
      await insertOpenCtiDeploymentRequest({
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
    });
  });
  describe('updateDeploymentRequest', () => {
    let initialDeployment: DeploymentRequest;
    beforeEach(async () => {
      initialDeployment = (await insertOpenCtiDeploymentRequest({
        status: DeploymentRequestStatus.Provisioning,
      })) as DeploymentRequest;
    });

    it('should update a deployment request', async () => {
      const deployment = await DeploymentsApp.updateDeployment({
        id: initialDeployment?.id as string,
        status: DeploymentRequestStatus.Active,
        start_date: new Date(2025, 1, 3),
        end_date: new Date(2025, 2, 3),
        product_service_instance_id: 'fake product instance id',
        failure_reason: 'not failed',
      });

      const dbDeploymentRequest =
        await DeploymentRequestDomain.loadDeploymentRequestBy({
          id: deployment.id as DeploymentRequestId,
        });
      const serviceInstance: ServiceInstance = await loadServiceInstanceBy(
        contextAdminUser,
        'id',
        dbDeploymentRequest.service_instance_id
      );
      const subscription = await loadSubscriptionBy({
        service_instance_id: dbDeploymentRequest.service_instance_id,
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
        status: DeploymentRequestStatus.Active,
        type: DeploymentType.Trial,
        use_case: 'use_case',
        user_requester_id: ADMIN_UUID,
        failure_reason: 'not failed',
        start_date: new Date(2025, 1, 3),
        end_date: new Date(2025, 2, 3),
        product_service_instance_id: 'fake product instance id',
      });
      expect(serviceInstance.creation_status).toBe(
        ServiceInstanceCreationStatus.Pending
      );
      expect(subscription?.start_date).toStrictEqual(
        dbDeploymentRequest.start_date
      );
      expect(subscription?.end_date).toStrictEqual(
        dbDeploymentRequest.end_date
      );
    });
    it('should should throw if deployment request does not exist', async () => {
      const call = DeploymentsApp.updateDeployment({
        id: uuidv4(),
        status: DeploymentRequestStatus.Active,
      });
      await expect(call).rejects.toThrow(
        NotFoundErrorCode.DeploymentRequestNotFound
      );
    });
    it.each([
      {
        start_date: undefined,
        end_date: undefined,
        description: 'both dates missing',
      },
      {
        start_date: undefined,
        end_date: new Date(),
        description: 'start date missing',
      },
      {
        start_date: new Date(),
        end_date: undefined,
        description: 'end date missing',
      },
    ])(
      'should throw if status active and $description',
      async ({ start_date, end_date }) => {
        const call = DeploymentsApp.updateDeployment({
          id: initialDeployment.id,
          status: DeploymentRequestStatus.Active,
          start_date,
          end_date,
        });

        await expect(call).rejects.toThrow(
          BadRequestErrorCode.MissingStartOrEndDate
        );
      }
    );
    it('should should throw if status requested is not allowed', async () => {
      const call = DeploymentsApp.updateDeployment({
        id: initialDeployment?.id as string,
        status: DeploymentRequestStatus.Queued,
      });
      await expect(call).rejects.toThrow(
        BadRequestErrorCode.DeploymentRequestStatusUpdateNotAllowed
      );
    });
  });
});
