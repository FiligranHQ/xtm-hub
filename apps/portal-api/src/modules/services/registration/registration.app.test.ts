import { MockInstance } from '@vitest/spy';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dbUnsecure } from '../../../../knexfile';
import {
  contextAdminOrgaThales,
  contextAdminUser,
  contextSimpleUserThales,
  THALES_ORGA_ID,
} from '../../../../tests/tests.const';
import {
  PlatformContract,
  PlatformIdentifier,
  PlatformInput,
  PlatformRegistrationConnectivityStatus,
  ServiceConfigurationStatus,
  ServiceDefinitionIdentifier,
} from '../../../__generated__/resolvers-types';
import Subscription from '../../../model/kanel/public/Subscription';
import { UserLoadUserBy } from '../../../model/user';
import { PLATFORM_ORGANIZATION_UUID } from '../../../portal.const';
import * as authHelper from '../../../security/auth.helper';
import { ErrorCode } from '../../common/error-code';
import * as subscriptionDomain from '../../subcription/subscription.domain';
import { serviceContractDomain } from '../contract/domain';
import * as serviceInstanceDomain from '../service-instance.domain';
import { registrationApp } from './registration.app';

describe('Registration app', () => {
  describe('registerPlatform', () => {
    const platform: PlatformInput = {
      id: uuidv4(),
      title: 'My OpenCTI platform',
      url: 'http://example.com',
      contract: PlatformContract.Ee,
    };

    describe('invalid configuration', async () => {
      it('should throw when platformId is not valid', async () => {
        const call = registrationApp.registerPlatform(contextAdminUser, {
          organizationId: PLATFORM_ORGANIZATION_UUID,
          platform: {
            ...platform,
            id: 'hello',
          },
          identifier: PlatformIdentifier.Opencti,
        });

        await expect(call).rejects.toThrow('INVALID_SERVICE_CONFIGURATION');
      });

      it('should throw when platformUrl is not valid', async () => {
        const call = registrationApp.registerPlatform(contextAdminUser, {
          organizationId: PLATFORM_ORGANIZATION_UUID,
          platform: {
            ...platform,
            url: 'hello',
          },
          identifier: PlatformIdentifier.Opencti,
        });

        await expect(call).rejects.toThrow('INVALID_SERVICE_CONFIGURATION');
      });
    });

    it('should throw when user does not belong to the organization', async () => {
      const call = registrationApp.registerPlatform(
        {
          ...contextAdminUser,
          user: {
            ...contextAdminUser.user,
            capabilities: [],
          },
        },
        {
          organizationId: THALES_ORGA_ID,
          platform,
          identifier: PlatformIdentifier.Opencti,
        }
      );

      await expect(call).rejects.toThrow(ErrorCode.UserIsNotInOrganization);
    });

    it('should throw when user does not have the required capabilities', async () => {
      const call = registrationApp.registerPlatform(contextSimpleUserThales, {
        organizationId: THALES_ORGA_ID,
        platform,
        identifier: PlatformIdentifier.Opencti,
      });

      await expect(call).rejects.toThrow(
        ErrorCode.MissingCapabilityOnOrganization
      );
    });

    it('return token when platform is registered', async () => {
      const token = await registrationApp.registerPlatform(contextAdminUser, {
        organizationId: PLATFORM_ORGANIZATION_UUID,
        platform,
        identifier: PlatformIdentifier.Opencti,
      });

      expect(token).toBeDefined();
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
      };
    });

    it('should throw when user does not belong to the organization', async () => {
      await registrationApp.registerPlatform(contextAdminUser, {
        organizationId: PLATFORM_ORGANIZATION_UUID,
        platform,
        identifier: PlatformIdentifier.Opencti,
      });

      const call = registrationApp.unregisterPlatform(contextAdminOrgaThales, {
        platformId,
      });

      await expect(call).rejects.toThrow(ErrorCode.UserIsNotInOrganization);
    });

    it('should throw when user does not have the required capabilities', async () => {
      await registrationApp.registerPlatform(contextAdminOrgaThales, {
        organizationId: THALES_ORGA_ID,
        platform,
        identifier: PlatformIdentifier.Opencti,
      });

      const call = registrationApp.unregisterPlatform(contextSimpleUserThales, {
        platformId,
      });

      await expect(call).rejects.toThrow(
        ErrorCode.MissingCapabilityOnOrganization
      );
    });

    it('should unregister platform when the platform is still active', async () => {
      await registrationApp.registerPlatform(contextAdminUser, {
        organizationId: PLATFORM_ORGANIZATION_UUID,
        platform,
        identifier: PlatformIdentifier.Opencti,
      });

      await registrationApp.unregisterPlatform(contextAdminUser, {
        platformId,
      });

      const serviceConfiguration =
        await serviceContractDomain.loadConfigurationByPlatform(
          contextAdminUser,
          platformId
        );

      expect(serviceConfiguration).toBeDefined();
      expect(serviceConfiguration.status).toBe(
        ServiceConfigurationStatus.Inactive
      );

      const subscription = await dbUnsecure<Subscription>('Subscription')
        .where(
          'service_instance_id',
          '=',
          serviceConfiguration.service_instance_id
        )
        .select('*')
        .first();

      expect(subscription).toBeDefined();
      expect(subscription.end_date).toBeDefined();
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

      const call = registrationApp.canUnregisterPlatform(contextAdminUser, {
        platformId,
      });

      await expect(call).rejects.toThrow(ErrorCode.PlatformNotRegistered);
    });

    it('should throw an error when subscription does not exist', async () => {
      loadConfigurationByPlatformSpy.mockReturnValue(
        Promise.resolve({ service_instance_id: uuidv4() })
      );
      loadSubscriptionBySpy.mockReturnValue(Promise.resolve(null));

      const call = registrationApp.canUnregisterPlatform(contextAdminUser, {
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

      const result = await registrationApp.canUnregisterPlatform(
        contextAdminUser,
        { platformId }
      );

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

      const result = await registrationApp.canUnregisterPlatform(
        contextAdminUser,
        { platformId }
      );

      expect(result.isAllowed).toBeFalsy();
      expect(result.isInOrganization).toBeFalsy();
      expect(result.organizationId).toBe(organizationId);
    });
  });

  describe('loadOpenCTIPlatformRegistrationStatus', () => {
    it('should return inactive when platform is not registered', async () => {
      const result = await registrationApp.loadPlatformRegistrationStatus(
        contextAdminUser,
        { platformId: uuidv4(), token: uuidv4() }
      );

      expect(result.status).toBe(
        PlatformRegistrationConnectivityStatus.Inactive
      );
    });

    it('should return active when platform is registered', async () => {
      const platformId = uuidv4();
      const token = await registrationApp.registerPlatform(contextAdminUser, {
        organizationId: PLATFORM_ORGANIZATION_UUID,
        platform: {
          id: platformId,
          url: 'http://example.com',
          contract: PlatformContract.Ee,
          title: 'Fake title',
        },
        identifier: PlatformIdentifier.Opencti,
      });

      const result = await registrationApp.loadPlatformRegistrationStatus(
        contextAdminUser,
        { platformId, token }
      );

      expect(result.status).toBe(PlatformRegistrationConnectivityStatus.Active);
    });

    it('should return inactive when platform is unregistered', async () => {
      const platformId = uuidv4();
      const token = await registrationApp.registerPlatform(contextAdminUser, {
        organizationId: PLATFORM_ORGANIZATION_UUID,
        platform: {
          id: platformId,
          url: 'http://example.com',
          contract: PlatformContract.Ee,
          title: 'Fake title',
        },
        identifier: PlatformIdentifier.Opencti,
      });

      await registrationApp.unregisterPlatform(contextAdminUser, {
        platformId,
      });

      const result = await registrationApp.loadPlatformRegistrationStatus(
        contextAdminUser,
        { platformId: platformId, token }
      );

      expect(result.status).toBe(
        PlatformRegistrationConnectivityStatus.Inactive
      );
    });
  });

  describe('refreshUserPlatformToken', () => {
    it('should generate a token and add it to the user each time it is called', async () => {
      const { token } =
        await registrationApp.refreshUserPlatformToken(contextAdminUser);
      const user = await dbUnsecure<UserLoadUserBy>('User')
        .where({ id: contextAdminUser.user.id })
        .first();

      expect(token).toBe(user.platform_token);

      const { token: anotherToken } =
        await registrationApp.refreshUserPlatformToken(contextAdminUser);
      const updatedUser = await dbUnsecure<UserLoadUserBy>('User')
        .where({ id: contextAdminUser.user.id })
        .first();

      expect(anotherToken).toBe(updatedUser.platform_token);
      expect(anotherToken === token).toBeFalsy();
    });
  });
});
