import { MockInstance } from '@vitest/spy';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestHelper } from '../../../tests/helper/test.helper';
import {
  contextRegistererUserSecondOrga,
  contextSimpleUserSecondOrga,
  requestContextRegistererUserSecondOrga,
  SERVICES,
  TEST_ORGANIZATIONS,
} from '../../../tests/tests.const';
import {
  DeploymentRequestDeploymentType,
  DeploymentRequestHubStatus,
  DeploymentRequestPlatformRegion,
  PlatformContract,
  PlatformIdentifier,
  ServiceConfigurationStatus,
  ServiceDefinitionIdentifier,
  ServiceInstanceCreationStatus,
} from '../../__generated__/resolvers-types';
import { requestContext } from '../../context/request.context';
import DeploymentRequest from '../../model/kanel/public/DeploymentRequest';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { PortalContext } from '../../model/portal-context';
import { securityGuard } from '../../security/guard';
import { ErrorCode } from '../../utils/error/error.code';
import { DeploymentRequestDomain } from '../deployment/deployment.domain';
import * as organizationDomain from '../organization-management/organizations/organizations.domain';
import { deleteServiceInstanceBy } from '../service/instance/service-instance.domain';
import * as subscriptionDomain from '../subscription/subscription.domain';
import {
  PlatformConfiguration,
  registrationDomain,
} from './registration.domain';
import { ServiceConfigurationDomain } from './service-configuration/service-configuration.domain';

describe('registration domain', () => {
  let platformId: string;
  const token = uuidv4();
  const platformTitle = 'My OpenCTI platform';
  const platformUrl = 'http://example.com';
  const platformContract = PlatformContract.Ee;
  const serviceDefinitionId = SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID;
  const platformOpenCTI = '6.7.17';

  beforeEach(() => {
    platformId = uuidv4();
  });

  describe('registerNewPlatform', () => {
    it('save registration data', async () => {
      const testContext = {
        user: requestContextRegistererUserSecondOrga.user,
        portalContext: {
          ...contextRegistererUserSecondOrga,
        },
      };
      requestContext.set(testContext);
      await registrationDomain.registerNewPlatform({
        organizationId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        serviceDefinitionId,
        configuration: {
          registerer_id: contextSimpleUserSecondOrga.user.id,
          platform_id: platformId,
          platform_url: platformUrl,
          platform_title: platformTitle,
          platform_contract: platformContract,
          platform_version: platformOpenCTI,
          token,
        },
        platformIdentifier: PlatformIdentifier.Opencti,
      });

      const serviceInstanceFromDB = await TestHelper.serviceInstance.load({
        name: 'OpenCTI Platform',
      });

      expect(serviceInstanceFromDB).toMatchObject({
        creation_status: ServiceInstanceCreationStatus.Ready,
      });

      const subscriptionFromDB = await TestHelper.subscription.loadAll({
        service_instance_id: serviceInstanceFromDB?.id,
      });

      expect(subscriptionFromDB?.[0]).toMatchObject({
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
      });

      const serviceConfiguration = await TestHelper.serviceConfiguration.load({
        service_instance_id: serviceInstanceFromDB?.id,
      });

      const configuration = JSON.parse(
        JSON.stringify(serviceConfiguration?.config)
      );

      expect(configuration).toMatchObject({
        token: token,
        registerer_id: contextSimpleUserSecondOrga.user.id,
        platform_id: platformId,
        platform_title: platformTitle,
        platform_url: platformUrl,
        platform_contract: platformContract,
      });
    });
    it('can create pending platforms', async () => {
      requestContext.set(requestContextRegistererUserSecondOrga);

      const serviceInstanceId = await registrationDomain.registerNewPlatform({
        organizationId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        serviceDefinitionId,
        platformIdentifier: PlatformIdentifier.Opencti,
        serviceInstanceCreationStatus: ServiceInstanceCreationStatus.Pending,
      });

      const serviceInstance = await TestHelper.serviceInstance.load({
        id: serviceInstanceId,
      });
      const subscriptionFromDB = await TestHelper.subscription.loadAll({
        service_instance_id: serviceInstanceId,
      });

      const serviceConfiguration = await TestHelper.serviceConfiguration.load({
        service_instance_id: serviceInstanceId,
      });

      expect(serviceInstance).toBeDefined();
      expect(serviceInstance?.creation_status).toBe(
        ServiceInstanceCreationStatus.Pending
      );

      expect(subscriptionFromDB?.[0]?.organization_id).toBe(
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
      );

      expect(serviceConfiguration).toBeUndefined();
    });
  });

  describe('refreshExistingPlatform', () => {
    const configuration: PlatformConfiguration = {
      registerer_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.REGISTERER.ID,
      platform_id: uuidv4(),
      platform_contract: PlatformContract.Ce,
      platform_title: 'Title',
      platform_url: 'https://example.com',
      platform_version: '6',
      token: 'hello',
    };
    const serviceInstanceId = uuidv4() as ServiceInstanceId;
    const targetOrganizationId = uuidv4() as OrganizationId;

    let assertUserIsAllowedOnOrganizationSpy: MockInstance;
    let loadSubscriptionBySpy: MockInstance;
    let loadOrganizationsByUserSpy: MockInstance;
    let transferSubscriptionToOrganizationSpy: MockInstance;
    let updateConfigurationSpy: MockInstance;

    beforeEach(async () => {
      assertUserIsAllowedOnOrganizationSpy = vi.spyOn(
        securityGuard,
        'assertUserIsAllowedOnOrganization'
      );

      loadSubscriptionBySpy = vi.spyOn(
        subscriptionDomain,
        'loadSubscriptionBy'
      );

      loadOrganizationsByUserSpy = vi.spyOn(
        organizationDomain,
        'loadOrganizationsByUser'
      );

      transferSubscriptionToOrganizationSpy = vi.spyOn(
        subscriptionDomain,
        'transferSubscriptionToOrganization'
      );

      updateConfigurationSpy = vi.spyOn(
        ServiceConfigurationDomain,
        'updateConfiguration'
      );
    });

    it('should prevent refresh when user is not allowed on target organization', async () => {
      assertUserIsAllowedOnOrganizationSpy.mockReturnValue(
        Promise.reject('ERROR')
      );

      const call = registrationDomain.refreshExistingPlatform({
        configuration,
        serviceInstanceId,
        targetOrganizationId,
      });

      await expect(call).rejects.toThrow('ERROR');
    });

    it('should throw an error when subscription is not found', async () => {
      assertUserIsAllowedOnOrganizationSpy.mockResolvedValue({});
      loadSubscriptionBySpy.mockResolvedValue(null);

      const call = registrationDomain.refreshExistingPlatform({
        configuration,
        serviceInstanceId,
        targetOrganizationId,
      });

      await expect(call).rejects.toThrow(ErrorCode.SubscriptionNotFound);
    });

    describe('same target organization', () => {
      beforeEach(() => {
        loadSubscriptionBySpy.mockResolvedValue({
          organization_id: targetOrganizationId,
        });
      });

      it('should update configuration', async () => {
        assertUserIsAllowedOnOrganizationSpy.mockResolvedValue({});

        await registrationDomain.refreshExistingPlatform({
          configuration,
          serviceInstanceId,
          targetOrganizationId,
        });

        expect(updateConfigurationSpy).toHaveBeenCalledWith(serviceInstanceId, {
          config: configuration,
          status: ServiceConfigurationStatus.Active,
        });
      });
    });

    describe('another target organization', () => {
      const subscriptionId = uuidv4() as SubscriptionId;
      const anotherOrganizationId = uuidv4() as OrganizationId;
      beforeEach(() => {
        loadSubscriptionBySpy.mockResolvedValue({
          id: subscriptionId,
          organization_id: anotherOrganizationId,
        });
      });

      it('should throw an error when user has more than 2 organizations', async () => {
        assertUserIsAllowedOnOrganizationSpy.mockResolvedValue({});
        loadOrganizationsByUserSpy.mockResolvedValue([{}, {}, {}]);

        const call = registrationDomain.refreshExistingPlatform({
          configuration,
          serviceInstanceId,
          targetOrganizationId,
        });

        await expect(call).rejects.toThrow(
          ErrorCode.RegistrationOnAnotherOrganizationForbidden
        );
      });

      it('should throw an error when user is not allowed on it', async () => {
        assertUserIsAllowedOnOrganizationSpy.mockImplementation(
          (
            context: PortalContext,
            { organizationId }: { organizationId: OrganizationId }
          ) => {
            if (organizationId === targetOrganizationId) {
              return {};
            }

            throw new Error(ErrorCode.MissingCapabilityOnOrganization);
          }
        );

        const call = registrationDomain.refreshExistingPlatform({
          configuration,
          serviceInstanceId,
          targetOrganizationId,
        });

        await expect(call).rejects.toThrow(
          ErrorCode.MissingCapabilityOnOrganization
        );
      });

      it('should transfer the subscription and refresh configuration when user is allowed', async () => {
        assertUserIsAllowedOnOrganizationSpy.mockResolvedValue({});

        await registrationDomain.refreshExistingPlatform({
          configuration,
          serviceInstanceId,
          targetOrganizationId,
        });

        expect(transferSubscriptionToOrganizationSpy).toHaveBeenCalledWith({
          subscriptionId,
          organizationId: targetOrganizationId,
        });

        expect(updateConfigurationSpy).toHaveBeenCalledWith(serviceInstanceId, {
          config: configuration,
          status: ServiceConfigurationStatus.Active,
        });
      });
    });
  });

  describe('loadRegisteredPlatform', () => {
    const openAEVplatformId = uuidv4();

    const openAEVplatformTitle = 'My OpenCTI platform';
    const openAEVplatformUrl = 'http://example.com';
    const openAEVplatformContract = PlatformContract.Ee;
    const serviceDefinitionId = '5f769173-5ace-4ef3-b04f-2c95609c5b59';
    const openAEVplatformVersion = '6.7.17';
    const openAEVToken = uuidv4();
    const openAEVServiceDefinitionId = 'e66a6b50-1f92-4f62-b84c-88ed6b871790';

    let openCTIServiceInstanceId: ServiceInstanceId;
    beforeEach(async () => {
      requestContext.set(requestContextRegistererUserSecondOrga);

      openCTIServiceInstanceId = await registrationDomain.registerNewPlatform({
        organizationId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        serviceDefinitionId,
        configuration: {
          registerer_id:
            TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.REGISTERER.ID,
          platform_id: platformId,
          platform_url: platformUrl,
          platform_title: platformTitle,
          platform_contract: platformContract,
          platform_version: platformOpenCTI,
          token,
        },
        platformIdentifier: PlatformIdentifier.Opencti,
      });

      await registrationDomain.registerNewPlatform({
        organizationId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        serviceDefinitionId: openAEVServiceDefinitionId,
        configuration: {
          registerer_id:
            TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.REGISTERER.ID,
          platform_id: openAEVplatformId,
          platform_url: openAEVplatformUrl,
          platform_title: openAEVplatformTitle,
          platform_contract: openAEVplatformContract,
          platform_version: openAEVplatformVersion,
          token: openAEVToken,
        },
        platformIdentifier: PlatformIdentifier.Openaev,
      });
    });
    afterEach(async () => {
      await TestHelper.deploymentRequest.delete({});
      await ServiceConfigurationDomain.deleteConfigurationBy({});
      await deleteServiceInstanceBy({});
    });

    it('should return only the registered platform linked to the service instance', async () => {
      const platforms = await registrationDomain.loadRegisteredPlatform(
        openCTIServiceInstanceId
      );

      expect(platforms).toHaveLength(1);
      expect(platforms[0]?.config.platform_id).toBe(platformId);
    });
  });

  describe('loadRegisteredPlatformsByOrganizationIds', () => {
    let serviceInstanceId: ServiceInstanceId;

    beforeEach(async () => {
      requestContext.set(requestContextRegistererUserSecondOrga);

      serviceInstanceId = await registrationDomain.registerNewPlatform({
        organizationId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        serviceDefinitionId,
        configuration: {
          registerer_id:
            TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.REGISTERER.ID,
          platform_id: platformId,
          platform_url: platformUrl,
          platform_title: platformTitle,
          platform_contract: platformContract,
          platform_version: platformOpenCTI,
          token,
        },
        platformIdentifier: PlatformIdentifier.Opencti,
      });
    });

    afterEach(async () => {
      await ServiceConfigurationDomain.deleteConfigurationBy({});
      await deleteServiceInstanceBy({});
    });

    it('should return an empty array when organizationIds is empty', async () => {
      // When
      const result =
        await registrationDomain.loadRegisteredPlatformsByOrganizationIds(
          [],
          PlatformIdentifier.Opencti
        );

      // Then
      expect(result).toEqual([]);
    });

    it('should return platforms for the given organization IDs and platform identifier', async () => {
      // When
      const result =
        await registrationDomain.loadRegisteredPlatformsByOrganizationIds(
          [TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID],
          PlatformIdentifier.Opencti
        );

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: serviceInstanceId,
        identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
      });
    });

    it('should return an empty array when no platform matches the given organization ID', async () => {
      // Given
      const randomOrgId = uuidv4() as OrganizationId;

      // When
      const result =
        await registrationDomain.loadRegisteredPlatformsByOrganizationIds(
          [randomOrgId],
          PlatformIdentifier.Opencti
        );

      // Then
      expect(result).toEqual([]);
    });

    it('should not return platforms with inactive configuration', async () => {
      // Given
      await ServiceConfigurationDomain.updateConfiguration(serviceInstanceId, {
        status: ServiceConfigurationStatus.Inactive,
      });

      // When
      const result =
        await registrationDomain.loadRegisteredPlatformsByOrganizationIds(
          [TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID],
          PlatformIdentifier.Opencti
        );

      // Then
      expect(result).toEqual([]);
    });
  });

  describe('loadRegisteredPlatforms', () => {
    const openAEVplatformId = uuidv4();

    const openAEVplatformTitle = 'My OpenCTI platform';
    const openAEVplatformUrl = 'http://example.com';
    const openAEVplatformContract = PlatformContract.Ee;
    const serviceDefinitionId = SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID;
    const openAEVplatformVersion = '6.7.17';
    const openAEVToken = uuidv4();
    const openAEVServiceDefinitionId = 'e66a6b50-1f92-4f62-b84c-88ed6b871790';

    let openCTIServiceInstanceId: ServiceInstanceId;
    beforeEach(async () => {
      requestContext.set(requestContextRegistererUserSecondOrga);

      openCTIServiceInstanceId = await registrationDomain.registerNewPlatform({
        organizationId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        serviceDefinitionId,
        configuration: {
          registerer_id:
            TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.REGISTERER.ID,
          platform_id: platformId,
          platform_url: platformUrl,
          platform_title: platformTitle,
          platform_contract: platformContract,
          platform_version: platformOpenCTI,
          token,
        },
        platformIdentifier: PlatformIdentifier.Opencti,
      });

      await registrationDomain.registerNewPlatform({
        organizationId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        serviceDefinitionId: openAEVServiceDefinitionId,
        configuration: {
          registerer_id:
            TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.REGISTERER.ID,
          platform_id: openAEVplatformId,
          platform_url: openAEVplatformUrl,
          platform_title: openAEVplatformTitle,
          platform_contract: openAEVplatformContract,
          platform_version: openAEVplatformVersion,
          token: openAEVToken,
        },
        platformIdentifier: PlatformIdentifier.Openaev,
      });
    });
    afterEach(async () => {
      await TestHelper.deploymentRequest.delete({});
      await ServiceConfigurationDomain.deleteConfigurationBy({});
      await deleteServiceInstanceBy({});
    });
    it('should return all registered platform without platformIdentifier in input ', async () => {
      const platforms = await registrationDomain.loadRegisteredPlatforms();

      expect(
        platforms.some(
          (item) =>
            item.identifier === ServiceDefinitionIdentifier.OpenctiRegistration
        )
      ).toBe(true);
      expect(
        platforms.some(
          (item) =>
            item.identifier === ServiceDefinitionIdentifier.OpenaevRegistration
        )
      ).toBe(true);
    });
    it('should return only the right registered platform if platformIdentifier in input ', async () => {
      const platforms = await registrationDomain.loadRegisteredPlatforms({
        platformIdentifier: PlatformIdentifier.Openaev,
      });
      expect(
        platforms.every(
          (item) =>
            item.identifier === ServiceDefinitionIdentifier.OpenaevRegistration
        )
      ).toBe(true);
    });
    it('should not return inactive platforms ', async () => {
      await ServiceConfigurationDomain.updateConfiguration(
        openCTIServiceInstanceId,
        {
          status: ServiceConfigurationStatus.Inactive,
        }
      );

      const platforms = await registrationDomain.loadRegisteredPlatforms({
        platformIdentifier: PlatformIdentifier.Opencti,
      });
      expect(platforms).toHaveLength(0);
    });
    it('should return platforms without configuration (not yet auto registered) ', async () => {
      const notYetRegisteredPlatformServiceInstanceId =
        await registrationDomain.registerNewPlatform({
          organizationId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
          serviceDefinitionId,
          platformIdentifier: PlatformIdentifier.Opencti,
        });

      const platforms = await registrationDomain.loadRegisteredPlatforms({
        platformIdentifier: PlatformIdentifier.Opencti,
      });
      expect(
        platforms.some(
          (item) => item.id === notYetRegisteredPlatformServiceInstanceId
        )
      ).toBe(true);
    });
    it('should return platforms with non-active trials by default', async () => {
      await DeploymentRequestDomain.insertDeploymentRequest({
        id: uuidv4() as DeploymentRequest['id'],
        service_instance_id: openCTIServiceInstanceId,
        platform_identifier: PlatformIdentifier.Opencti,
        region: DeploymentRequestPlatformRegion.EuWest,
        type: DeploymentRequestDeploymentType.Trial,
        hub_status: DeploymentRequestHubStatus.Cancelled,
        platform_token: uuidv4(),
        organization_requester_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        user_requester_id:
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.REGISTERER.ID,
        ordering: 1,
        request_date: new Date(),
      });

      const platforms = await registrationDomain.loadRegisteredPlatforms({
        platformIdentifier: PlatformIdentifier.Opencti,
      });

      expect(platforms).toHaveLength(1);
      expect(platforms[0]?.config.platform_id).toBe(platformId);
    });
    it('should not return platforms with non-active trials when onlyActiveTrials is true', async () => {
      await DeploymentRequestDomain.insertDeploymentRequest({
        id: uuidv4() as DeploymentRequest['id'],
        service_instance_id: openCTIServiceInstanceId,
        platform_identifier: PlatformIdentifier.Opencti,
        region: DeploymentRequestPlatformRegion.EuWest,
        type: DeploymentRequestDeploymentType.Trial,
        hub_status: DeploymentRequestHubStatus.Provisioning,
        platform_token: uuidv4(),
        organization_requester_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        user_requester_id:
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.REGISTERER.ID,
        ordering: 1,
        request_date: new Date(),
      });

      const platforms = await registrationDomain.loadRegisteredPlatforms({
        platformIdentifier: PlatformIdentifier.Opencti,
        onlyActive: true,
      });

      expect(platforms).toHaveLength(0);
    });
    it('should return platforms with active trials when onlyActiveTrials is true', async () => {
      await DeploymentRequestDomain.insertDeploymentRequest({
        id: uuidv4() as DeploymentRequest['id'],
        service_instance_id: openCTIServiceInstanceId,
        platform_identifier: PlatformIdentifier.Opencti,
        region: DeploymentRequestPlatformRegion.EuWest,
        type: DeploymentRequestDeploymentType.Trial,
        hub_status: DeploymentRequestHubStatus.Active,
        platform_token: uuidv4(),
        organization_requester_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        user_requester_id:
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.REGISTERER.ID,
        ordering: 1,
        request_date: new Date(),
      });

      const platforms = await registrationDomain.loadRegisteredPlatforms({
        platformIdentifier: PlatformIdentifier.Opencti,
        onlyActive: true,
      });

      expect(platforms).toHaveLength(1);
      expect(platforms[0]?.config.platform_id).toBe(platformId);
    });
    it('should return platforms only active trials when onlyActiveTrials is true AND onlyTrial is true', async () => {
      await DeploymentRequestDomain.insertDeploymentRequest({
        id: uuidv4() as DeploymentRequest['id'],
        service_instance_id: openCTIServiceInstanceId,
        platform_identifier: PlatformIdentifier.Opencti,
        region: DeploymentRequestPlatformRegion.EuWest,
        type: DeploymentRequestDeploymentType.Trial,
        hub_status: DeploymentRequestHubStatus.Active,
        platform_token: uuidv4(),
        organization_requester_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        user_requester_id:
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.REGISTERER.ID,
        ordering: 1,
        request_date: new Date(),
      });
      await DeploymentRequestDomain.insertDeploymentRequest({
        id: uuidv4() as DeploymentRequest['id'],
        service_instance_id: openCTIServiceInstanceId,
        platform_identifier: PlatformIdentifier.Opencti,
        region: DeploymentRequestPlatformRegion.EuWest,
        type: DeploymentRequestDeploymentType.Trial,
        hub_status: DeploymentRequestHubStatus.Pending,
        platform_token: uuidv4(),
        organization_requester_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        user_requester_id:
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.REGISTERER.ID,
        ordering: 1,
        request_date: new Date(),
      });
      await registrationDomain.registerNewPlatform({
        organizationId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        serviceDefinitionId,
        platformIdentifier: PlatformIdentifier.Opencti,
      });

      const platforms = await registrationDomain.loadRegisteredPlatforms({
        platformIdentifier: PlatformIdentifier.Opencti,
        onlyActive: true,
        onlyTrial: true,
      });

      expect(platforms).toHaveLength(1);
      expect(platforms[0]?.config.platform_id).toBe(platformId);
    });
  });
});
