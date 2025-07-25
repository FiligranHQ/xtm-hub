import { MockInstance } from '@vitest/spy';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dbUnsecure } from '../../../../knexfile';
import { contextAdminUser } from '../../../../tests/tests.const';
import {
  CanEnrollStatus,
  OctiPlatformContract,
  OctiPlatformInput,
  ServiceConfigurationStatus,
} from '../../../__generated__/resolvers-types';
import Subscription from '../../../model/kanel/public/Subscription';
import { PLATFORM_ORGANIZATION_UUID } from '../../../portal.const';
import * as authHelper from '../../../security/auth.helper';
import { ErrorCode } from '../../common/error-code';
import * as subscriptionDomain from '../../subcription/subscription.domain';
import { serviceContractDomain } from '../contract/domain';
import { enrollmentApp } from './enrollment.app';

describe('Enrollment app', () => {
  describe('enrollOCTIPlatform', () => {
    const platform: OctiPlatformInput = {
      id: uuidv4(),
      title: 'My OCTI platform',
      url: 'http://example.com',
      contract: OctiPlatformContract.Ee,
    };

    describe('invalid configuration', async () => {
      it('should throw when platformId is not valid', async () => {
        const call = enrollmentApp.enrollOCTIPlatform(contextAdminUser, {
          organizationId: PLATFORM_ORGANIZATION_UUID,
          platform: {
            ...platform,
            id: 'hello',
          },
        });

        await expect(call).rejects.toThrow('INVALID_SERVICE_CONFIGURATION');
      });

      it('should throw when platformUrl is not valid', async () => {
        const call = enrollmentApp.enrollOCTIPlatform(contextAdminUser, {
          organizationId: PLATFORM_ORGANIZATION_UUID,
          platform: {
            ...platform,
            url: 'hello',
          },
        });

        await expect(call).rejects.toThrow('INVALID_SERVICE_CONFIGURATION');
      });
    });

    it('return token when platform is enrolled', async () => {
      const token = await enrollmentApp.enrollOCTIPlatform(contextAdminUser, {
        organizationId: PLATFORM_ORGANIZATION_UUID,
        platform,
      });

      expect(token).toBeDefined();
    });
  });

  describe('unenrollOCTIPlatform', () => {
    const platformId = uuidv4();
    const platform: OctiPlatformInput = {
      id: platformId,
      title: 'My OCTI platform',
      url: 'http://example.com',
      contract: OctiPlatformContract.Ee,
    };

    beforeEach(async () => {
      await enrollmentApp.enrollOCTIPlatform(contextAdminUser, {
        organizationId: PLATFORM_ORGANIZATION_UUID,
        platform,
      });
    });

    it('should unenroll platform when the platform is still active', async () => {
      await enrollmentApp.unenrollOCTIPlatform(contextAdminUser, {
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

  describe('canEnrollOCTIPlatform', () => {
    const organizationId = uuidv4();
    const platformId = uuidv4();

    let isUserAllowedSpy: MockInstance;
    let loadConfigurationsByPlatformSpy: MockInstance;
    let loadActiveSubscriptionBySpy: MockInstance;
    let loadLastSubscriptionByServiceInstanceSpy: MockInstance;

    beforeEach(() => {
      isUserAllowedSpy = vi.spyOn(authHelper, 'isUserAllowedOnOrganization');
      loadConfigurationsByPlatformSpy = vi.spyOn(
        serviceContractDomain,
        'loadConfigurationsByPlatform'
      );
      loadActiveSubscriptionBySpy = vi.spyOn(
        subscriptionDomain,
        'loadActiveSubscriptionBy'
      );
      loadLastSubscriptionByServiceInstanceSpy = vi.spyOn(
        subscriptionDomain,
        'loadLastSubscriptionByServiceInstance'
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    describe('never_enrolled', () => {
      beforeEach(() => {
        loadConfigurationsByPlatformSpy.mockReturnValue(Promise.resolve([]));
      });

      it(`should allow user to enroll when he has the required capabilities`, async () => {
        isUserAllowedSpy.mockReturnValue(Promise.resolve(true));

        const result = await enrollmentApp.canEnrollOCTIPlatform(
          contextAdminUser,
          {
            organizationId,
            platformId,
          }
        );

        expect(result.isSameOrganization).toBeUndefined();
        expect(result.isAllowed).toBeTruthy();
        expect(result.status).toBe(CanEnrollStatus.NeverEnrolled);
      });

      it('should not allow user to enroll when he does not have the required capabilities', async () => {
        isUserAllowedSpy.mockReturnValue(Promise.resolve(false));

        const result = await enrollmentApp.canEnrollOCTIPlatform(
          contextAdminUser,
          {
            organizationId,
            platformId,
          }
        );

        expect(result.isSameOrganization).toBeUndefined();
        expect(result.isAllowed).toBeFalsy();
        expect(result.status).toBe(CanEnrollStatus.NeverEnrolled);
      });
    });

    describe('enrolled', () => {
      beforeEach(() => {
        loadConfigurationsByPlatformSpy.mockReturnValue(
          Promise.resolve([
            {
              service_instance_id: uuidv4(),
              status: ServiceConfigurationStatus.Active,
            },
          ])
        );
      });

      describe('same organization', () => {
        beforeEach(() => {
          loadActiveSubscriptionBySpy.mockReturnValue(
            Promise.resolve({ organization_id: organizationId })
          );
        });

        it(`should allow user to enroll when he has the required capabilities`, async () => {
          isUserAllowedSpy.mockReturnValue(Promise.resolve(true));

          const result = await enrollmentApp.canEnrollOCTIPlatform(
            contextAdminUser,
            {
              organizationId,
              platformId,
            }
          );

          expect(result.isSameOrganization).toBeTruthy();
          expect(result.isAllowed).toBeTruthy();
          expect(result.status).toBe(CanEnrollStatus.Enrolled);
        });

        it('should not allow user to enroll when he does not have the required capabilities', async () => {
          isUserAllowedSpy.mockReturnValue(Promise.resolve(false));

          const result = await enrollmentApp.canEnrollOCTIPlatform(
            contextAdminUser,
            {
              organizationId,
              platformId,
            }
          );

          expect(result.isSameOrganization).toBeTruthy();
          expect(result.isAllowed).toBeFalsy();
          expect(result.status).toBe(CanEnrollStatus.Enrolled);
        });
      });

      describe('another organization', () => {
        const anotherOrganizationId = uuidv4();
        beforeEach(() => {
          loadActiveSubscriptionBySpy.mockReturnValue(
            Promise.resolve({ organization_id: anotherOrganizationId })
          );
        });

        it(`should allow user to enroll when he has the required capabilities on both organizations`, async () => {
          isUserAllowedSpy.mockReturnValue(Promise.resolve(true));

          const result = await enrollmentApp.canEnrollOCTIPlatform(
            contextAdminUser,
            {
              organizationId,
              platformId,
            }
          );

          expect(result.isSameOrganization).toBeFalsy();
          expect(result.isAllowed).toBeTruthy();
          expect(result.status).toBe(CanEnrollStatus.Enrolled);
        });

        it('should not allow user to enroll when he does not have the required capabilities on the target organization', async () => {
          isUserAllowedSpy.mockImplementation(
            (_, { organizationId: isAllowedOrganizationId }) => {
              return Promise.resolve(
                isAllowedOrganizationId === organizationId
              );
            }
          );

          const result = await enrollmentApp.canEnrollOCTIPlatform(
            contextAdminUser,
            {
              organizationId,
              platformId,
            }
          );

          expect(result.isSameOrganization).toBeFalsy();
          expect(result.isAllowed).toBeFalsy();
          expect(result.status).toBe(CanEnrollStatus.Enrolled);
        });

        it('should not allow user to enroll when he does not have the required capabilities on the origin organization', async () => {
          isUserAllowedSpy.mockImplementation(
            (_, { organizationId: isAllowedOrganizationId }) => {
              return isAllowedOrganizationId !== organizationId;
            }
          );

          const result = await enrollmentApp.canEnrollOCTIPlatform(
            contextAdminUser,
            {
              organizationId,
              platformId,
            }
          );

          expect(result.isSameOrganization).toBeFalsy();
          expect(result.isAllowed).toBeFalsy();
          expect(result.status).toBe(CanEnrollStatus.Enrolled);
        });
      });
    });

    describe('unenrolled', () => {
      beforeEach(async () => {
        loadConfigurationsByPlatformSpy.mockReturnValue(
          Promise.resolve([
            {
              service_instance_id: uuidv4(),
              status: ServiceConfigurationStatus.Inactive,
            },
          ])
        );
      });

      describe('same organization', () => {
        beforeEach(() => {
          loadLastSubscriptionByServiceInstanceSpy.mockReturnValue(
            Promise.resolve({ organization_id: organizationId })
          );
        });

        it(`should allow user to enroll when he has the required capabilities`, async () => {
          isUserAllowedSpy.mockReturnValue(Promise.resolve(true));

          const result = await enrollmentApp.canEnrollOCTIPlatform(
            contextAdminUser,
            {
              organizationId,
              platformId,
            }
          );

          expect(result.isSameOrganization).toBeTruthy();
          expect(result.isAllowed).toBeTruthy();
          expect(result.status).toBe(CanEnrollStatus.Unenrolled);
        });

        it('should not allow user to enroll when he does not have the required capabilities', async () => {
          isUserAllowedSpy.mockReturnValue(Promise.resolve(false));

          const result = await enrollmentApp.canEnrollOCTIPlatform(
            contextAdminUser,
            {
              organizationId,
              platformId,
            }
          );

          expect(result.isSameOrganization).toBeTruthy();
          expect(result.isAllowed).toBeFalsy();
          expect(result.status).toBe(CanEnrollStatus.Unenrolled);
        });
      });

      describe('another organization', () => {
        const anotherOrganizationId = uuidv4();
        beforeEach(() => {
          loadLastSubscriptionByServiceInstanceSpy.mockReturnValue(
            Promise.resolve({ organization_id: anotherOrganizationId })
          );
        });

        it(`should allow user to enroll when he has the required capabilities on both organizations`, async () => {
          isUserAllowedSpy.mockReturnValue(Promise.resolve(true));

          const result = await enrollmentApp.canEnrollOCTIPlatform(
            contextAdminUser,
            {
              organizationId,
              platformId,
            }
          );

          expect(result.isSameOrganization).toBeFalsy();
          expect(result.isAllowed).toBeTruthy();
          expect(result.status).toBe(CanEnrollStatus.Unenrolled);
        });

        it('should not allow user to enroll when he does not have the required capabilities on the target organization', async () => {
          isUserAllowedSpy.mockImplementation(
            (_, { organizationId: isAllowedOrganizationId }) => {
              return Promise.resolve(
                isAllowedOrganizationId === organizationId
              );
            }
          );

          const result = await enrollmentApp.canEnrollOCTIPlatform(
            contextAdminUser,
            {
              organizationId,
              platformId,
            }
          );

          expect(result.isSameOrganization).toBeFalsy();
          expect(result.isAllowed).toBeFalsy();
          expect(result.status).toBe(CanEnrollStatus.Unenrolled);
        });

        it('should not allow user to enroll when he does not have the required capabilities on the origin organization', async () => {
          isUserAllowedSpy.mockImplementation(
            (_, { organizationId: isAllowedOrganizationId }) => {
              return isAllowedOrganizationId !== organizationId;
            }
          );

          const result = await enrollmentApp.canEnrollOCTIPlatform(
            contextAdminUser,
            {
              organizationId,
              platformId,
            }
          );

          expect(result.isSameOrganization).toBeFalsy();
          expect(result.isAllowed).toBeFalsy();
          expect(result.status).toBe(CanEnrollStatus.Unenrolled);
        });
      });
    });
  });

  describe('canUnenrollOCTIPlatform', () => {
    const platformId = uuidv4();

    let isUserAllowedOnOrganizationSpy: MockInstance;
    let loadConfigurationByPlatformSpy: MockInstance;
    let loadActiveSubscriptionBySpy: MockInstance;

    beforeEach(() => {
      isUserAllowedOnOrganizationSpy = vi.spyOn(
        authHelper,
        'isUserAllowedOnOrganization'
      );
      loadConfigurationByPlatformSpy = vi.spyOn(
        serviceContractDomain,
        'loadConfigurationByPlatform'
      );
      loadActiveSubscriptionBySpy = vi.spyOn(
        subscriptionDomain,
        'loadActiveSubscriptionBy'
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should throw an error when configuration for platform does not exist', async () => {
      loadConfigurationByPlatformSpy.mockReturnValue(Promise.resolve(null));

      const call = enrollmentApp.canUnenrollOCTIPlatform(contextAdminUser, {
        platformId,
      });

      await expect(call).rejects.toThrow(ErrorCode.PlatformNotEnrolled);
    });

    it('should throw an error when subscription does not exist', async () => {
      loadConfigurationByPlatformSpy.mockReturnValue(
        Promise.resolve({ service_instance_id: uuidv4() })
      );
      loadActiveSubscriptionBySpy.mockReturnValue(Promise.resolve(null));

      const call = enrollmentApp.canUnenrollOCTIPlatform(contextAdminUser, {
        platformId,
      });

      await expect(call).rejects.toThrow(ErrorCode.PlatformNotEnrolled);
    });

    it('should allow user to enroll when he has the required capabilities', async () => {
      const organizationId = uuidv4();
      isUserAllowedOnOrganizationSpy.mockReturnValue(Promise.resolve(true));
      loadConfigurationByPlatformSpy.mockReturnValue(
        Promise.resolve({ service_instance_id: uuidv4() })
      );
      loadActiveSubscriptionBySpy.mockReturnValue(
        Promise.resolve({ organization_id: organizationId })
      );

      const result = await enrollmentApp.canUnenrollOCTIPlatform(
        contextAdminUser,
        { platformId }
      );

      expect(result.isAllowed).toBeTruthy();
      expect(result.organizationId).toBe(organizationId);
    });

    it('should not allow user to enroll when he does not have the required capabilities', async () => {
      const organizationId = uuidv4();
      loadConfigurationByPlatformSpy.mockReturnValue(
        Promise.resolve({ service_instance_id: uuidv4() })
      );
      loadActiveSubscriptionBySpy.mockReturnValue(
        Promise.resolve({ organization_id: organizationId })
      );
      isUserAllowedOnOrganizationSpy.mockReturnValue(Promise.resolve(false));

      const result = await enrollmentApp.canUnenrollOCTIPlatform(
        contextAdminUser,
        { platformId }
      );

      expect(result.isAllowed).toBeFalsy();
      expect(result.organizationId).toBe(organizationId);
    });
  });
});
