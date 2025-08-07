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
  OctiPlatformContract,
  OctiPlatformInput,
  OctiPlatformRegistrationStatus,
  ServiceConfigurationStatus,
} from '../../../__generated__/resolvers-types';
import Subscription from '../../../model/kanel/public/Subscription';
import { PLATFORM_ORGANIZATION_UUID } from '../../../portal.const';
import * as authHelper from '../../../security/auth.helper';
import { ErrorCode } from '../../common/error-code';
import * as subscriptionDomain from '../../subcription/subscription.domain';
import { serviceContractDomain } from '../contract/domain';
import { registrationApp } from './registration.app';

describe('Registration app', () => {
  describe('registerOpenCTIPlatform', () => {
    const platform: OctiPlatformInput = {
      id: uuidv4(),
      title: 'My OpenCTI platform',
      url: 'http://example.com',
      contract: OctiPlatformContract.Ee,
    };

    describe('invalid configuration', async () => {
      it('should throw when platformId is not valid', async () => {
        const call = registrationApp.registerOpenCTIPlatform(contextAdminUser, {
          organizationId: PLATFORM_ORGANIZATION_UUID,
          platform: {
            ...platform,
            id: 'hello',
          },
        });

        await expect(call).rejects.toThrow('INVALID_SERVICE_CONFIGURATION');
      });

      it('should throw when platformUrl is not valid', async () => {
        const call = registrationApp.registerOpenCTIPlatform(contextAdminUser, {
          organizationId: PLATFORM_ORGANIZATION_UUID,
          platform: {
            ...platform,
            url: 'hello',
          },
        });

        await expect(call).rejects.toThrow('INVALID_SERVICE_CONFIGURATION');
      });
    });

    it('should throw when user does not belong to the organization', async () => {
      const call = registrationApp.registerOpenCTIPlatform(
        {
          ...contextAdminUser,
          user: {
            ...contextAdminUser.user,
            capabilities: [],
          },
        },
        { organizationId: THALES_ORGA_ID, platform }
      );

      await expect(call).rejects.toThrow(ErrorCode.UserIsNotInOrganization);
    });

    it('should throw when user does not have the required capabilities', async () => {
      const call = registrationApp.registerOpenCTIPlatform(
        contextSimpleUserThales,
        {
          organizationId: THALES_ORGA_ID,
          platform,
        }
      );

      await expect(call).rejects.toThrow(
        ErrorCode.MissingCapabilityOnOrganization
      );
    });

    it('return token when platform is registered', async () => {
      const token = await registrationApp.registerOpenCTIPlatform(
        contextAdminUser,
        {
          organizationId: PLATFORM_ORGANIZATION_UUID,
          platform,
        }
      );

      expect(token).toBeDefined();
    });
  });

  describe('unregisterOpenCTIPlatform', () => {
    let platformId: string;
    let platform: OctiPlatformInput;

    beforeEach(() => {
      platformId = uuidv4();
      platform = {
        id: platformId,
        title: 'My OpenCTI platform',
        url: 'http://example.com',
        contract: OctiPlatformContract.Ee,
      };
    });

    it('should throw when user does not belong to the organization', async () => {
      await registrationApp.registerOpenCTIPlatform(contextAdminUser, {
        organizationId: PLATFORM_ORGANIZATION_UUID,
        platform,
      });

      const call = registrationApp.unregisterOpenCTIPlatform(
        contextAdminOrgaThales,
        {
          platformId,
        }
      );

      await expect(call).rejects.toThrow(ErrorCode.UserIsNotInOrganization);
    });

    it('should throw when user does not have the required capabilities', async () => {
      await registrationApp.registerOpenCTIPlatform(contextAdminOrgaThales, {
        organizationId: THALES_ORGA_ID,
        platform,
      });

      const call = registrationApp.unregisterOpenCTIPlatform(
        contextSimpleUserThales,
        {
          platformId,
        }
      );

      await expect(call).rejects.toThrow(
        ErrorCode.MissingCapabilityOnOrganization
      );
    });

    it('should unregister platform when the platform is still active', async () => {
      await registrationApp.registerOpenCTIPlatform(contextAdminUser, {
        organizationId: PLATFORM_ORGANIZATION_UUID,
        platform,
      });

      await registrationApp.unregisterOpenCTIPlatform(contextAdminUser, {
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

  describe('canUnregisterOpenCTIPlatform', () => {
    const platformId = uuidv4();

    let isUserAllowedOnOrganizationSpy: MockInstance;
    let loadConfigurationByPlatformSpy: MockInstance;
    let loadSubscriptionBySpy: MockInstance;

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
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should throw an error when configuration for platform does not exist', async () => {
      loadConfigurationByPlatformSpy.mockReturnValue(Promise.resolve(null));

      const call = registrationApp.canUnregisterOpenCTIPlatform(
        contextAdminUser,
        {
          platformId,
        }
      );

      await expect(call).rejects.toThrow(ErrorCode.PlatformNotRegistered);
    });

    it('should throw an error when subscription does not exist', async () => {
      loadConfigurationByPlatformSpy.mockReturnValue(
        Promise.resolve({ service_instance_id: uuidv4() })
      );
      loadSubscriptionBySpy.mockReturnValue(Promise.resolve(null));

      const call = registrationApp.canUnregisterOpenCTIPlatform(
        contextAdminUser,
        {
          platformId,
        }
      );

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

      const result = await registrationApp.canUnregisterOpenCTIPlatform(
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

      const result = await registrationApp.canUnregisterOpenCTIPlatform(
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
      const result =
        await registrationApp.loadOpenCTIPlatformRegistrationStatus(
          contextAdminUser,
          { platformId: uuidv4(), token: uuidv4() }
        );

      expect(result.status).toBe(OctiPlatformRegistrationStatus.Inactive);
    });

    it('should return active when platform is registered', async () => {
      const platformId = uuidv4();
      const token = await registrationApp.registerOpenCTIPlatform(
        contextAdminUser,
        {
          organizationId: PLATFORM_ORGANIZATION_UUID,
          platform: {
            id: platformId,
            url: 'http://example.com',
            contract: OctiPlatformContract.Ee,
            title: 'Fake title',
          },
        }
      );

      const result =
        await registrationApp.loadOpenCTIPlatformRegistrationStatus(
          contextAdminUser,
          { platformId, token }
        );

      expect(result.status).toBe(OctiPlatformRegistrationStatus.Active);
    });

    it('should return inactive when platform is unregistered', async () => {
      const platformId = uuidv4();
      const token = await registrationApp.registerOpenCTIPlatform(
        contextAdminUser,
        {
          organizationId: PLATFORM_ORGANIZATION_UUID,
          platform: {
            id: platformId,
            url: 'http://example.com',
            contract: OctiPlatformContract.Ee,
            title: 'Fake title',
          },
        }
      );

      await registrationApp.unregisterOpenCTIPlatform(contextAdminUser, {
        platformId,
      });

      const result =
        await registrationApp.loadOpenCTIPlatformRegistrationStatus(
          contextAdminUser,
          { platformId: platformId, token }
        );

      expect(result.status).toBe(OctiPlatformRegistrationStatus.Inactive);
    });
  });
});
