import config from 'config';
import { v4 as uuidv4 } from 'uuid';
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  ADMIN_USER_ID,
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
import {
  ADMIN_UUID,
  PLATFORM_NAME,
  PLATFORM_ORGANIZATION_UUID,
} from '../../../portal.const';
import * as mailService from '../../../server/mail-service';
import {
  BadRequestErrorCode,
  NotFoundErrorCode,
} from '../../../utils/error/error.code';
import { loadSubscriptionBy } from '../../subcription/subscription.domain';
import {
  deleteSubscriptionUnsecure,
  insertUnsecureSubscription,
} from '../../subcription/subscription.helper';
import { telemetryApp } from '../../telemetry/telemetry.app';
import {
  TELEMETRY_SOURCE,
  TelemetryOrganizationType,
} from '../../telemetry/telemetry.const';
import { TelemetryEventType } from '../../telemetry/telemetry.types';
import { ServiceGroupDomain } from '../group/service-group.domain';
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
  const telemetrySpy = vi
    .spyOn(telemetryApp, 'sendTelemetryEvent')
    .mockResolvedValue();
  const mockSendMail = vi.spyOn(mailService, 'sendMail');

  afterEach(async () => {
    await DeploymentRequestDomain.deleteDeploymentRequestBy({});
    await deleteServiceInstanceBy({});
    await deleteSubscriptionUnsecure({});
    vi.resetAllMocks();
  });

  afterAll(async () => {
    vi.useRealTimers();
  });

  describe('createDeploymentRequest', () => {
    it('should create a deployment request with associated registration', async () => {
      const deployment = await DeploymentsApp.createDeploymentRequest({
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
        'id',
        dbDeploymentRequest.service_instance_id
      );
      expect(serviceInstance.creation_status).toBe(
        ServiceInstanceCreationStatus.Pending
      );
    });
    it('should create a deployment request with queued status if specified', async () => {
      const deployment = await DeploymentsApp.createDeploymentRequest({
        activity_sector: 'cybersecurity',
        job_title: 'myJob',
        use_case: 'use_case',
        platform_identifier: PlatformIdentifier.Opencti,
        region: PlatformRegion.Us,
        type: DeploymentType.Trial,
        status: DeploymentRequestStatus.Queued,
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
        status: DeploymentRequestStatus.Queued,
        type: DeploymentType.Trial,
        use_case: 'use_case',
        user_requester_id: ADMIN_UUID,
      });
      const serviceInstance: ServiceInstance = await loadServiceInstanceBy(
        'id',
        dbDeploymentRequest.service_instance_id
      );
      expect(serviceInstance.creation_status).toBe(
        ServiceInstanceCreationStatus.Disabled
      );
    });
    it('should throw if an invalid status is specified', async () => {
      const call = DeploymentsApp.createDeploymentRequest({
        activity_sector: 'cybersecurity',
        job_title: 'myJob',
        use_case: 'use_case',
        platform_identifier: PlatformIdentifier.Opencti,
        region: PlatformRegion.Us,
        type: DeploymentType.Trial,
        status: DeploymentRequestStatus.Active,
      });
      await expect(call).rejects.toThrow(BadRequestErrorCode.InvalidStatus);
    });
    describe('telemetry', () => {
      it('should send a telemetry event', async () => {
        vi.useFakeTimers();
        const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
        vi.setSystemTime(date);

        const deployment = await DeploymentsApp.createDeploymentRequest({
          activity_sector: 'cybersecurity',
          job_title: 'myJob',
          use_case: 'use_case',
          platform_identifier: PlatformIdentifier.Opencti,
          region: PlatformRegion.Us,
          type: DeploymentType.Trial,
        });

        expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
          '@timestamp': '2025-02-03T13:12:15.000Z',
          event_type: TelemetryEventType.CREATE_DEPLOYMENT,
          organization_id: PLATFORM_ORGANIZATION_UUID,
          organization_name: PLATFORM_NAME,
          organization_type: TelemetryOrganizationType.PROFESSIONAL,
          source: TELEMETRY_SOURCE,
          email: DEFAULT_ADMIN_EMAIL,
          job_title: 'myJob',
          user_id: ADMIN_USER_ID,
          deployment_id: deployment.id,
          region: PlatformRegion.Us,
          use_case: 'use_case',
          deployment_type: DeploymentType.Trial,
          status: DeploymentRequestStatus.Pending,
          activity_sector: 'cybersecurity',
          target_product: 'open-cti',
        });
      });
      it('should not throw when an error is thrown by telemetry', async () => {
        vi.useFakeTimers();
        const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
        vi.setSystemTime(date);
        telemetrySpy.mockRejectedValue(new Error('UNKNOWN'));

        const deployment = await DeploymentsApp.createDeploymentRequest({
          activity_sector: 'cybersecurity',
          job_title: 'myJob',
          use_case: 'use_case',
          platform_identifier: PlatformIdentifier.Opencti,
          region: PlatformRegion.Us,
          type: DeploymentType.Trial,
        });

        expect(deployment).toBeDefined();
      });
    });
    describe('mail', () => {
      it('should send a mail if status is pending', async () => {
        await DeploymentsApp.createDeploymentRequest({
          activity_sector: 'cybersecurity',
          job_title: 'myJob',
          use_case: 'use_case',
          platform_identifier: PlatformIdentifier.Opencti,
          region: PlatformRegion.Us,
          type: DeploymentType.Trial,
        });

        expect(mockSendMail).toHaveBeenCalledExactlyOnceWith({
          to: 'admin@filigran.io',
          template: 'opencti_free_trial_requested',
          params: {
            firstName: 'Firstname',
          },
        });
      });
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
        requester_first_name: 'firstname',
        requester_last_name: 'lastname',
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
      const deployment = await DeploymentsApp.updateDeploymentRequest({
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

    it(' with Active status, it should create ServiceGroup with admin', async () => {
      const deployment = await DeploymentsApp.updateDeploymentRequest({
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
      const getUserGroup = await ServiceGroupDomain.loadServiceGroups({
        service_instance_id: dbDeploymentRequest.service_instance_id,
      });
      expect(getUserGroup.length).toBe(3);
      const userAdminGroup =
        await ServiceGroupDomain.loadGroupUsersByServiceAndName(
          dbDeploymentRequest.service_instance_id,
          'Admin'
        );
      expect(userAdminGroup.length).toBe(1);
      expect(
        userAdminGroup.find(({ email }) => email === DEFAULT_ADMIN_EMAIL)
      ).toBeTruthy();
      const userAnalystGroup =
        await ServiceGroupDomain.loadGroupUsersByServiceAndName(
          dbDeploymentRequest.service_instance_id,
          'Analyst'
        );
      expect(userAnalystGroup.length).toBe(0);
      const userReaderGroup =
        await ServiceGroupDomain.loadGroupUsersByServiceAndName(
          dbDeploymentRequest.service_instance_id,
          'Reader'
        );

      expect(userReaderGroup.length).toBe(0);
    });
    it('should should throw if deployment request does not exist', async () => {
      const call = DeploymentsApp.updateDeploymentRequest({
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
        const call = DeploymentsApp.updateDeploymentRequest({
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
    it('should should throw when status requested is not allowed', async () => {
      const call = DeploymentsApp.updateDeploymentRequest({
        id: initialDeployment?.id as string,
        status: DeploymentRequestStatus.Queued,
      });
      await expect(call).rejects.toThrow(
        BadRequestErrorCode.DeploymentRequestStatusUpdateNotAllowed
      );
    });
    describe('telemetry', () => {
      it('should send a telemetry event', async () => {
        vi.useFakeTimers();
        const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
        vi.setSystemTime(date);

        const start_date = new Date(2025, 1, 3);
        const end_date = new Date(2025, 2, 3);

        const deployment = await DeploymentsApp.updateDeploymentRequest({
          id: initialDeployment?.id as string,
          status: DeploymentRequestStatus.Active,
          start_date,
          end_date,
          product_service_instance_id: 'fake product instance id',
          failure_reason: 'not failed',
        });

        const dbDeploymentRequest =
          await DeploymentRequestDomain.loadDeploymentRequestBy({
            id: deployment.id as DeploymentRequestId,
          });
        expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
          '@timestamp': '2025-02-03T13:12:15.000Z',
          event_type: TelemetryEventType.UPDATE_DEPLOYMENT,
          organization_id: PLATFORM_ORGANIZATION_UUID,
          organization_name: PLATFORM_NAME,
          organization_type: TelemetryOrganizationType.PROFESSIONAL,
          source: TELEMETRY_SOURCE,
          user_id: ADMIN_USER_ID,
          deployment_id: dbDeploymentRequest.id,
          deployment_type: DeploymentType.Trial,
          platform_id: 'fake product instance id',
          start_date,
          end_date,
          status: DeploymentRequestStatus.Active,
        });
      });

      it('should not throw when telemetry throws an error', async () => {
        vi.useFakeTimers();
        const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
        telemetrySpy.mockRejectedValue(new Error('UNKNOWN'));
        vi.setSystemTime(date);

        const start_date = new Date(2025, 1, 3);
        const end_date = new Date(2025, 2, 3);

        const deployment = await DeploymentsApp.updateDeploymentRequest({
          id: initialDeployment?.id as string,
          status: DeploymentRequestStatus.Active,
          start_date,
          end_date,
          product_service_instance_id: 'fake product instance id',
          failure_reason: 'not failed',
        });
        expect(deployment).toBeDefined();
      });
    });
  });

  describe('loadAvailableDeploymentRequests', () => {
    it.each([
      {
        description: 'normal case with available slots',
        maxDeployments: { us: 10, europe: 5 },
        currentDeployments: {
          [PlatformRegion.Us]: 3,
          [PlatformRegion.Europe]: 1,
        } as Record<string, number>,
        expected: [
          { region: PlatformRegion.Us, availableCount: 7 },
          { region: PlatformRegion.Europe, availableCount: 4 },
          { region: PlatformRegion.Apac, availableCount: 0 },
        ],
      },
      {
        description: 'over capacity scenario',
        maxDeployments: { us: 5 },
        currentDeployments: { [PlatformRegion.Us]: 8 } as Record<
          string,
          number
        >,
        expected: [
          { region: PlatformRegion.Us, availableCount: -3 },
          { region: PlatformRegion.Europe, availableCount: 0 },
          { region: PlatformRegion.Apac, availableCount: 0 },
        ],
      },
    ])(
      'should handle $description',
      async ({ maxDeployments, currentDeployments, expected }) => {
        // Arrange
        vi.spyOn(config, 'get').mockReturnValue(maxDeployments);
        vi.spyOn(
          DeploymentRequestDomain,
          'loadDeploymentRequestCountByRegion'
        ).mockResolvedValue(currentDeployments);

        // Act
        const result = await DeploymentsApp.loadAvailableDeploymentRequests(
          PlatformIdentifier.Opencti
        );

        // Assert
        expect(result).toEqual(expect.arrayContaining(expected));
        expect(result).toHaveLength(expected.length);
      }
    );
  });
});
