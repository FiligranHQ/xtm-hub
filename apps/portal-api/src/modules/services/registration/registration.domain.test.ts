import { MockInstance } from '@vitest/spy';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dbUnsecure } from '../../../../knexfile';
import { contextAdminUser } from '../../../../tests/tests.const';
import {
  OpenCtiPlatformContract,
  ServiceConfigurationStatus,
} from '../../../__generated__/resolvers-types';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import ServiceConfiguration from '../../../model/kanel/public/ServiceConfiguration';
import ServiceInstance, {
  ServiceInstanceId,
} from '../../../model/kanel/public/ServiceInstance';
import Subscription, {
  SubscriptionId,
} from '../../../model/kanel/public/Subscription';
import { PortalContext } from '../../../model/portal-context';
import { PLATFORM_ORGANIZATION_UUID } from '../../../portal.const';
import { securityGuard } from '../../../security/guard';
import { ErrorCode } from '../../common/error-code';
import * as organizationDomain from '../../organizations/organizations.domain';
import * as subscriptionDomain from '../../subcription/subscription.domain';
import { serviceContractDomain } from '../contract/domain';
import {
  OpenCTIPlatformConfiguration,
  registrationDomain,
} from './registration.domain';

describe('Registration domain', () => {
  let platformId: string;
  const token = uuidv4();
  const platformTitle = 'My OpenCTI platform';
  const platformUrl = 'http://example.com';
  const platformContract = OpenCtiPlatformContract.Ee;
  const serviceDefinitionId = '5f769173-5ace-4ef3-b04f-2c95609c5b59';

  beforeEach(() => {
    platformId = uuidv4();
  });

  describe('registerNewInstance', () => {
    it('save registration data', async () => {
      await registrationDomain.registerNewPlatform(contextAdminUser, {
        organizationId: PLATFORM_ORGANIZATION_UUID,
        serviceDefinitionId,
        configuration: {
          registerer_id: contextAdminUser.user.id,
          platform_id: platformId,
          platform_url: platformUrl,
          platform_title: platformTitle,
          platform_contract: platformContract,
          token,
        },
      });

      const serviceInstance = await dbUnsecure<ServiceInstance>(
        'ServiceInstance'
      )
        .where('name', '=', 'OpenCTI Platform')
        .select('*')
        .first();

      expect(serviceInstance).toBeDefined();

      const subscription = await dbUnsecure<Subscription>('Subscription')
        .where('service_instance_id', '=', serviceInstance.id)
        .select('*')
        .first();

      expect(subscription).toBeDefined();
      expect(subscription.organization_id).toBe(PLATFORM_ORGANIZATION_UUID);

      const serviceConfiguration = await dbUnsecure<ServiceConfiguration>(
        'Service_Configuration'
      )
        .where('service_instance_id', '=', serviceInstance.id)
        .select('*')
        .first();

      expect(serviceConfiguration).toBeDefined();
      const configuration = JSON.parse(
        JSON.stringify(serviceConfiguration.config)
      );

      expect(configuration.token).toBe(token);
      expect(configuration.registerer_id).toBe(contextAdminUser.user.id);
      expect(configuration.platform_id).toBe(platformId);
      expect(configuration.platform_title).toBe(platformTitle);
      expect(configuration.platform_url).toBe(platformUrl);
      expect(configuration.platform_contract).toBe(platformContract);
    });
  });

  describe('refreshExistingPlatform', () => {
    const configuration: OpenCTIPlatformConfiguration = {
      registerer_id: contextAdminUser.user.id,
      platform_id: uuidv4(),
      platform_contract: OpenCtiPlatformContract.Ce,
      platform_title: 'Title',
      platform_url: 'https://example.com',
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
        serviceContractDomain,
        'updateConfiguration'
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should prevent refresh when user is not allowed on target organization', async () => {
      assertUserIsAllowedOnOrganizationSpy.mockReturnValue(
        Promise.reject('ERROR')
      );

      const call = registrationDomain.refreshExistingPlatform(
        contextAdminUser,
        {
          configuration,
          serviceInstanceId,
          targetOrganizationId,
        }
      );

      await expect(call).rejects.toThrow('ERROR');
    });

    it('should throw an error when subscription is not found', async () => {
      assertUserIsAllowedOnOrganizationSpy.mockResolvedValue({});
      loadSubscriptionBySpy.mockResolvedValue(null);

      const call = registrationDomain.refreshExistingPlatform(
        contextAdminUser,
        {
          configuration,
          serviceInstanceId,
          targetOrganizationId,
        }
      );

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

        await registrationDomain.refreshExistingPlatform(contextAdminUser, {
          configuration,
          serviceInstanceId,
          targetOrganizationId,
        });

        expect(updateConfigurationSpy).toHaveBeenCalledWith(
          contextAdminUser,
          serviceInstanceId,
          { config: configuration, status: ServiceConfigurationStatus.Active }
        );
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

        const call = registrationDomain.refreshExistingPlatform(
          contextAdminUser,
          {
            configuration,
            serviceInstanceId,
            targetOrganizationId,
          }
        );

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

        const call = registrationDomain.refreshExistingPlatform(
          contextAdminUser,
          {
            configuration,
            serviceInstanceId,
            targetOrganizationId,
          }
        );

        await expect(call).rejects.toThrow(
          ErrorCode.MissingCapabilityOnOrganization
        );
      });

      it('should transfer the subscription and refresh configuration when user is allowed', async () => {
        assertUserIsAllowedOnOrganizationSpy.mockResolvedValue({});

        await registrationDomain.refreshExistingPlatform(contextAdminUser, {
          configuration,
          serviceInstanceId,
          targetOrganizationId,
        });

        expect(transferSubscriptionToOrganizationSpy).toHaveBeenCalledWith(
          contextAdminUser,
          { subscriptionId, organizationId: targetOrganizationId }
        );

        expect(updateConfigurationSpy).toHaveBeenCalledWith(
          contextAdminUser,
          serviceInstanceId,
          { config: configuration, status: ServiceConfigurationStatus.Active }
        );
      });
    });
  });
});
