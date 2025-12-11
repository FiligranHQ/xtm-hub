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
  requestContextThalesUser,
  THALES_ADMIN_ORGA_USER_ID,
} from '../../../../tests/tests.const';
import {
  DeploymentRequestDeploymentType,
  DeploymentRequestFilterKey,
  DeploymentRequestHubStatus,
  DeploymentRequestPlatformRegion,
  DeploymentRequestPlatformState,
  PlatformIdentifier,
  ReorderDeploymentRequestInQueueDirection,
  ServiceInstanceCreationStatus,
} from '../../../__generated__/resolvers-types';
import DeploymentRequest, {
  DeploymentRequestId,
} from '../../../model/kanel/public/DeploymentRequest';
import ServiceInstance from '../../../model/kanel/public/ServiceInstance';
import {
  ADMIN_UUID,
  PLATFORM_NAME,
  PLATFORM_ORGANIZATION_UUID,
} from '../../../portal.const';
import * as mailService from '../../../server/mail-service';
import {
  BadRequestErrorCode,
  ErrorCode,
  ForbiddenErrorCode,
  NotFoundErrorCode,
} from '../../../utils/error/error.code';
import { loadSubscriptionBy } from '../../subcription/subscription.domain';
import { deleteSubscriptionUnsecure } from '../../subcription/subscription.helper';
import { telemetryApp } from '../../telemetry/telemetry.app';
import {
  TELEMETRY_SOURCE,
  TelemetryOrganizationType,
} from '../../telemetry/telemetry.const';
import { TelemetryEventType } from '../../telemetry/telemetry.types';
import { ServiceGroupDomain } from '../group/service-group.domain';

import { MockInstance } from '@vitest/spy';
import { requestContext } from '../../../context/request.context';
import {
  deleteServiceInstanceBy,
  loadServiceInstanceBy,
} from '../service-instance.domain';
import { DeploymentsApp } from './deployments.app';
import { DeploymentRequestDomain } from './deployments.domain';
import { DeploymentsQuotasDomain } from './deployments.quotas.domain';
import { insertOpenCtiDeploymentRequest } from './deployments.test.utils';

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
      vi.spyOn(DeploymentsQuotasDomain, 'reservePlace').mockResolvedValue({
        isPlaceAvailable: true,
      });
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
        actual_state: DeploymentRequestPlatformState.Unprovisioned,
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
    it('should create a deployment request with queued status when there is no space available', async () => {
      vi.spyOn(DeploymentsQuotasDomain, 'reservePlace').mockResolvedValue({
        isPlaceAvailable: false,
      });
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
        hub_status: DeploymentRequestHubStatus.Queued,
        target_state: DeploymentRequestPlatformState.Unprovisioned,
        actual_state: DeploymentRequestPlatformState.Unprovisioned,
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
        ServiceInstanceCreationStatus.Pending
      );
    });

    describe('domains blacklist', () => {
      const originalConfigGet = config.get;

      afterEach(() => {
        vi.mocked(config.get).mockImplementation(originalConfigGet);
      });

      it('should throw error when organization domain is blacklisted', async () => {
        vi.spyOn(config, 'get').mockImplementation((key: string) => {
          if (key === 'domains_blacklist') {
            return 'filigran.io,blocked.net';
          }
          return originalConfigGet.call(config, key);
        });

        const call = DeploymentsApp.createDeploymentRequest({
          activity_sector: 'cybersecurity',
          job_title: 'myJob',
          use_case: 'use_case',
          platform_identifier: PlatformIdentifier.Opencti,
          region: DeploymentRequestPlatformRegion.UsEast,
          type: DeploymentRequestDeploymentType.Trial,
        });

        await expect(call).rejects.toThrow(ErrorCode.CantRequestFreeTrial);
      });

      it('should allow deployment when organization domain is not blacklisted', async () => {
        vi.spyOn(config, 'get').mockImplementation((key: string) => {
          if (key === 'domains_blacklist') {
            return 'blocked.com,forbidden.net';
          }
          return originalConfigGet.call(config, key);
        });

        const deployment = await DeploymentsApp.createDeploymentRequest({
          activity_sector: 'cybersecurity',
          job_title: 'myJob',
          use_case: 'use_case',
          platform_identifier: PlatformIdentifier.Opencti,
          region: DeploymentRequestPlatformRegion.UsEast,
          type: DeploymentRequestDeploymentType.Trial,
        });

        expect(deployment).toBeDefined();
        expect(deployment.id).toBeDefined();
      });

      it('should allow deployment when blacklist is empty', async () => {
        vi.spyOn(config, 'get').mockImplementation((key: string) => {
          if (key === 'domains_blacklist') {
            return '';
          }
          return originalConfigGet.call(config, key);
        });

        const deployment = await DeploymentsApp.createDeploymentRequest({
          activity_sector: 'cybersecurity',
          job_title: 'myJob',
          use_case: 'use_case',
          platform_identifier: PlatformIdentifier.Opencti,
          region: DeploymentRequestPlatformRegion.UsEast,
          type: DeploymentRequestDeploymentType.Trial,
        });

        expect(deployment).toBeDefined();
        expect(deployment.id).toBeDefined();
      });

      it('should handle blacklist with spaces correctly', async () => {
        vi.spyOn(config, 'get').mockImplementation((key: string) => {
          if (key === 'domains_blacklist') {
            return 'filigran.io , blocked.net , test.org';
          }
          return originalConfigGet.call(config, key);
        });

        const call = DeploymentsApp.createDeploymentRequest({
          activity_sector: 'cybersecurity',
          job_title: 'myJob',
          use_case: 'use_case',
          platform_identifier: PlatformIdentifier.Opencti,
          region: DeploymentRequestPlatformRegion.UsEast,
          type: DeploymentRequestDeploymentType.Trial,
        });

        await expect(call).rejects.toThrow(ErrorCode.CantRequestFreeTrial);
      });
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
      it('should send a mail if there is no space available', async () => {
        vi.spyOn(DeploymentsQuotasDomain, 'reservePlace').mockResolvedValue({
          isPlaceAvailable: false,
        });
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
          template: 'opencti_free_trial_queued',
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

      const deployments = await DeploymentsApp.loadPlatformDeploymentRequests({
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
        cancellation_user_email: null,
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

      const deployments = await DeploymentsApp.loadPlatformDeploymentRequests({
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

      const deployments = await DeploymentsApp.loadPlatformDeploymentRequests({
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
        target_state: DeploymentRequestPlatformState.Unprovisioned,
        actual_state: DeploymentRequestPlatformState.Unprovisioned,
      });

      const deployments = await DeploymentsApp.loadPlatformDeploymentRequests({
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

      const deployments = await DeploymentsApp.loadPlatformDeploymentRequests({
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
        hub_status: DeploymentRequestHubStatus.Active,
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

    it(' with Active status, it should create ServiceGroup with admin', async () => {
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
    it('should throw if deployment request does not exist', async () => {
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
          status: DeploymentRequestHubStatus.Active,
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
    describe('mail', () => {
      it('should send a mail in case deployment request is in provisioning (only first time)', async () => {
        await DeploymentsApp.updateDeploymentRequest({
          id: initialDeployment?.id as string,
          actual_state: DeploymentRequestPlatformState.Provisioning,
        });
        expect(mockSendMail).toHaveBeenCalledExactlyOnceWith({
          to: 'admin@filigran.io',
          template: 'opencti_free_trial_provisioning',
          params: {
            firstName: 'Firstname',
          },
        });

        mockSendMail.mockClear();

        await DeploymentsApp.updateDeploymentRequest({
          id: initialDeployment?.id as string,
          actual_state: DeploymentRequestPlatformState.Provisioning,
        });

        expect(mockSendMail).not.toHaveBeenCalled();
      });
    });
  });

  describe('reorderDeploymentRequestInQueue', () => {
    it('should throw when deployment request is not found', async () => {
      vi.spyOn(
        DeploymentRequestDomain,
        'loadDeploymentRequestBy'
      ).mockResolvedValue(null);

      const call = DeploymentsApp.reorderDeploymentRequestInQueue({
        id: uuidv4() as DeploymentRequestId,
        direction: ReorderDeploymentRequestInQueueDirection.Top,
      });

      await expect(call).rejects.toThrow(ErrorCode.DeploymentRequestNotFound);
    });

    it('should throw when deployment request is not in queue', async () => {
      const deploymentRequest = {
        id: uuidv4() as DeploymentRequestId,
        hub_status: DeploymentRequestHubStatus.Active,
      } as Awaited<
        ReturnType<typeof DeploymentRequestDomain.loadDeploymentRequestBy>
      >;
      vi.spyOn(
        DeploymentRequestDomain,
        'loadDeploymentRequestBy'
      ).mockResolvedValue(deploymentRequest);

      const call = DeploymentsApp.reorderDeploymentRequestInQueue({
        id: deploymentRequest!.id,
        direction: ReorderDeploymentRequestInQueueDirection.Top,
      });

      await expect(call).rejects.toThrow(
        ErrorCode.DeploymentRequestHubStatusNotQueued
      );
    });

    it('should reorder deployment request to top when direction is top', async () => {
      const deploymentRequest = {
        id: uuidv4() as DeploymentRequestId,
        hub_status: DeploymentRequestHubStatus.Queued,
      } as Awaited<
        ReturnType<typeof DeploymentRequestDomain.loadDeploymentRequestBy>
      >;
      vi.spyOn(
        DeploymentRequestDomain,
        'loadDeploymentRequestBy'
      ).mockResolvedValue(deploymentRequest);

      const reorderDeploymentRequestToTopSpy = vi
        .spyOn(DeploymentRequestDomain, 'reorderDeploymentRequestToTop')
        .mockResolvedValue();

      const result = await DeploymentsApp.reorderDeploymentRequestInQueue({
        id: uuidv4() as DeploymentRequestId,
        direction: ReorderDeploymentRequestInQueueDirection.Top,
      });

      expect(result.success).toBeTruthy();
      expect(reorderDeploymentRequestToTopSpy).toHaveBeenCalledWith(
        deploymentRequest
      );
    });

    it('should reorder deployment request up when direction is up', async () => {
      const deploymentRequest = {
        id: uuidv4() as DeploymentRequestId,
        hub_status: DeploymentRequestHubStatus.Queued,
      } as Awaited<
        ReturnType<typeof DeploymentRequestDomain.loadDeploymentRequestBy>
      >;
      vi.spyOn(
        DeploymentRequestDomain,
        'loadDeploymentRequestBy'
      ).mockResolvedValue(deploymentRequest);

      const reorderDeploymentRequestUpSpy = vi
        .spyOn(DeploymentRequestDomain, 'reorderDeploymentRequestUp')
        .mockResolvedValue();

      const result = await DeploymentsApp.reorderDeploymentRequestInQueue({
        id: uuidv4() as DeploymentRequestId,
        direction: ReorderDeploymentRequestInQueueDirection.Up,
      });

      expect(result.success).toBeTruthy();
      expect(reorderDeploymentRequestUpSpy).toHaveBeenCalledWith(
        deploymentRequest
      );
    });
  });
  describe('cancelDeploymentRequest', () => {
    it.each`
      isAdmin  | hub_status                                 | actual_state                                    | counts_in_orga_quota
      ${false} | ${DeploymentRequestHubStatus.Provisioning} | ${DeploymentRequestPlatformState.Provisioning}  | ${false}
      ${false} | ${DeploymentRequestHubStatus.Pending}      | ${DeploymentRequestPlatformState.Unprovisioned} | ${false}
      ${false} | ${DeploymentRequestHubStatus.Queued}       | ${DeploymentRequestPlatformState.Unprovisioned} | ${false}
      ${false} | ${DeploymentRequestHubStatus.Active}       | ${DeploymentRequestPlatformState.Active}        | ${true}
      ${true}  | ${DeploymentRequestHubStatus.Provisioning} | ${DeploymentRequestPlatformState.Provisioning}  | ${true}
      ${true}  | ${DeploymentRequestHubStatus.Pending}      | ${DeploymentRequestPlatformState.Unprovisioned} | ${true}
      ${true}  | ${DeploymentRequestHubStatus.Queued}       | ${DeploymentRequestPlatformState.Unprovisioned} | ${true}
      ${true}  | ${DeploymentRequestHubStatus.Active}       | ${DeploymentRequestPlatformState.Active}        | ${true}
    `(
      'Should cancel deployment request actual state $actual_state, with counts_in_orga_quota: counts_in_orga_quota',
      async ({ isAdmin, hub_status, actual_state, counts_in_orga_quota }) => {
        const initialDeployment = (await insertOpenCtiDeploymentRequest({
          hub_status,
          actual_state,
        })) as DeploymentRequest;

        const deployment = await DeploymentsApp.cancelDeploymentRequest(
          initialDeployment.id,
          isAdmin
        );

        expect(deployment).toMatchObject({
          hub_status: DeploymentRequestHubStatus.Cancelled,
          target_state: DeploymentRequestPlatformState.Removed,
          counts_in_orga_quota,
          cancellation_date: expect.any(Date),
          cancellation_user_id: ADMIN_USER_ID,
        });

        const serviceInstance: ServiceInstance = await loadServiceInstanceBy(
          'id',
          initialDeployment.service_instance_id
        );
        expect(serviceInstance.creation_status).toBe(
          counts_in_orga_quota
            ? ServiceInstanceCreationStatus.Pending
            : ServiceInstanceCreationStatus.Disabled
        );
      }
    );
    it('should throw if deployment request does not exist', async () => {
      const call = DeploymentsApp.cancelDeploymentRequest(
        uuidv4() as DeploymentRequestId,
        false
      );
      await expect(call).rejects.toThrow(
        NotFoundErrorCode.DeploymentRequestNotFound
      );
    });

    it('should throw if user is not in organization and not isAdmin', async () => {
      const deployment = (await insertOpenCtiDeploymentRequest(
        {}
      )) as DeploymentRequest;

      requestContext.set(requestContextThalesUser);
      const call = DeploymentsApp.cancelDeploymentRequest(deployment.id, false);
      await expect(call).rejects.toThrow(
        ForbiddenErrorCode.UserIsNotInOrganization
      );
    });

    it('should not throw if user is not in organization and isAdmin', async () => {
      const deployment = (await insertOpenCtiDeploymentRequest(
        {}
      )) as DeploymentRequest;

      requestContext.set(requestContextThalesUser);
      const response = await DeploymentsApp.cancelDeploymentRequest(
        deployment.id,
        true
      );
      expect(response).toBeTruthy();
    });
    it('should send a telemetry event', async () => {
      const deployment = (await insertOpenCtiDeploymentRequest(
        {}
      )) as DeploymentRequest;

      vi.useFakeTimers();
      const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
      vi.setSystemTime(date);

      await DeploymentsApp.cancelDeploymentRequest(deployment.id, false);

      expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
        '@timestamp': '2025-02-03T13:12:15.000Z',
        event_type: TelemetryEventType.UPDATE_DEPLOYMENT,
        organization_id: PLATFORM_ORGANIZATION_UUID,
        organization_name: PLATFORM_NAME,
        organization_type: TelemetryOrganizationType.PROFESSIONAL,
        source: TELEMETRY_SOURCE,
        user_id: ADMIN_USER_ID,
        deployment_id: deployment.id,
        deployment_type: DeploymentRequestDeploymentType.Trial,
        status: DeploymentRequestHubStatus.Cancelled,
        start_date: null,
        end_date: null,
        platform_id: null,
      });
    });

    it('should send a mail to the trial requester', async () => {
      const deployment = (await insertOpenCtiDeploymentRequest({
        user_requester_id: THALES_ADMIN_ORGA_USER_ID,
      })) as DeploymentRequest;

      await DeploymentsApp.cancelDeploymentRequest(deployment.id, true);

      expect(mockSendMail).toHaveBeenCalledExactlyOnceWith({
        to: 'admin@thales.com',
        template: 'opencti_free_trial_cancelled',
        params: {
          firstName: '',
        },
      });
    });
  });

  describe('updateDeploymentQuotaCapacity', () => {
    let updateQuotaCapacitySpy: MockInstance;
    let setPendingRequestsAsQueuedSpy: MockInstance;
    let setQueuedRequestsAsPendingSpy: MockInstance;
    beforeEach(() => {
      updateQuotaCapacitySpy = vi.spyOn(
        DeploymentsQuotasDomain,
        'updateQuotaCapacity'
      );

      setPendingRequestsAsQueuedSpy = vi
        .spyOn(DeploymentRequestDomain, 'setPendingRequestsAsQueued')
        .mockResolvedValue();

      setQueuedRequestsAsPendingSpy = vi
        .spyOn(DeploymentRequestDomain, 'setQueuedRequestsAsPending')
        .mockResolvedValue();
    });
    it('should move all requests to queued when there is a negative availability', async () => {
      updateQuotaCapacitySpy.mockResolvedValue({
        availabilityDifference: -1,
        newAvailability: -1,
      });

      await DeploymentsApp.updateDeploymentQuotaCapacity({
        platformIdentifier: PlatformIdentifier.Opencti,
        region: DeploymentRequestPlatformRegion.UsEast,
        newCapacity: 10,
      });

      expect(setPendingRequestsAsQueuedSpy).toHaveBeenCalledWith(undefined);
      expect(setQueuedRequestsAsPendingSpy).not.toHaveBeenCalled();
    });

    it('should move all requests to queued when there is a zero availability', async () => {
      updateQuotaCapacitySpy.mockResolvedValue({
        availabilityDifference: -1,
        newAvailability: 0,
      });

      await DeploymentsApp.updateDeploymentQuotaCapacity({
        platformIdentifier: PlatformIdentifier.Opencti,
        region: DeploymentRequestPlatformRegion.UsEast,
        newCapacity: 10,
      });

      expect(setPendingRequestsAsQueuedSpy).toHaveBeenCalledWith(undefined);
      expect(setQueuedRequestsAsPendingSpy).not.toHaveBeenCalled();
    });

    it('should move a limited number of requests to queued when there is less space more than 0', async () => {
      updateQuotaCapacitySpy.mockResolvedValue({
        availabilityDifference: -1,
        newAvailability: 1,
      });

      await DeploymentsApp.updateDeploymentQuotaCapacity({
        platformIdentifier: PlatformIdentifier.Opencti,
        region: DeploymentRequestPlatformRegion.UsEast,
        newCapacity: 10,
      });

      expect(setPendingRequestsAsQueuedSpy).toHaveBeenCalledWith(1);
      expect(setQueuedRequestsAsPendingSpy).not.toHaveBeenCalled();
    });

    it('should move requests to pending when there is more space than before', async () => {
      updateQuotaCapacitySpy.mockResolvedValue({ availabilityDifference: 1 });

      await DeploymentsApp.updateDeploymentQuotaCapacity({
        platformIdentifier: PlatformIdentifier.Opencti,
        region: DeploymentRequestPlatformRegion.UsEast,
        newCapacity: 10,
      });

      expect(setPendingRequestsAsQueuedSpy).not.toHaveBeenCalled();
      expect(setQueuedRequestsAsPendingSpy).toHaveBeenCalledWith(1);
    });

    it('should do nothing when there space did not change', async () => {
      updateQuotaCapacitySpy.mockResolvedValue({ availabilityDifference: 0 });

      await DeploymentsApp.updateDeploymentQuotaCapacity({
        platformIdentifier: PlatformIdentifier.Opencti,
        region: DeploymentRequestPlatformRegion.UsEast,
        newCapacity: 10,
      });

      expect(setPendingRequestsAsQueuedSpy).not.toHaveBeenCalled();
      expect(setQueuedRequestsAsPendingSpy).not.toHaveBeenCalled();
    });
  });
});
