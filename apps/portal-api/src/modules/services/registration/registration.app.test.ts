import { MockInstance } from '@vitest/spy';
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
import { db } from '../../../../knexfile';
import {
  contextBypassUser,
  requestContextAdminSecondOrga,
  requestContextAdminUser,
  requestContextSimpleUserSecondOrga,
  SERVICES,
  TEST_ORGANIZATIONS,
} from '../../../../tests/tests.const';
import {
  DeploymentRequestActivitySector,
  DeploymentRequestDeploymentType,
  DeploymentRequestHubStatus,
  DeploymentRequestJobTitle,
  DeploymentRequestPlatformRegion,
  DeploymentRequestPlatformState,
  DeploymentRequestUseCase,
  PlatformContract,
  PlatformIdentifier,
  PlatformInput,
  PlatformRegistrationConnectivityStatus,
  PlatformRegistrationStatus,
  ServiceConfigurationStatus,
  ServiceDefinitionIdentifier,
  ServiceInstanceCreationStatus,
} from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import DeploymentRequest, {
  DeploymentRequestId,
} from '../../../model/kanel/public/DeploymentRequest';
import ServiceConfiguration from '../../../model/kanel/public/ServiceConfiguration';
import ServiceInstance, {
  ServiceInstanceId,
} from '../../../model/kanel/public/ServiceInstance';
import Subscription, {
  SubscriptionId,
} from '../../../model/kanel/public/Subscription';

import { UserLoadUserBy } from '../../../model/user';
import * as authHelper from '../../../security/auth.helper';
import {
  BadRequestErrorCode,
  ErrorCode,
  ForbiddenErrorCode,
  NotFoundErrorCode,
} from '../../../utils/error/error.code';
import * as subscriptionDomain from '../../subcription/subscription.domain';
import { telemetryApp } from '../../telemetry/telemetry.app';
import {
  TELEMETRY_SOURCE,
  TelemetryOrganizationType,
  TelemetryTargetProduct,
} from '../../telemetry/telemetry.const';
import { TelemetryEventType } from '../../telemetry/telemetry.types';
import { serviceContractDomain } from '../contract/service-configuration.domain';
import { DeploymentRequestDomain } from '../deployments/deployments.domain';
import * as serviceInstanceDomain from '../service-instance.domain';
import {
  deleteServiceInstanceBy,
  loadServiceInstanceBy,
} from '../service-instance.domain';
import { registrationApp } from './registration.app';
import { registrationDomain } from './registration.domain';

describe('Registration app', () => {
  afterAll(async () => {
    vi.useRealTimers();
  });

  describe('loadPlatformAssociatedOrganization', () => {
    it('should return null when platform is not found', async () => {
      const result =
        await registrationApp.loadPlatformAssociatedOrganization('unknown-id');

      expect(result).toBeNull();
    });

    it('should throw an error when subscription is not found', async () => {
      const platformId = uuidv4();
      const serviceInstanceId = uuidv4() as ServiceInstanceId;
      await db<ServiceInstance>('ServiceInstance').insert({
        id: serviceInstanceId,
        name: 'test',
      });
      await db<ServiceConfiguration>('Service_Configuration').insert({
        service_instance_id: serviceInstanceId,
        config: { platform_id: platformId },
        status: ServiceConfigurationStatus.Active,
      });

      const call =
        registrationApp.loadPlatformAssociatedOrganization(platformId);

      await expect(call).rejects.toThrow(ErrorCode.SubscriptionNotFound);
    });

    it('should throw an error when user is not in the organization', async () => {
      const platformId = uuidv4();
      const serviceInstanceId = uuidv4() as ServiceInstanceId;
      const subscriptionId = uuidv4() as SubscriptionId;
      await db<ServiceInstance>('ServiceInstance').insert({
        id: serviceInstanceId,
        name: 'test',
      });
      await db<ServiceConfiguration>('Service_Configuration').insert({
        service_instance_id: serviceInstanceId,
        config: { platform_id: platformId },
        status: ServiceConfigurationStatus.Active,
      });
      await db<Subscription>('Subscription').insert({
        id: subscriptionId,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: serviceInstanceId,
      });
      requestContext.set(requestContextSimpleUserSecondOrga);
      const call =
        registrationApp.loadPlatformAssociatedOrganization(platformId);

      await expect(call).rejects.toThrow(ErrorCode.UserIsNotInOrganization);
    });

    it('should return an organization when platform is found and user is allowed', async () => {
      const platformId = uuidv4();
      const serviceInstanceId = uuidv4() as ServiceInstanceId;
      const subscriptionId = uuidv4() as SubscriptionId;
      await db<ServiceInstance>('ServiceInstance').insert({
        id: serviceInstanceId,
        name: 'test',
      });
      await db<ServiceConfiguration>('Service_Configuration').insert({
        service_instance_id: serviceInstanceId,
        config: { platform_id: platformId },
        status: ServiceConfigurationStatus.Active,
      });
      await db<Subscription>('Subscription').insert({
        id: subscriptionId,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: serviceInstanceId,
      });

      const result =
        await registrationApp.loadPlatformAssociatedOrganization(platformId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(TEST_ORGANIZATIONS.FILIGRAN.ID);
    });
  });

  describe('isPlatformRegistered', () => {
    it(`should return never registered when platform is not registered`, async () => {
      const platformId = uuidv4();
      const result = await registrationApp.isPlatformRegistered({
        platformId,
      });

      expect(result).toBeDefined();
      expect(result.status).toBe(PlatformRegistrationStatus.NeverRegistered);
      expect(result.organization).toBeUndefined();
      expect(result.platformTitle).toBeUndefined();
    });

    it('should throw subscription not found error when associated subscription is not found', async () => {
      const platformId = uuidv4();
      const serviceInstanceId = uuidv4() as ServiceInstanceId;
      await db<ServiceInstance>('ServiceInstance').insert({
        id: serviceInstanceId,
        name: 'test',
      });
      await db<ServiceConfiguration>('Service_Configuration').insert({
        service_instance_id: serviceInstanceId,
        config: { platform_id: platformId },
        status: ServiceConfigurationStatus.Active,
      });

      const call = registrationApp.isPlatformRegistered({
        platformId,
      });

      await expect(call).rejects.toThrow(ErrorCode.SubscriptionNotFound);
    });

    it('should return registered when platform registration is active', async () => {
      const platformId = uuidv4();
      const platformTitle = 'Platform title';
      const serviceInstanceId = uuidv4() as ServiceInstanceId;
      const subscriptionId = uuidv4() as SubscriptionId;

      await db<ServiceInstance>('ServiceInstance').insert({
        id: serviceInstanceId,
        name: 'test',
      });
      await db<ServiceConfiguration>('Service_Configuration').insert({
        service_instance_id: serviceInstanceId,
        config: { platform_id: platformId, platform_title: platformTitle },
        status: ServiceConfigurationStatus.Active,
      });
      await db<Subscription>('Subscription').insert({
        id: subscriptionId,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: serviceInstanceId,
      });

      const result = await registrationApp.isPlatformRegistered({
        platformId,
      });

      expect(result).toBeDefined();
      expect(result.status).toBe(PlatformRegistrationStatus.Registered);
      expect(result.organization?.id).toBe(TEST_ORGANIZATIONS.FILIGRAN.ID);
      expect(result.platformTitle).toBe(platformTitle);
    });
    it('should return unregistered when platform registration is inactive', async () => {
      const platformId = uuidv4();
      const platformTitle = 'Platform title';
      const serviceInstanceId = uuidv4() as ServiceInstanceId;
      const subscriptionId = uuidv4() as SubscriptionId;

      await db<ServiceInstance>('ServiceInstance').insert({
        id: serviceInstanceId,
        name: 'test',
      });
      await db<ServiceConfiguration>('Service_Configuration').insert({
        service_instance_id: serviceInstanceId,
        config: { platform_id: platformId, platform_title: platformTitle },
        status: ServiceConfigurationStatus.Inactive,
      });
      await db<Subscription>('Subscription').insert({
        id: subscriptionId,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: serviceInstanceId,
      });

      const result = await registrationApp.isPlatformRegistered({
        platformId,
      });

      expect(result).toBeDefined();
      expect(result.status).toBe(PlatformRegistrationStatus.Unregistered);
      expect(result.organization?.id).toBe(TEST_ORGANIZATIONS.FILIGRAN.ID);
      expect(result.platformTitle).toBe(platformTitle);
    });
  });

  describe('registerPlatform', () => {
    const platform: PlatformInput = {
      id: uuidv4(),
      title: 'My OpenCTI platform',
      url: 'http://example.com',
      contract: PlatformContract.Ee,
      version: 'X.Y.Z',
    };

    describe('invalid configuration', async () => {
      it('should throw when platformId is not valid', async () => {
        const call = registrationApp.registerPlatform({
          organizationId: TEST_ORGANIZATIONS.FILIGRAN.ID,
          platform: {
            ...platform,
            id: 'hello',
          },
          identifier: PlatformIdentifier.Opencti,
        });

        await expect(call).rejects.toThrow(
          ErrorCode.InvalidServiceConfiguration
        );
      });

      it('should throw when platformUrl is not valid', async () => {
        const call = registrationApp.registerPlatform({
          organizationId: TEST_ORGANIZATIONS.FILIGRAN.ID,
          platform: {
            ...platform,
            url: 'hello',
          },
          identifier: PlatformIdentifier.Opencti,
        });

        await expect(call).rejects.toThrow(
          ErrorCode.InvalidServiceConfiguration
        );
      });
    });

    it('should throw when user does not belong to the organization', async () => {
      requestContext.set(requestContextAdminSecondOrga);
      const call = registrationApp.registerPlatform({
        organizationId: TEST_ORGANIZATIONS.FILIGRAN.ID,
        platform,
        identifier: PlatformIdentifier.Opencti,
      });

      await expect(call).rejects.toThrow(ErrorCode.UserIsNotInOrganization);
    });

    it('should throw when user does not have the required capabilities', async () => {
      requestContext.set(requestContextSimpleUserSecondOrga);
      const call = registrationApp.registerPlatform({
        organizationId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        platform,
        identifier: PlatformIdentifier.Opencti,
      });

      await expect(call).rejects.toThrow(
        ErrorCode.MissingCapabilityOnOrganization
      );
    });

    it('return token when platform is registered', async () => {
      const token = await registrationApp.registerPlatform({
        organizationId: TEST_ORGANIZATIONS.FILIGRAN.ID,
        platform,
        identifier: PlatformIdentifier.Opencti,
      });

      expect(token).toBeDefined();
    });

    it('should send a telemetry event when opencti platform is registered', async () => {
      vi.useFakeTimers();
      const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
      vi.setSystemTime(date);
      const telemetrySpy = vi
        .spyOn(telemetryApp, 'sendTelemetryEvent')
        .mockResolvedValue();

      await registrationApp.registerPlatform({
        organizationId: TEST_ORGANIZATIONS.FILIGRAN.ID,
        platform,
        identifier: PlatformIdentifier.Opencti,
      });

      expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
        '@timestamp': '2025-02-03T13:12:15.000Z',
        event_type: TelemetryEventType.REGISTER,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        organization_name: 'Filigran',
        source: TELEMETRY_SOURCE,
        user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        platform_contract: 'EE',
        platform_version: 'X.Y.Z',
        platform_id: platform.id,
        platform_url: platform.url,
        target_product: TelemetryTargetProduct.OPEN_CTI,
        organization_type: 'Professional',
      });
    });
    it('should send a telemetry event when openaev platform is registered', async () => {
      vi.useFakeTimers();
      const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
      vi.setSystemTime(date);
      const telemetrySpy = vi
        .spyOn(telemetryApp, 'sendTelemetryEvent')
        .mockResolvedValue();

      await registrationApp.registerPlatform({
        organizationId: TEST_ORGANIZATIONS.FILIGRAN.ID,
        platform,
        identifier: PlatformIdentifier.Openaev,
      });

      expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
        '@timestamp': '2025-02-03T13:12:15.000Z',
        event_type: TelemetryEventType.REGISTER,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        organization_name: 'Filigran',
        source: TELEMETRY_SOURCE,
        user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        platform_contract: 'EE',
        platform_version: 'X.Y.Z',
        platform_id: platform.id,
        platform_url: platform.url,
        target_product: TelemetryTargetProduct.OPEN_AEV,
        organization_type: 'Professional',
      });
    });
  });

  describe('unregisterPlatform', () => {
    let platformId: string;
    let platform: PlatformInput;

    beforeEach(() => {
      platformId = uuidv4();
      platform = {
        id: platformId,
        title: 'My OpenCTI platform',
        url: 'http://example.com',
        contract: PlatformContract.Ee,
        version: 'X.Y.Z',
      };
    });

    it('should throw when user does not belong to the organization', async () => {
      await registrationApp.registerPlatform({
        organizationId: TEST_ORGANIZATIONS.FILIGRAN.ID,
        platform,
        identifier: PlatformIdentifier.Opencti,
      });

      requestContext.set(requestContextAdminSecondOrga);
      const call = registrationApp.unregisterPlatform({
        platformId,
        identifier: PlatformIdentifier.Opencti,
      });

      await expect(call).rejects.toThrow(ErrorCode.UserIsNotInOrganization);
    });

    it('should throw when user does not have the required capabilities', async () => {
      requestContext.set(requestContextAdminSecondOrga);
      await registrationApp.registerPlatform({
        organizationId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        platform,
        identifier: PlatformIdentifier.Opencti,
      });

      requestContext.set(requestContextSimpleUserSecondOrga);
      const call = registrationApp.unregisterPlatform({
        platformId,
        identifier: PlatformIdentifier.Opencti,
      });

      await expect(call).rejects.toThrow(
        ErrorCode.MissingCapabilityOnOrganization
      );
    });

    it('should throw when identifier is not the right type', async () => {
      await registrationApp.registerPlatform({
        organizationId: TEST_ORGANIZATIONS.FILIGRAN.ID,
        platform,
        identifier: PlatformIdentifier.Opencti,
      });

      const call = registrationApp.unregisterPlatform({
        platformId,
        identifier: PlatformIdentifier.Openaev,
      });

      await expect(call).rejects.toThrow(ErrorCode.InvalidPlatformIdentifier);
    });

    it('should unregister platform when the platform is still active', async () => {
      await registrationApp.registerPlatform({
        organizationId: TEST_ORGANIZATIONS.FILIGRAN.ID,
        platform,
        identifier: PlatformIdentifier.Opencti,
      });

      await registrationApp.unregisterPlatform({
        platformId,
        identifier: PlatformIdentifier.Opencti,
      });

      const serviceConfiguration =
        await serviceContractDomain.loadConfigurationByPlatform(platformId);

      expect(serviceConfiguration).toBeDefined();
      expect(serviceConfiguration?.status).toBe(
        ServiceConfigurationStatus.Inactive
      );

      const subscription = await db<Subscription>('Subscription')
        .where(
          'service_instance_id',
          '=',
          serviceConfiguration?.service_instance_id ?? ''
        )
        .select('*')
        .first();

      expect(subscription).toBeDefined();
      expect(subscription?.end_date).toBeDefined();
    });
  });

  describe('canUnregisterPlatform', () => {
    const platformId = uuidv4();

    let isUserAllowedOnOrganizationSpy: MockInstance;
    let loadConfigurationByPlatformSpy: MockInstance;
    let loadSubscriptionBySpy: MockInstance;
    let loadServiceDefinitionByServiceInstanceSpy: MockInstance;

    beforeEach(() => {
      isUserAllowedOnOrganizationSpy = vi.spyOn(
        authHelper,
        'isUserAllowedOnOrganization'
      );
      loadConfigurationByPlatformSpy = vi.spyOn(
        serviceContractDomain,
        'loadConfigurationByPlatform'
      );
      loadSubscriptionBySpy = vi.spyOn(
        subscriptionDomain,
        'loadSubscriptionBy'
      );
      loadServiceDefinitionByServiceInstanceSpy = vi.spyOn(
        serviceInstanceDomain,
        'loadServiceDefinitionByServiceInstance'
      );

      loadServiceDefinitionByServiceInstanceSpy.mockResolvedValue({
        identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should throw an error when configuration for platform does not exist', async () => {
      loadConfigurationByPlatformSpy.mockReturnValue(Promise.resolve(null));

      const call = registrationApp.canUnregisterPlatform({
        platformId,
      });

      await expect(call).rejects.toThrow(ErrorCode.PlatformNotRegistered);
    });

    it('should throw an error when subscription does not exist', async () => {
      loadConfigurationByPlatformSpy.mockReturnValue(
        Promise.resolve({ service_instance_id: uuidv4() })
      );
      loadSubscriptionBySpy.mockReturnValue(Promise.resolve(null));

      const call = registrationApp.canUnregisterPlatform({
        platformId,
      });

      await expect(call).rejects.toThrow(ErrorCode.PlatformNotRegistered);
    });

    it('should allow user to register when he has the required capabilities', async () => {
      const organizationId = uuidv4();
      isUserAllowedOnOrganizationSpy.mockReturnValue(
        Promise.resolve({ isAllowed: true })
      );
      loadConfigurationByPlatformSpy.mockReturnValue(
        Promise.resolve({ service_instance_id: uuidv4() })
      );
      loadSubscriptionBySpy.mockReturnValue(
        Promise.resolve({ organization_id: organizationId })
      );

      const result = await registrationApp.canUnregisterPlatform({
        platformId,
      });

      expect(result.isAllowed).toBeTruthy();
      expect(result.organizationId).toBe(organizationId);
    });

    it('should not allow user to register when he does not have the required capabilities', async () => {
      const organizationId = uuidv4();
      loadConfigurationByPlatformSpy.mockReturnValue(
        Promise.resolve({ service_instance_id: uuidv4() })
      );
      loadSubscriptionBySpy.mockReturnValue(
        Promise.resolve({ organization_id: organizationId })
      );
      isUserAllowedOnOrganizationSpy.mockReturnValue(
        Promise.resolve({ isAllowed: false, isInOrganization: false })
      );

      const result = await registrationApp.canUnregisterPlatform({
        platformId,
      });

      expect(result.isAllowed).toBeFalsy();
      expect(result.isInOrganization).toBeFalsy();
      expect(result.organizationId).toBe(organizationId);
    });
  });

  describe('loadPlatformRegistrationStatus', () => {
    it('should return inactive when platform is not registered', async () => {
      const result = await registrationApp.loadPlatformRegistrationStatus({
        platformId: uuidv4(),
        token: uuidv4(),
      });

      expect(result.status).toBe(
        PlatformRegistrationConnectivityStatus.Inactive
      );
    });

    it('should return active when platform is registered', async () => {
      const platformId = uuidv4();
      const token = await registrationApp.registerPlatform({
        organizationId: TEST_ORGANIZATIONS.FILIGRAN.ID,
        platform: {
          id: platformId,
          url: 'http://example.com',
          contract: PlatformContract.Ee,
          title: 'Fake title',
          version: 'X.Y.Z',
        },
        identifier: PlatformIdentifier.Opencti,
      });

      const result = await registrationApp.loadPlatformRegistrationStatus({
        platformId,
        token,
      });

      expect(result.status).toBe(PlatformRegistrationConnectivityStatus.Active);
    });

    describe('refreshPlatformRegistrationConnectivityStatus', () => {
      it('should throw an error when version is not formatted as a semantic version', async () => {
        const call =
          registrationApp.refreshPlatformRegistrationConnectivityStatus({
            platformId: uuidv4(),
            token: uuidv4(),
            platformVersion: '9.Y.Z',
          });

        await expect(call).rejects.toThrow(ErrorCode.InvalidPlatformVersion);
      });

      it('should return inactive when platform is not registered but identifier is not provided', async () => {
        const result =
          await registrationApp.refreshPlatformRegistrationConnectivityStatus({
            platformId: uuidv4(),
            token: uuidv4(),
            platformVersion: '7.0.0',
          });

        expect(result.status).toBe(
          PlatformRegistrationConnectivityStatus.Inactive
        );
      });

      it('should return not found when platform is not registered and has version below compatibility version', async () => {
        const result =
          await registrationApp.refreshPlatformRegistrationConnectivityStatus({
            platformId: uuidv4(),
            token: uuidv4(),
            platformVersion: '7.0.0',
            platformIdentifier: PlatformIdentifier.Opencti,
          });

        expect(result.status).toBe(
          PlatformRegistrationConnectivityStatus.NotFound
        );
      });

      it('should return inactive when platform is not registered and has version above compatibility version', async () => {
        const result =
          await registrationApp.refreshPlatformRegistrationConnectivityStatus({
            platformId: uuidv4(),
            token: uuidv4(),
            platformVersion: '6.0.0',
          });

        expect(result.status).toBe(
          PlatformRegistrationConnectivityStatus.Inactive
        );
      });

      it('should return active when platform is registered and update version', async () => {
        const platformId = uuidv4();
        const token = await registrationApp.registerPlatform({
          organizationId: TEST_ORGANIZATIONS.FILIGRAN.ID,
          platform: {
            id: platformId,
            url: 'http://example.com',
            contract: PlatformContract.Ee,
            title: 'Fake title',
            version: 'X.Y.Z',
          },
          identifier: PlatformIdentifier.Opencti,
        });

        const result =
          await registrationApp.refreshPlatformRegistrationConnectivityStatus({
            platformId,
            token,
            platformVersion: '6.7.18',
          });

        const getPlatforms = await registrationApp.loadRegisteredPlatforms({
          identifier: PlatformIdentifier.Opencti,
        });
        const currentPlatform = getPlatforms.find(
          (registeredPlatform) => platformId === registeredPlatform.platform_id
        );
        expect(currentPlatform?.version).toBe('6.7.18');
        expect(result.status).toBe(
          PlatformRegistrationConnectivityStatus.Active
        );
      });
    });

    it('should return inactive when platform is unregistered', async () => {
      const platformId = uuidv4();
      const token = await registrationApp.registerPlatform({
        organizationId: TEST_ORGANIZATIONS.FILIGRAN.ID,
        platform: {
          id: platformId,
          url: 'http://example.com',
          contract: PlatformContract.Ee,
          title: 'Fake title',
          version: 'X.Y.Z',
        },
        identifier: PlatformIdentifier.Opencti,
      });

      await registrationApp.unregisterPlatform({
        platformId,
        identifier: PlatformIdentifier.Opencti,
      });

      const result = await registrationApp.loadPlatformRegistrationStatus({
        platformId: platformId,
        token,
      });

      expect(result.status).toBe(
        PlatformRegistrationConnectivityStatus.Inactive
      );
    });
  });

  describe('refreshUserPlatformToken', () => {
    it('should generate a token and add it to the user each time it is called', async () => {
      requestContext.set(requestContextAdminUser);
      const { token } = await registrationApp.refreshUserPlatformToken(
        contextBypassUser.user.id
      );
      const user = await db<UserLoadUserBy>('User')
        .where({ id: contextBypassUser.user.id })
        .first();

      expect(token).toBe(user.platform_token);

      const { token: anotherToken } =
        await registrationApp.refreshUserPlatformToken(
          contextBypassUser.user.id
        );
      const updatedUser = await db<UserLoadUserBy>('User')
        .where({ id: contextBypassUser.user.id })
        .first();

      expect(anotherToken).toBe(updatedUser.platform_token);
      expect(anotherToken === token).toBeFalsy();
    });
  });

  describe('autoRegisterPlatform', () => {
    let deploymentRequest: DeploymentRequest;
    const platformConfiguration = {
      id: uuidv4(),
      title: 'My OpenCTI platform',
      url: 'http://example.com',
      contract: PlatformContract.Trial,
      version: 'X.Y.Z',
    };

    beforeEach(async () => {
      const serviceInstanceId = await registrationDomain.registerNewPlatform({
        serviceDefinitionId: SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID,
        organizationId: TEST_ORGANIZATIONS.FILIGRAN.ID,
        platformIdentifier: PlatformIdentifier.Opencti,
        serviceInstanceCreationStatus: ServiceInstanceCreationStatus.Pending,
      });

      deploymentRequest =
        (await DeploymentRequestDomain.insertDeploymentRequest({
          activity_sector: DeploymentRequestActivitySector.ComputerGames,
          id: uuidv4() as DeploymentRequestId,
          job_title: DeploymentRequestJobTitle.CLevel,
          organization_requester_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
          platform_identifier: PlatformIdentifier.Opencti,
          platform_token: uuidv4(),
          region: DeploymentRequestPlatformRegion.UsEast,
          request_date: new Date(Date.UTC(2025, 1, 3, 13, 12, 15)),
          hub_status: DeploymentRequestHubStatus.Pending,
          target_state: DeploymentRequestPlatformState.Active,
          actual_state: DeploymentRequestPlatformState.Provisioning,
          ordering: 1,
          type: DeploymentRequestDeploymentType.Trial,
          use_case: DeploymentRequestUseCase.ThreatHunting,
          service_instance_id: serviceInstanceId as ServiceInstanceId,
          user_requester_id:
            TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.ID,
        })) as DeploymentRequest;
    });
    afterEach(async () => {
      await DeploymentRequestDomain.deleteDeploymentRequestBy({});
      await serviceContractDomain.deleteConfigurationBy({});
      await deleteServiceInstanceBy({});
    });
    it('should throw if deployment request is not found', async () => {
      const call = registrationApp.autoRegisterPlatform(
        uuidv4(),
        platformConfiguration
      );
      await expect(call).rejects.toThrow(
        NotFoundErrorCode.DeploymentRequestNotFound
      );
    });
    it('should throw if wrong platform id is provided', async () => {
      await DeploymentRequestDomain.updateDeploymentRequestById(
        deploymentRequest.id,
        { platform_id: uuidv4() }
      );

      const call = registrationApp.autoRegisterPlatform(
        deploymentRequest.platform_token as string,
        {
          ...platformConfiguration,
          id: uuidv4(),
        }
      );
      await expect(call).rejects.toThrow(BadRequestErrorCode.InvalidPlatformId);
    });
    it('should throw if deployment status is not authorized', async () => {
      await DeploymentRequestDomain.updateDeploymentRequestById(
        deploymentRequest.id,
        {
          hub_status: DeploymentRequestHubStatus.Queued,
          target_state: undefined,
          actual_state: undefined,
        }
      );

      const call = registrationApp.autoRegisterPlatform(
        deploymentRequest.platform_token as string,
        platformConfiguration
      );
      await expect(call).rejects.toThrow(
        ForbiddenErrorCode.NotAllowedByDeploymentStatus
      );
    });
    it('should register the provided platform', async () => {
      await registrationApp.autoRegisterPlatform(
        deploymentRequest.platform_token as string,
        platformConfiguration
      );

      const serviceInstance: ServiceInstance = await loadServiceInstanceBy(
        'id',
        deploymentRequest.service_instance_id
      );
      const configuration =
        await serviceContractDomain.loadConfigurationByPlatform(
          platformConfiguration.id
        );
      expect(serviceInstance.creation_status).toBe(
        ServiceInstanceCreationStatus.Ready
      );
      expect(configuration).toMatchObject({
        config: {
          platform_contract: platformConfiguration.contract,
          platform_id: platformConfiguration.id,
          platform_title: platformConfiguration.title,
          platform_url: platformConfiguration.url,
          platform_version: platformConfiguration.version,
          registerer_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.ID,
          token: deploymentRequest.platform_token,
        },
        service_instance_id: deploymentRequest.service_instance_id,
        status: ServiceConfigurationStatus.Active,
      });
    });
    it("should successfully register the provided platform if it's already registered", async () => {
      const newPlatformConfiguration = {
        id: uuidv4(),
        title: 'My New OpenCTI platform',
        url: 'http://example2.com',
        contract: PlatformContract.Trial,
        version: 'A.B.C',
      };
      await registrationApp.autoRegisterPlatform(
        deploymentRequest.platform_token as string,
        platformConfiguration
      );

      await registrationApp.autoRegisterPlatform(
        deploymentRequest.platform_token as string,
        newPlatformConfiguration
      );

      const oldConfiguration =
        await serviceContractDomain.loadConfigurationByPlatform(
          platformConfiguration.id
        );
      const newConfiguration =
        await serviceContractDomain.loadConfigurationByPlatform(
          newPlatformConfiguration.id
        );
      expect(oldConfiguration).toBeNull();
      expect(newConfiguration).toMatchObject({
        config: {
          platform_contract: newPlatformConfiguration.contract,
          platform_id: newPlatformConfiguration.id,
          platform_title: newPlatformConfiguration.title,
          platform_url: newPlatformConfiguration.url,
          platform_version: newPlatformConfiguration.version,
          registerer_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.ID,
          token: deploymentRequest.platform_token,
        },
        service_instance_id: deploymentRequest.service_instance_id,
        status: ServiceConfigurationStatus.Active,
      });
    });

    describe('telemetry', () => {
      it('should send register event when platform is autoregistered', async () => {
        vi.useFakeTimers();
        const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
        vi.setSystemTime(date);

        const telemetrySpy = vi
          .spyOn(telemetryApp, 'sendTelemetryEvent')
          .mockResolvedValue();

        await registrationApp.autoRegisterPlatform(
          deploymentRequest.platform_token as string,
          platformConfiguration
        );

        expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
          '@timestamp': '2025-02-03T13:12:15.000Z',
          event_type: TelemetryEventType.REGISTER,
          organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
          organization_name: TEST_ORGANIZATIONS.FILIGRAN.NAME,
          organization_type: TelemetryOrganizationType.PROFESSIONAL,
          platform_contract: PlatformContract.Trial,
          platform_id: platformConfiguration.id,
          platform_version: platformConfiguration.version,
          platform_url: platformConfiguration.url,
          source: TELEMETRY_SOURCE,
          target_product: 'open-cti',
          user_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.ID,
        });
      });
    });
  });

  afterAll(async () => {
    vi.useRealTimers();
  });
});
