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
  DeploymentRequestDeploymentType,
  DeploymentRequestFilterKey,
  DeploymentRequestHubStatus,
  DeploymentRequestPlatformRegion,
  DeploymentRequestPlatformState,
  PlatformIdentifier,
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
    region: DeploymentRequestPlatformRegion.UsEast,
    request_date: new Date(Date.UTC(2025, 1, 3, 13, 12, 15)),
    hub_status: DeploymentRequestHubStatus.Pending,
    target_state: DeploymentRequestPlatformState.Active,
    actual_state: undefined,
    ordering: 1,
    type: DeploymentRequestDeploymentType.Trial,
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
        region: DeploymentRequestPlatformRegion.UsEast,
        type: DeploymentRequestDeploymentType.Trial,
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
        region: DeploymentRequestPlatformRegion.UsEast,
        request_date: expect.any(Date),
        service_instance_id: expect.any(String),
        hub_status: DeploymentRequestHubStatus.Pending,
        target_state: DeploymentRequestPlatformState.Active,
        actual_state: null,
        ordering: expect.any(Number),
        type: DeploymentRequestDeploymentType.Trial,
        use_case: 'use_case',
      });

      expect(dbDeploymentRequest).toBeDefined();

      if (dbDeploymentRequest) {
        const serviceInstance: ServiceInstance = await loadServiceInstanceBy(
          'id',
          dbDeploymentRequest.service_instance_id
        );
        expect(serviceInstance.creation_status).toBe(
          ServiceInstanceCreationStatus.Pending
        );
      }
    });
    it('should create a deployment request with queued status if specified', async () => {
      const deployment = await DeploymentsApp.createDeploymentRequest({
        activity_sector: 'cybersecurity',
        job_title: 'myJob',
        use_case: 'use_case',
        platform_identifier: PlatformIdentifier.Opencti,
        region: DeploymentRequestPlatformRegion.UsEast,
        type: DeploymentRequestDeploymentType.Trial,
        hub_status: DeploymentRequestHubStatus.Queued,
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
        region: DeploymentRequestPlatformRegion.UsEast,
        request_date: expect.any(Date),
        service_instance_id: expect.any(String),
        hub_status: DeploymentRequestHubStatus.Queued,
        target_state: DeploymentRequestPlatformState.Inactive,
        actual_state: null,
        ordering: expect.any(Number),
        type: DeploymentRequestDeploymentType.Trial,
        use_case: 'use_case',
      });

      if (!dbDeploymentRequest) return;

      const serviceInstance: ServiceInstance = await loadServiceInstanceBy(
        'id',
        dbDeploymentRequest.service_instance_id
      );
      expect(serviceInstance.creation_status).toBe(
        ServiceInstanceCreationStatus.Disabled
      );
    });
    it('should throw if an invalid hub_status is specified', async () => {
      const call = DeploymentsApp.createDeploymentRequest({
        activity_sector: 'cybersecurity',
        job_title: 'myJob',
        use_case: 'use_case',
        platform_identifier: PlatformIdentifier.Opencti,
        region: DeploymentRequestPlatformRegion.UsEast,
        type: DeploymentRequestDeploymentType.Trial,
        hub_status: DeploymentRequestHubStatus.Expired,
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
          region: DeploymentRequestPlatformRegion.UsEast,
          type: DeploymentRequestDeploymentType.Trial,
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
          region: DeploymentRequestPlatformRegion.UsEast,
          use_case: 'use_case',
          deployment_type: DeploymentRequestDeploymentType.Trial,
          status: DeploymentRequestHubStatus.Pending,
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
          region: DeploymentRequestPlatformRegion.UsEast,
          type: DeploymentRequestDeploymentType.Trial,
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
          region: DeploymentRequestPlatformRegion.UsEast,
          type: DeploymentRequestDeploymentType.Trial,
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

    it('should return out-of-sync deployment requests by default', async () => {
      await insertOpenCtiDeploymentRequest({
        hub_status: DeploymentRequestHubStatus.Pending,
        target_state: DeploymentRequestPlatformState.Active,
        actual_state: undefined,
      });
      await insertOpenCtiDeploymentRequest({
        hub_status: DeploymentRequestHubStatus.Active,
        target_state: DeploymentRequestPlatformState.Active,
        actual_state: DeploymentRequestPlatformState.Active,
      });

      const deployments = await DeploymentsApp.loadDeploymentRequests({
        first: 10,
      });

      expect(deployments.totalCount).toBe('1');
      expect(deployments.edges.length).toBe(1);
      expect(deployments.edges[0]?.node?.hub_status).toBe(
        DeploymentRequestHubStatus.Pending
      );
    });

    it('should return out-of-sync deployments even with other filters', async () => {
      await insertOpenCtiDeploymentRequest({
        target_state: DeploymentRequestPlatformState.Active,
        actual_state: undefined,
      });
      await insertOpenCtiDeploymentRequest({
        hub_status: DeploymentRequestHubStatus.Active,
        target_state: DeploymentRequestPlatformState.Active,
        actual_state: DeploymentRequestPlatformState.Active,
      });

      const deployments = await DeploymentsApp.loadDeploymentRequests({
        first: 10,
        filters: [
          {
            key: DeploymentRequestFilterKey.Region,
            value: [DeploymentRequestPlatformRegion.UsEast],
          },
        ],
      });

      expect(deployments.totalCount).toBe('1');
      expect(deployments.edges.length).toBe(1);
      expect(deployments.edges[0]?.node?.hub_status).toBe(
        DeploymentRequestHubStatus.Pending
      );
    });

    it('should filter multiple out-of-sync scenarios correctly', async () => {
      // Out-of-sync: NULL target vs NULL actual (both NULL = synced, should NOT appear)
      const synced1 = await insertOpenCtiDeploymentRequest({
        hub_status: DeploymentRequestHubStatus.Queued,
        target_state: undefined,
        actual_state: undefined,
      });

      // Out-of-sync: active target vs NULL actual
      const outOfSync1 = await insertOpenCtiDeploymentRequest({
        hub_status: DeploymentRequestHubStatus.Pending,
        target_state: DeploymentRequestPlatformState.Active,
        actual_state: undefined,
      });

      // Out-of-sync: active target vs provisioning actual
      const outOfSync2 = await insertOpenCtiDeploymentRequest({
        hub_status: DeploymentRequestHubStatus.Pending,
        target_state: DeploymentRequestPlatformState.Active,
        actual_state: DeploymentRequestPlatformState.Provisioning,
      });

      // Synced: active target vs active actual
      const synced2 = await insertOpenCtiDeploymentRequest({
        hub_status: DeploymentRequestHubStatus.Active,
        target_state: DeploymentRequestPlatformState.Active,
        actual_state: DeploymentRequestPlatformState.Active,
      });

      // Out-of-sync: NULL target vs provisioning actual
      const outOfSync3 = await insertOpenCtiDeploymentRequest({
        hub_status: DeploymentRequestHubStatus.Failed,
        target_state: undefined,
        actual_state: DeploymentRequestPlatformState.Provisioning,
      });

      // Synced: inactive target vs inactive actual
      const synced3 = await insertOpenCtiDeploymentRequest({
        hub_status: DeploymentRequestHubStatus.Expired,
        target_state: DeploymentRequestPlatformState.Inactive,
        actual_state: DeploymentRequestPlatformState.Inactive,
      });

      const deployments = await DeploymentsApp.loadDeploymentRequests({
        first: 10,
      });

      expect(deployments.totalCount).toBe('3');
      expect(deployments.edges.length).toBe(3);

      // Verify only out-of-sync deployments are returned
      const returnedIds = deployments.edges.map((edge) => edge.node.id);
      expect(returnedIds).toContain(outOfSync1.id);
      expect(returnedIds).toContain(outOfSync2.id);
      expect(returnedIds).toContain(outOfSync3.id);
      expect(returnedIds).not.toContain(synced1.id);
      expect(returnedIds).not.toContain(synced2.id);
      expect(returnedIds).not.toContain(synced3.id);
    });

    it('should return filtered deployment requests only', async () => {
      await insertOpenCtiDeploymentRequest({});
      await insertOpenCtiDeploymentRequest({
        region: DeploymentRequestPlatformRegion.EuWest,
        hub_status: DeploymentRequestHubStatus.Active,
        actual_state: DeploymentRequestPlatformState.Active,
      });
      await insertOpenCtiDeploymentRequest({
        platform_identifier: PlatformIdentifier.Openaev,
        hub_status: DeploymentRequestHubStatus.Active,
        actual_state: DeploymentRequestPlatformState.Active,
      });

      const deployments = await DeploymentsApp.loadDeploymentRequests({
        first: 10,
        filters: [
          {
            key: DeploymentRequestFilterKey.Region,
            value: [DeploymentRequestPlatformRegion.UsEast],
          },
          {
            key: DeploymentRequestFilterKey.HubStatus,
            value: [DeploymentRequestHubStatus.Active],
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
        hub_status: DeploymentRequestHubStatus.Pending,
        target_state: DeploymentRequestPlatformState.Active,
        actual_state: DeploymentRequestPlatformState.Provisioning,
      })) as DeploymentRequest;
    });

    it('should update a deployment request', async () => {
      const deployment = await DeploymentsApp.updateDeploymentRequest({
        id: initialDeployment?.id as string,
        actual_state: DeploymentRequestPlatformState.Active,
        start_date: new Date(2025, 1, 3),
        end_date: new Date(2025, 2, 3),
        platform_id: 'fake product instance id',
        failure_reason: 'not failed',
      });

      const dbDeploymentRequest =
        await DeploymentRequestDomain.loadDeploymentRequestBy({
          id: deployment.id as DeploymentRequestId,
        });

      if (!dbDeploymentRequest) return;

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
        region: DeploymentRequestPlatformRegion.UsEast,
        request_date: expect.any(Date),
        service_instance_id: expect.any(String),
        hub_status: DeploymentRequestHubStatus.Pending,
        target_state: DeploymentRequestPlatformState.Active,
        actual_state: DeploymentRequestPlatformState.Active,
        ordering: expect.any(Number),
        type: DeploymentRequestDeploymentType.Trial,
        use_case: 'use_case',
        user_requester_id: ADMIN_UUID,
        start_date: new Date(2025, 1, 3),
        end_date: new Date(2025, 2, 3),
        platform_id: 'fake product instance id',
        failure_reason: 'not failed',
      });
      expect(serviceInstance.creation_status).toBe(
        ServiceInstanceCreationStatus.Pending
      );
      expect(subscription).toBeDefined();
      if (subscription) {
        expect(subscription.start_date).toStrictEqual(
          dbDeploymentRequest.start_date
        );
        expect(subscription.end_date).toStrictEqual(
          dbDeploymentRequest.end_date
        );
      }
    });
    it('should should throw if deployment request does not exist', async () => {
      const call = DeploymentsApp.updateDeploymentRequest({
        id: uuidv4(),
        actual_state: DeploymentRequestPlatformState.Active,
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
          actual_state: DeploymentRequestPlatformState.Active,
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
        hub_status: DeploymentRequestHubStatus.Expired,
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

        await DeploymentsApp.updateDeploymentRequest({
          id: initialDeployment?.id as string,
          actual_state: DeploymentRequestPlatformState.Active,
          start_date,
          end_date,
          platform_id: 'fake product instance id',
          failure_reason: 'not failed',
        });

        expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
          '@timestamp': '2025-02-03T13:12:15.000Z',
          event_type: TelemetryEventType.UPDATE_DEPLOYMENT,
          organization_id: PLATFORM_ORGANIZATION_UUID,
          organization_name: PLATFORM_NAME,
          organization_type: TelemetryOrganizationType.PROFESSIONAL,
          source: TELEMETRY_SOURCE,
          user_id: ADMIN_USER_ID,
          deployment_id: initialDeployment.id,
          deployment_type: DeploymentRequestDeploymentType.Trial,
          platform_id: 'fake product instance id',
          start_date,
          end_date,
          status: undefined,
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
          actual_state: DeploymentRequestPlatformState.Active,
          start_date,
          end_date,
          platform_id: 'fake product instance id',
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
        maxDeployments: { us_east: 10, eu_west: 5 },
        currentDeployments: {
          [DeploymentRequestPlatformRegion.UsEast]: 3,
          [DeploymentRequestPlatformRegion.EuWest]: 1,
        } as Record<string, number>,
        expected: [
          { region: DeploymentRequestPlatformRegion.UsEast, availableCount: 7 },
          { region: DeploymentRequestPlatformRegion.EuWest, availableCount: 4 },
          { region: DeploymentRequestPlatformRegion.ApacAu, availableCount: 0 },
          { region: DeploymentRequestPlatformRegion.ApacSg, availableCount: 0 },
        ],
      },
      {
        description: 'over capacity scenario',
        maxDeployments: { us_east: 5 },
        currentDeployments: {
          [DeploymentRequestPlatformRegion.UsEast]: 8,
        } as Record<string, number>,
        expected: [
          {
            region: DeploymentRequestPlatformRegion.UsEast,
            availableCount: -3,
          },
          { region: DeploymentRequestPlatformRegion.EuWest, availableCount: 0 },
          { region: DeploymentRequestPlatformRegion.ApacAu, availableCount: 0 },
          { region: DeploymentRequestPlatformRegion.ApacSg, availableCount: 0 },
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
