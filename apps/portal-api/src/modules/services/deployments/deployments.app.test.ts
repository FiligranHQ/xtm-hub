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
  TEST_ORGANIZATIONS,
  requestContextAdminSecondOrga,
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
import ServiceInstance, {
  ServiceInstanceId,
} from '../../../model/kanel/public/ServiceInstance';
import { SYSTEM_USER_UUID, XTM_HUB_SUPPORT_EMAIL } from '../../../portal.const';
import * as mailService from '../../../server/mail-service';
import {
  BadRequestErrorCode,
  ErrorCode,
  ForbiddenErrorCode,
  NotFoundErrorCode,
} from '../../../utils/error/error.code';
import { loadSubscriptionBy } from '../../subcription/subscription.domain';
import { deleteSubscription } from '../../subcription/subscription.helper';
import { telemetryApp } from '../../telemetry/telemetry.app';
import {
  TELEMETRY_SOURCE,
  TelemetryOrganizationType,
} from '../../telemetry/telemetry.const';
import { TelemetryEventType } from '../../telemetry/telemetry.types';
import { ServiceGroupDomain } from '../group/service-group.domain';

import { MockInstance } from '@vitest/spy';
import { db } from '../../../../knexfile';
import { requestContext } from '../../../context/request.context';
import DeploymentRequestQuota from '../../../model/kanel/public/DeploymentRequestQuota';
import { serviceContractDomain } from '../contract/service-configuration.domain';
import {
  deleteServiceInstanceBy,
  loadServiceInstanceBy,
} from '../service-instance.domain';
import { DeploymentsApp } from './deployments.app';
import { DeploymentRequestDomain } from './deployments.domain';
import { DeploymentsQuotasDomain } from './deployments.quotas.domain';
import {
  assertDeploymentRequestProperties,
  insertOpenCtiDeploymentRequest,
} from './deployments.test.utils';

describe('Deployment app', () => {
  const telemetrySpy = vi
    .spyOn(telemetryApp, 'sendTelemetryEvent')
    .mockResolvedValue();
  const mockSendMail = vi.spyOn(mailService, 'sendMail');

  afterEach(async () => {
    await DeploymentRequestDomain.deleteDeploymentRequestBy({});
    await deleteServiceInstanceBy({});
    await deleteSubscription({});
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
        organization_requester_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
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
        organization_requester_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
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
            return `${TEST_ORGANIZATIONS.FILIGRAN.DOMAINS.FIRST} , blocked.net , test.org`;
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
      it.each`
        product                       | targetProduct
        ${PlatformIdentifier.Opencti} | ${'open-cti'}
        ${PlatformIdentifier.Openaev} | ${'open-aev'}
      `(
        'should send a telemetry event when trial for $product platform is launched',
        async ({ product, targetProduct }) => {
          vi.useFakeTimers();
          const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
          vi.setSystemTime(date);

          const deployment = await DeploymentsApp.createDeploymentRequest({
            activity_sector: 'cybersecurity',
            job_title: 'myJob',
            use_case: 'use_case',
            platform_identifier: product,
            region: DeploymentRequestPlatformRegion.UsEast,
            type: DeploymentRequestDeploymentType.Trial,
          });

          expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
            '@timestamp': '2025-02-03T13:12:15.000Z',
            event_type: TelemetryEventType.CREATE_DEPLOYMENT,
            organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
            organization_name: TEST_ORGANIZATIONS.FILIGRAN.NAME,
            organization_type: TelemetryOrganizationType.PROFESSIONAL,
            source: TELEMETRY_SOURCE,
            email: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.EMAIL,
            job_title: 'myJob',
            user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
            deployment_id: deployment.id,
            region: DeploymentRequestPlatformRegion.UsEast,
            use_case: 'use_case',
            deployment_type: DeploymentRequestDeploymentType.Trial,
            status: DeploymentRequestHubStatus.Pending,
            activity_sector: 'cybersecurity',
            target_product: targetProduct,
          });
        }
      );
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

        expect(mockSendMail).toHaveBeenCalledTimes(2);

        expect(mockSendMail).toHaveBeenNthCalledWith(1, {
          to: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.EMAIL,
          template: 'opencti_free_trial_requested',
          params: {
            firstName: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.FIRST_NAME,
          },
        });

        expect(mockSendMail).toHaveBeenNthCalledWith(2, {
          to: XTM_HUB_SUPPORT_EMAIL,
          template: 'admin_saas_instance_requested',
          params: {
            activitySector: 'cybersecurity',
            deploymentType: 'Trial',
            organizationName: TEST_ORGANIZATIONS.FILIGRAN.NAME,
            platformIdentifier: 'Opencti',
            region: DeploymentRequestPlatformRegion.UsEast,
            useCase: 'use_case',
            userEmail: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.EMAIL,
            userName: `${TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.FIRST_NAME} ${TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.LAST_NAME}`,
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

        expect(mockSendMail).toHaveBeenCalledTimes(2);

        expect(mockSendMail).toHaveBeenNthCalledWith(1, {
          to: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.EMAIL,
          template: 'opencti_free_trial_queued',
          params: {
            firstName: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.FIRST_NAME,
          },
        });

        expect(mockSendMail).toHaveBeenNthCalledWith(2, {
          to: XTM_HUB_SUPPORT_EMAIL,
          template: 'admin_saas_instance_requested',
          params: {
            activitySector: 'cybersecurity',
            deploymentType: 'Trial',
            organizationName: TEST_ORGANIZATIONS.FILIGRAN.NAME,
            platformIdentifier: 'Opencti',
            region: 'us_east',
            useCase: 'use_case',
            userEmail: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.EMAIL,
            userName: `${TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.FIRST_NAME} ${TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.LAST_NAME}`,
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
        organization_name: TEST_ORGANIZATIONS.FILIGRAN.NAME,
        organization_domains: [
          TEST_ORGANIZATIONS.FILIGRAN.DOMAINS.FIRST,
          TEST_ORGANIZATIONS.FILIGRAN.DOMAINS.SECOND,
        ],
        requester_email: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.EMAIL,
        requester_first_name:
          TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.FIRST_NAME,
        requester_last_name: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.LAST_NAME,
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
      expect(returnedIds).toContain(outOfSync1!.id);
      expect(returnedIds).toContain(outOfSync2!.id);
      expect(returnedIds).toContain(outOfSync3!.id);
      expect(returnedIds).not.toContain(synced1!.id);
      expect(returnedIds).not.toContain(synced2!.id);
      expect(returnedIds).not.toContain(synced3!.id);
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
        organization_requester_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
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
        user_requester_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
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
        service_instance_id: dbDeploymentRequest!.service_instance_id,
      });
      expect(getUserGroup.length).toBe(3);
      const userAdminGroup =
        await ServiceGroupDomain.loadGroupUsersByServiceAndName(
          dbDeploymentRequest!.service_instance_id,
          'Admin'
        );
      expect(userAdminGroup.length).toBe(1);
      expect(
        userAdminGroup.find(
          ({ email }) =>
            email === TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.EMAIL
        )
      ).toBeTruthy();
      const userAnalystGroup =
        await ServiceGroupDomain.loadGroupUsersByServiceAndName(
          dbDeploymentRequest!.service_instance_id,
          'Analyst'
        );
      expect(userAnalystGroup.length).toBe(0);
      const userReaderGroup =
        await ServiceGroupDomain.loadGroupUsersByServiceAndName(
          dbDeploymentRequest!.service_instance_id,
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
          organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
          organization_name: TEST_ORGANIZATIONS.FILIGRAN.NAME,
          organization_type: TelemetryOrganizationType.PROFESSIONAL,
          source: TELEMETRY_SOURCE,
          user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
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
        expect(mockSendMail).toHaveBeenCalledWith({
          to: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.EMAIL,
          template: 'opencti_free_trial_provisioning',
          params: {
            firstName: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.FIRST_NAME,
          },
        });

        mockSendMail.mockClear();

        await DeploymentsApp.updateDeploymentRequest({
          id: initialDeployment?.id as string,
          actual_state: DeploymentRequestPlatformState.Provisioning,
        });

        expect(mockSendMail).not.toHaveBeenCalled();
      });

      it('should send a mail in case deployment request is in active (only first time)', async () => {
        vi.spyOn(
          serviceContractDomain,
          'loadConfigurationByPlatform'
        ).mockResolvedValue({
          service_instance_id: uuidv4() as ServiceInstanceId,
          config: { platform_url: 'http://example.com' },
          status: DeploymentRequestPlatformState.Active,
        });
        await DeploymentsApp.updateDeploymentRequest({
          id: initialDeployment?.id as string,
          start_date: new Date(2025, 12, 1),
          end_date: new Date(2026, 1, 1),
          actual_state: DeploymentRequestPlatformState.Active,
        });

        expect(mockSendMail).toHaveBeenCalledWith({
          to: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.EMAIL,
          template: 'opencti_free_trial_registered',
          params: {
            firstName: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.FIRST_NAME,
            platformUrl: 'http://example.com',
          },
        });

        mockSendMail.mockClear();

        await DeploymentsApp.updateDeploymentRequest({
          id: initialDeployment?.id as string,
          start_date: new Date(2025, 12, 1),
          end_date: new Date(2026, 1, 1),
          actual_state: DeploymentRequestPlatformState.Active,
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
    let freePlaceSpy: MockInstance;
    beforeEach(() => {
      freePlaceSpy = vi
        .spyOn(DeploymentsQuotasDomain, 'freePlace')
        .mockResolvedValue();
    });
    it.each`
      isAdmin  | hub_status                                 | actual_state                                    | counts_in_orga_quota | target_state
      ${false} | ${DeploymentRequestHubStatus.Provisioning} | ${DeploymentRequestPlatformState.Provisioning}  | ${false}             | ${DeploymentRequestPlatformState.Removed}
      ${false} | ${DeploymentRequestHubStatus.Pending}      | ${DeploymentRequestPlatformState.Unprovisioned} | ${false}             | ${DeploymentRequestPlatformState.Unprovisioned}
      ${false} | ${DeploymentRequestHubStatus.Queued}       | ${DeploymentRequestPlatformState.Unprovisioned} | ${false}             | ${DeploymentRequestPlatformState.Unprovisioned}
      ${false} | ${DeploymentRequestHubStatus.Active}       | ${DeploymentRequestPlatformState.Active}        | ${true}              | ${DeploymentRequestPlatformState.Removed}
      ${true}  | ${DeploymentRequestHubStatus.Provisioning} | ${DeploymentRequestPlatformState.Provisioning}  | ${true}              | ${DeploymentRequestPlatformState.Removed}
      ${true}  | ${DeploymentRequestHubStatus.Pending}      | ${DeploymentRequestPlatformState.Unprovisioned} | ${true}              | ${DeploymentRequestPlatformState.Unprovisioned}
      ${true}  | ${DeploymentRequestHubStatus.Queued}       | ${DeploymentRequestPlatformState.Unprovisioned} | ${true}              | ${DeploymentRequestPlatformState.Unprovisioned}
      ${true}  | ${DeploymentRequestHubStatus.Active}       | ${DeploymentRequestPlatformState.Active}        | ${true}              | ${DeploymentRequestPlatformState.Removed}
    `(
      'Should cancel deployment request actual state $actual_state, with counts_in_orga_quota: counts_in_orga_quota',
      async ({
        isAdmin,
        hub_status,
        actual_state,
        counts_in_orga_quota,
        target_state,
      }) => {
        const initialDeployment = (await insertOpenCtiDeploymentRequest({
          hub_status,
          actual_state,
        })) as DeploymentRequest;
        const cancellationReason = isAdmin ? undefined : 'my reason';
        const deployment = await DeploymentsApp.cancelDeploymentRequest(
          initialDeployment.id,
          isAdmin,
          cancellationReason
        );

        expect(deployment).toMatchObject({
          hub_status: DeploymentRequestHubStatus.Cancelled,
          target_state: target_state,
          counts_in_orga_quota,
          cancellation_date: expect.any(Date),
          cancellation_user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
          cancellation_reason: isAdmin ? null : cancellationReason,
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

        if (
          [
            DeploymentRequestHubStatus.Active,
            DeploymentRequestHubStatus.Pending,
            DeploymentRequestHubStatus.Provisioning,
          ].includes(hub_status)
        ) {
          expect(freePlaceSpy).toHaveBeenCalledWith(
            initialDeployment.platform_identifier,
            initialDeployment.region
          );
        } else {
          expect(freePlaceSpy).not.toHaveBeenCalled();
        }
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

      requestContext.set(requestContextAdminSecondOrga);
      const call = DeploymentsApp.cancelDeploymentRequest(deployment.id, false);
      await expect(call).rejects.toThrow(
        ForbiddenErrorCode.UserIsNotInOrganization
      );
    });

    it('should not throw if user is not in organization and isAdmin', async () => {
      const deployment = (await insertOpenCtiDeploymentRequest(
        {}
      )) as DeploymentRequest;

      requestContext.set(requestContextAdminSecondOrga);
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

      await DeploymentsApp.cancelDeploymentRequest(
        deployment.id,
        false,
        'CancellationReason'
      );

      expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
        '@timestamp': '2025-02-03T13:12:15.000Z',
        event_type: TelemetryEventType.UPDATE_DEPLOYMENT,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        organization_name: TEST_ORGANIZATIONS.FILIGRAN.NAME,
        organization_type: TelemetryOrganizationType.PROFESSIONAL,
        source: TELEMETRY_SOURCE,
        user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        deployment_id: deployment.id,
        deployment_type: DeploymentRequestDeploymentType.Trial,
        status: DeploymentRequestHubStatus.Cancelled,
        start_date: null,
        end_date: null,
        platform_id: null,
        cancellation_reason: 'CancellationReason',
      });
    });

    it('should send a mail to the trial requester', async () => {
      const deployment = (await insertOpenCtiDeploymentRequest({
        user_requester_id:
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID,
      })) as DeploymentRequest;

      await DeploymentsApp.cancelDeploymentRequest(deployment.id, true);

      expect(mockSendMail).toHaveBeenCalledWith({
        to: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.EMAIL,
        template: 'opencti_free_trial_cancelled',
        params: {
          firstName: '',
        },
      });
    });
  });

  describe('updateDeploymentQuotaCapacity', () => {
    const platformIdentifier = PlatformIdentifier.Opencti;
    const region = DeploymentRequestPlatformRegion.EuWest;
    beforeEach(async () => {
      await db<DeploymentRequest>('DeploymentRequest').del();
    });

    const insertRequest = async (
      hubStatus: DeploymentRequestHubStatus,
      ordering: number = 1
    ): Promise<DeploymentRequest> => {
      return (await insertOpenCtiDeploymentRequest({
        platform_identifier: platformIdentifier,
        region,
        hub_status: hubStatus,
        ordering,
      }))!;
    };

    const initQuota = async ({
      capacity,
      availability,
    }: {
      capacity: number;
      availability: number;
    }) => {
      await db<DeploymentRequestQuota>('DeploymentRequestQuota')
        .update({
          capacity,
          availability,
        })
        .where({
          platform_identifier: platformIdentifier,
          region,
        });
    };

    const assertQuota = async ({
      capacity,
      availability,
    }: {
      capacity: number;
      availability: number;
    }) => {
      const newQuota = await db<DeploymentRequestQuota>(
        'DeploymentRequestQuota'
      )
        .select('*')
        .where({
          platform_identifier: platformIdentifier,
          region,
        })
        .first();

      expect(newQuota).toBeDefined();
      expect(newQuota!.capacity).toBe(capacity);
      expect(newQuota!.availability).toBe(availability);
    };

    describe('increase capacity', () => {
      it('should move queued request to pending when there is space available', async () => {
        await initQuota({ capacity: 2, availability: 0 });
        const { id: activeRequestId } = await insertRequest(
          DeploymentRequestHubStatus.Active
        );
        const { id: pendingRequestId } = await insertRequest(
          DeploymentRequestHubStatus.Pending,
          2
        );
        const { id: queuedRequestId1 } = await insertRequest(
          DeploymentRequestHubStatus.Queued,
          7
        );
        const { id: queuedRequestId2 } = await insertRequest(
          DeploymentRequestHubStatus.Queued,
          4
        );

        await DeploymentsApp.updateDeploymentQuotaCapacity({
          platformIdentifier,
          region,
          newCapacity: 4,
        });

        await assertQuota({ capacity: 4, availability: 0 });

        await assertDeploymentRequestProperties(activeRequestId, {
          hub_status: DeploymentRequestHubStatus.Active,
        });
        await assertDeploymentRequestProperties(pendingRequestId, {
          hub_status: DeploymentRequestHubStatus.Pending,
          ordering: 2,
        });
        await assertDeploymentRequestProperties(queuedRequestId1, {
          hub_status: DeploymentRequestHubStatus.Pending,
          ordering: 4,
        });
        await assertDeploymentRequestProperties(queuedRequestId2, {
          hub_status: DeploymentRequestHubStatus.Pending,
          ordering: 3,
        });
      });

      it('should not move queued request to pending when there is just enough space for active', async () => {
        await initQuota({ capacity: 1, availability: -1 });
        const { id: activeRequestId1 } = await insertRequest(
          DeploymentRequestHubStatus.Active
        );
        const { id: activeRequestId2 } = await insertRequest(
          DeploymentRequestHubStatus.Active
        );
        const { id: queuedRequestId } = await insertRequest(
          DeploymentRequestHubStatus.Queued
        );

        await DeploymentsApp.updateDeploymentQuotaCapacity({
          platformIdentifier,
          region,
          newCapacity: 2,
        });

        await assertQuota({ capacity: 2, availability: 0 });

        await assertDeploymentRequestProperties(activeRequestId1, {
          hub_status: DeploymentRequestHubStatus.Active,
        });
        await assertDeploymentRequestProperties(activeRequestId2, {
          hub_status: DeploymentRequestHubStatus.Active,
        });
        await assertDeploymentRequestProperties(queuedRequestId, {
          hub_status: DeploymentRequestHubStatus.Queued,
        });
      });

      it('should not move queued request to pending when there is not more space available', async () => {
        await initQuota({ capacity: 1, availability: -2 });
        const { id: activeRequestId1 } = await insertRequest(
          DeploymentRequestHubStatus.Active
        );
        const { id: activeRequestId2 } = await insertRequest(
          DeploymentRequestHubStatus.Active
        );
        const { id: activeRequestId3 } = await insertRequest(
          DeploymentRequestHubStatus.Active
        );
        const { id: queuedRequestId } = await insertRequest(
          DeploymentRequestHubStatus.Queued
        );

        await DeploymentsApp.updateDeploymentQuotaCapacity({
          platformIdentifier,
          region,
          newCapacity: 2,
        });

        await assertQuota({ capacity: 2, availability: -1 });

        await assertDeploymentRequestProperties(activeRequestId1, {
          hub_status: DeploymentRequestHubStatus.Active,
        });
        await assertDeploymentRequestProperties(activeRequestId2, {
          hub_status: DeploymentRequestHubStatus.Active,
        });
        await assertDeploymentRequestProperties(activeRequestId3, {
          hub_status: DeploymentRequestHubStatus.Active,
        });
        await assertDeploymentRequestProperties(queuedRequestId, {
          hub_status: DeploymentRequestHubStatus.Queued,
        });
      });

      it('should send telemetry event for each request moved', async () => {
        vi.useFakeTimers();
        const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
        vi.setSystemTime(date);

        await initQuota({ capacity: 0, availability: 0 });

        const { id: queuedRequestId1 } = await insertRequest(
          DeploymentRequestHubStatus.Queued
        );
        const { id: queuedRequestId2 } = await insertRequest(
          DeploymentRequestHubStatus.Queued
        );

        await DeploymentsApp.updateDeploymentQuotaCapacity({
          platformIdentifier,
          region,
          newCapacity: 2,
        });

        await assertQuota({ capacity: 2, availability: 0 });

        expect(telemetrySpy).toHaveBeenCalledTimes(2);
        expect(telemetrySpy).toHaveBeenCalledWith({
          '@timestamp': '2025-02-03T13:12:15.000Z',
          event_type: TelemetryEventType.UPDATE_DEPLOYMENT,
          organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
          organization_name: TEST_ORGANIZATIONS.FILIGRAN.NAME,
          organization_type: TelemetryOrganizationType.PROFESSIONAL,
          source: TELEMETRY_SOURCE,
          user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
          deployment_id: queuedRequestId1!,
          deployment_type: DeploymentRequestDeploymentType.Trial,
          platform_id: null,
          end_date: null,
          start_date: null,
          status: DeploymentRequestHubStatus.Pending,
        });
        expect(telemetrySpy).toHaveBeenCalledWith({
          '@timestamp': '2025-02-03T13:12:15.000Z',
          event_type: TelemetryEventType.UPDATE_DEPLOYMENT,
          organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
          organization_name: TEST_ORGANIZATIONS.FILIGRAN.NAME,
          organization_type: TelemetryOrganizationType.PROFESSIONAL,
          source: TELEMETRY_SOURCE,
          user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
          deployment_id: queuedRequestId2!,
          deployment_type: DeploymentRequestDeploymentType.Trial,
          platform_id: null,
          end_date: null,
          start_date: null,
          status: DeploymentRequestHubStatus.Pending,
        });
      });
    });
    describe('decrease capacity', () => {
      it('should release pending requests from availability', async () => {
        await initQuota({ capacity: 1, availability: 0 });
        const { id: pendingRequestId } = await insertRequest(
          DeploymentRequestHubStatus.Pending
        );

        await DeploymentsApp.updateDeploymentQuotaCapacity({
          platformIdentifier,
          region,
          newCapacity: 0,
        });

        await assertQuota({ capacity: 0, availability: 0 });

        await assertDeploymentRequestProperties(pendingRequestId, {
          hub_status: DeploymentRequestHubStatus.Queued,
        });
      });

      it('should only release pending requests until availability is equal to zero', async () => {
        await initQuota({ capacity: 2, availability: 0 });
        const { id: pendingRequestId1 } = await insertRequest(
          DeploymentRequestHubStatus.Pending
        );
        const { id: pendingRequestId2 } = await insertRequest(
          DeploymentRequestHubStatus.Pending
        );

        await DeploymentsApp.updateDeploymentQuotaCapacity({
          platformIdentifier,
          region,
          newCapacity: 1,
        });

        await assertQuota({ capacity: 1, availability: 0 });

        await assertDeploymentRequestProperties(pendingRequestId1, {
          hub_status: DeploymentRequestHubStatus.Queued,
        });
        await assertDeploymentRequestProperties(pendingRequestId2, {
          hub_status: DeploymentRequestHubStatus.Pending,
        });
      });

      it('should move pending requests to queued with the right ordering', async () => {
        await initQuota({ capacity: 2, availability: 0 });
        const { id: pendingRequestId1 } = await insertRequest(
          DeploymentRequestHubStatus.Pending,
          4
        );
        const { id: pendingRequestId2 } = await insertRequest(
          DeploymentRequestHubStatus.Pending,
          3
        );
        const { id: queuedRequestId1 } = await insertRequest(
          DeploymentRequestHubStatus.Queued,
          2
        );
        const { id: queuedRequestId2 } = await insertRequest(
          DeploymentRequestHubStatus.Queued,
          5
        );

        await DeploymentsApp.updateDeploymentQuotaCapacity({
          platformIdentifier,
          region,
          newCapacity: 0,
        });

        await assertQuota({ capacity: 0, availability: 0 });

        await assertDeploymentRequestProperties(pendingRequestId1, {
          hub_status: DeploymentRequestHubStatus.Queued,
          ordering: 2,
        });
        await assertDeploymentRequestProperties(pendingRequestId2, {
          hub_status: DeploymentRequestHubStatus.Queued,
          ordering: 1,
        });
        await assertDeploymentRequestProperties(queuedRequestId1, {
          hub_status: DeploymentRequestHubStatus.Queued,
          ordering: 4,
        });
        await assertDeploymentRequestProperties(queuedRequestId2, {
          hub_status: DeploymentRequestHubStatus.Queued,
          ordering: 7,
        });
      });

      it('should move only pending requests to free place when new availability is negative', async () => {
        await initQuota({ capacity: 3, availability: 0 });
        const { id: activeRequestId1 } = await insertRequest(
          DeploymentRequestHubStatus.Active
        );
        const { id: activeRequestId2 } = await insertRequest(
          DeploymentRequestHubStatus.Active
        );
        const { id: pendingRequestId } = await insertRequest(
          DeploymentRequestHubStatus.Pending
        );
        const { id: queuedRequestId } = await insertRequest(
          DeploymentRequestHubStatus.Queued
        );

        await DeploymentsApp.updateDeploymentQuotaCapacity({
          platformIdentifier,
          region,
          newCapacity: 1,
        });

        await assertQuota({ capacity: 1, availability: -1 });

        await assertDeploymentRequestProperties(activeRequestId1, {
          hub_status: DeploymentRequestHubStatus.Active,
        });
        await assertDeploymentRequestProperties(activeRequestId2, {
          hub_status: DeploymentRequestHubStatus.Active,
        });
        await assertDeploymentRequestProperties(pendingRequestId, {
          hub_status: DeploymentRequestHubStatus.Queued,
        });
        await assertDeploymentRequestProperties(queuedRequestId, {
          hub_status: DeploymentRequestHubStatus.Queued,
        });
      });
      it('should not move pending requests to queue when new availability is equal to zero', async () => {
        await initQuota({ capacity: 3, availability: 1 });
        const { id: activeRequestId } = await insertRequest(
          DeploymentRequestHubStatus.Active
        );
        const { id: pendingRequestId } = await insertRequest(
          DeploymentRequestHubStatus.Pending
        );

        await DeploymentsApp.updateDeploymentQuotaCapacity({
          platformIdentifier,
          region,
          newCapacity: 2,
        });

        await assertQuota({ capacity: 2, availability: 0 });

        await assertDeploymentRequestProperties(activeRequestId, {
          hub_status: DeploymentRequestHubStatus.Active,
        });
        await assertDeploymentRequestProperties(pendingRequestId, {
          hub_status: DeploymentRequestHubStatus.Pending,
        });
      });
      it('should not move pending requests to queue when new availability is positive', async () => {
        await initQuota({ capacity: 4, availability: 2 });
        const { id: activeRequestId } = await insertRequest(
          DeploymentRequestHubStatus.Active
        );
        const { id: pendingRequestId } = await insertRequest(
          DeploymentRequestHubStatus.Pending
        );
        await DeploymentsApp.updateDeploymentQuotaCapacity({
          platformIdentifier,
          region,
          newCapacity: 3,
        });

        await assertQuota({ capacity: 3, availability: 1 });

        await assertDeploymentRequestProperties(activeRequestId, {
          hub_status: DeploymentRequestHubStatus.Active,
        });
        await assertDeploymentRequestProperties(pendingRequestId, {
          hub_status: DeploymentRequestHubStatus.Pending,
        });
      });

      it('should send telemetry event for each request moved', async () => {
        vi.useFakeTimers();
        const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
        vi.setSystemTime(date);

        await initQuota({ capacity: 2, availability: 0 });

        const { id: pendingRequestId1 } = await insertRequest(
          DeploymentRequestHubStatus.Pending
        );
        const { id: pendingRequestId2 } = await insertRequest(
          DeploymentRequestHubStatus.Pending
        );

        await DeploymentsApp.updateDeploymentQuotaCapacity({
          platformIdentifier,
          region,
          newCapacity: 0,
        });

        await assertQuota({ capacity: 0, availability: 0 });

        expect(telemetrySpy).toHaveBeenCalledTimes(2);
        expect(telemetrySpy).toHaveBeenCalledWith({
          '@timestamp': '2025-02-03T13:12:15.000Z',
          event_type: TelemetryEventType.UPDATE_DEPLOYMENT,
          organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
          organization_name: TEST_ORGANIZATIONS.FILIGRAN.NAME,
          organization_type: TelemetryOrganizationType.PROFESSIONAL,
          source: TELEMETRY_SOURCE,
          user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
          deployment_id: pendingRequestId1!,
          deployment_type: DeploymentRequestDeploymentType.Trial,
          platform_id: null,
          end_date: null,
          start_date: null,
          status: DeploymentRequestHubStatus.Queued,
        });
        expect(telemetrySpy).toHaveBeenCalledWith({
          '@timestamp': '2025-02-03T13:12:15.000Z',
          event_type: TelemetryEventType.UPDATE_DEPLOYMENT,
          organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
          organization_name: TEST_ORGANIZATIONS.FILIGRAN.NAME,
          organization_type: TelemetryOrganizationType.PROFESSIONAL,
          source: TELEMETRY_SOURCE,
          user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
          deployment_id: pendingRequestId2!,
          deployment_type: DeploymentRequestDeploymentType.Trial,
          platform_id: null,
          end_date: null,
          start_date: null,
          status: DeploymentRequestHubStatus.Queued,
        });
      });
    });
  });

  describe('expireTrials', () => {
    let freePlaceSpy: MockInstance;
    beforeEach(() => {
      freePlaceSpy = vi
        .spyOn(DeploymentsQuotasDomain, 'freePlace')
        .mockResolvedValue();
    });

    it('should expire past trials only', async () => {
      vi.useFakeTimers();
      const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
      vi.setSystemTime(date);

      const expiredTrial = await insertOpenCtiDeploymentRequest({
        hub_status: DeploymentRequestHubStatus.Active,
        target_state: DeploymentRequestPlatformState.Active,
        actual_state: DeploymentRequestHubStatus.Active,
        end_date: new Date(Date.UTC(2025, 1, 1)),
      });
      const nonExpiredTrial = await insertOpenCtiDeploymentRequest({
        hub_status: DeploymentRequestHubStatus.Active,
        target_state: DeploymentRequestPlatformState.Active,
        actual_state: DeploymentRequestHubStatus.Active,
        end_date: new Date(Date.UTC(2025, 1, 5)),
      });

      await DeploymentsApp.expireTrials();

      const expiredDeploymentRequest =
        await DeploymentRequestDomain.loadDeploymentRequestBy({
          id: expiredTrial?.id as DeploymentRequestId,
        });
      const nonExpiredDeploymentRequest =
        await DeploymentRequestDomain.loadDeploymentRequestBy({
          id: nonExpiredTrial?.id as DeploymentRequestId,
        });

      expect(expiredDeploymentRequest).toMatchObject({
        hub_status: DeploymentRequestHubStatus.Expired,
        target_state: DeploymentRequestPlatformState.Removed,
      });

      expect(nonExpiredDeploymentRequest).toMatchObject({
        hub_status: DeploymentRequestHubStatus.Active,
        target_state: DeploymentRequestPlatformState.Active,
      });

      expect(freePlaceSpy).toHaveBeenCalledTimes(1);
    });

    it.each`
      hub_status                                 | target_state
      ${DeploymentRequestHubStatus.Provisioning} | ${DeploymentRequestPlatformState.Active}
      ${DeploymentRequestHubStatus.Pending}      | ${DeploymentRequestPlatformState.Active}
      ${DeploymentRequestHubStatus.Queued}       | ${DeploymentRequestPlatformState.Unprovisioned}
      ${DeploymentRequestHubStatus.Cancelled}    | ${DeploymentRequestPlatformState.Removed}
      ${DeploymentRequestHubStatus.Expired}      | ${DeploymentRequestPlatformState.Removed}
    `(
      `should not expire trials in status $hub_status`,
      async ({ hub_status, target_state }) => {
        vi.useFakeTimers();
        const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
        vi.setSystemTime(date);
        const expiredDate = new Date(Date.UTC(2025, 1, 1));
        const trial = await insertOpenCtiDeploymentRequest({
          hub_status: hub_status,
          target_state: target_state,
          end_date: expiredDate,
        });

        await DeploymentsApp.expireTrials();

        const expiredDeploymentRequest =
          await DeploymentRequestDomain.loadDeploymentRequestBy({
            id: trial?.id as DeploymentRequestId,
          });

        expect(expiredDeploymentRequest).toMatchObject({
          hub_status: hub_status,
          target_state: target_state,
        });
      }
    );
    it('should send a mail to the requester', async () => {
      vi.useFakeTimers();
      const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
      vi.setSystemTime(date);
      const expiredDate = new Date(Date.UTC(2025, 1, 1));

      await insertOpenCtiDeploymentRequest({
        hub_status: DeploymentRequestHubStatus.Active,
        target_state: DeploymentRequestPlatformState.Active,
        end_date: expiredDate,
        user_requester_id:
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID,
      });

      await DeploymentsApp.expireTrials();

      expect(mockSendMail).toHaveBeenCalledWith({
        to: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.EMAIL,
        template: 'opencti_free_trial_expired',
        params: {
          firstName: '',
        },
      });
    });

    it('should send a telemetry event', async () => {
      vi.useFakeTimers();
      const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
      vi.setSystemTime(date);
      const start_date = new Date(2024, 12, 1);
      const end_date = new Date(2025, 1, 1);

      const trial = await insertOpenCtiDeploymentRequest({
        hub_status: DeploymentRequestHubStatus.Active,
        target_state: DeploymentRequestPlatformState.Active,
        start_date,
        end_date,
        user_requester_id:
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID,
        organization_requester_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
      });

      await DeploymentsApp.expireTrials();

      expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
        '@timestamp': '2025-02-03T13:12:15.000Z',
        event_type: TelemetryEventType.UPDATE_DEPLOYMENT,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        organization_name: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.NAME,
        organization_type: TelemetryOrganizationType.PROFESSIONAL,
        source: TELEMETRY_SOURCE,
        user_id: SYSTEM_USER_UUID,
        deployment_id: trial?.id,
        deployment_type: DeploymentRequestDeploymentType.Trial,
        platform_id: null,
        start_date,
        end_date,
        status: DeploymentRequestHubStatus.Expired,
      });
    });
  });

  describe('releaseDeploymentRequestPlace', () => {
    let freePlaceSpy: MockInstance;
    beforeEach(() => {
      freePlaceSpy = vi
        .spyOn(DeploymentsQuotasDomain, 'freePlace')
        .mockResolvedValue();
    });

    describe('not counted in quotas', () => {
      it.each`
        hub_status
        ${DeploymentRequestHubStatus.Cancelled}
        ${DeploymentRequestHubStatus.Expired}
        ${DeploymentRequestHubStatus.Failed}
        ${DeploymentRequestHubStatus.Queued}
      `(
        'should not free place when request hub status is $hub_status',
        async ({ hub_status }) => {
          const deploymentRequest = await insertOpenCtiDeploymentRequest({
            hub_status,
          });

          await DeploymentsApp.releaseDeploymentRequestPlace(
            deploymentRequest!.hub_status as DeploymentRequestHubStatus,
            deploymentRequest!.platform_identifier as PlatformIdentifier,
            deploymentRequest!.region as DeploymentRequestPlatformRegion
          );

          expect(freePlaceSpy).not.toHaveBeenCalled();
        }
      );
    });

    it('should set one queued request as pending and not free place', async () => {
      const deploymentRequestToRelease = await insertOpenCtiDeploymentRequest({
        hub_status: DeploymentRequestHubStatus.Active,
      });
      const queuedDeploymentRequest = {
        ...deploymentRequestToRelease!,
        hub_status: DeploymentRequestHubStatus.Pending,
      };
      const setFirstQueuedRequestAsPendingSpy = vi
        .spyOn(DeploymentRequestDomain, 'setFirstQueuedRequestAsPending')
        .mockResolvedValue(queuedDeploymentRequest);

      await DeploymentsApp.releaseDeploymentRequestPlace(
        deploymentRequestToRelease!.hub_status as DeploymentRequestHubStatus,
        deploymentRequestToRelease!.platform_identifier as PlatformIdentifier,
        deploymentRequestToRelease!.region as DeploymentRequestPlatformRegion
      );

      expect(setFirstQueuedRequestAsPendingSpy).toHaveBeenCalledWith(
        deploymentRequestToRelease!.platform_identifier,
        deploymentRequestToRelease!.region
      );
      expect(freePlaceSpy).not.toHaveBeenCalled();
    });

    it('should free place when deployment request was not moved to pending', async () => {
      vi.spyOn(
        DeploymentRequestDomain,
        'setFirstQueuedRequestAsPending'
      ).mockResolvedValue(null);

      const deploymentRequest = await insertOpenCtiDeploymentRequest({
        hub_status: DeploymentRequestHubStatus.Active,
      });

      await DeploymentsApp.releaseDeploymentRequestPlace(
        deploymentRequest!.hub_status as DeploymentRequestHubStatus,
        deploymentRequest!.platform_identifier as PlatformIdentifier,
        deploymentRequest!.region as DeploymentRequestPlatformRegion
      );

      expect(freePlaceSpy).toHaveBeenCalledWith(
        deploymentRequest!.platform_identifier,
        deploymentRequest!.region
      );
    });

    describe('telemetry', () => {
      it('should not send telemetry event when deployment request was not moved to pending', async () => {
        vi.spyOn(
          DeploymentRequestDomain,
          'setFirstQueuedRequestAsPending'
        ).mockResolvedValue(null);

        const deploymentRequest = await insertOpenCtiDeploymentRequest({
          hub_status: DeploymentRequestHubStatus.Active,
        });

        await DeploymentsApp.releaseDeploymentRequestPlace(
          deploymentRequest!.hub_status as DeploymentRequestHubStatus,
          deploymentRequest!.platform_identifier as PlatformIdentifier,
          deploymentRequest!.region as DeploymentRequestPlatformRegion
        );

        expect(telemetrySpy).not.toHaveBeenCalled();
      });

      it('should send telemetry event when deployment request was moved to pending', async () => {
        vi.useFakeTimers();
        const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
        vi.setSystemTime(date);

        const queuedDeploymentRequest = await insertOpenCtiDeploymentRequest({
          hub_status: DeploymentRequestHubStatus.Queued,
          activity_sector: 'cybersecurity',
          region: DeploymentRequestPlatformRegion.UsEast,
          platform_id: uuidv4(),
        });

        vi.spyOn(
          DeploymentRequestDomain,
          'setFirstQueuedRequestAsPending'
        ).mockResolvedValue({
          ...queuedDeploymentRequest!,
          hub_status: DeploymentRequestHubStatus!.Pending,
        });
        const deploymentRequest = await insertOpenCtiDeploymentRequest({
          hub_status: DeploymentRequestHubStatus.Active,
        });

        await DeploymentsApp.releaseDeploymentRequestPlace(
          deploymentRequest!.hub_status as DeploymentRequestHubStatus,
          deploymentRequest!.platform_identifier as PlatformIdentifier,
          deploymentRequest!.region as DeploymentRequestPlatformRegion
        );

        expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
          '@timestamp': '2025-02-03T13:12:15.000Z',
          event_type: TelemetryEventType.UPDATE_DEPLOYMENT,
          organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
          organization_name: TEST_ORGANIZATIONS.FILIGRAN.NAME,
          organization_type: TelemetryOrganizationType.PROFESSIONAL,
          source: TELEMETRY_SOURCE,
          user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
          deployment_id: queuedDeploymentRequest!.id,
          deployment_type: DeploymentRequestDeploymentType.Trial,
          platform_id: queuedDeploymentRequest!.platform_id,
          start_date: null,
          end_date: null,
          status: DeploymentRequestHubStatus.Pending,
        });
      });
    });
  });
});
