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
  describe('enrollOCTIInstance', () => {
    const platform: OctiPlatformInput = {
      id: uuidv4(),
      title: 'My OCTI instance',
      url: 'http://example.com',
      contract: OctiPlatformContract.Ee,
    };

    describe('invalid configuration', async () => {
      it('should throw when platformId is not valid', async () => {
        const call = enrollmentApp.enrollOCTIInstance(contextAdminUser, {
          organizationId: PLATFORM_ORGANIZATION_UUID,
          platform: {
            ...platform,
            id: 'hello',
          },
        });

        await expect(call).rejects.toThrow('INVALID_SERVICE_CONFIGURATION');
      });

      it('should throw when platformUrl is not valid', async () => {
        const call = enrollmentApp.enrollOCTIInstance(contextAdminUser, {
          organizationId: PLATFORM_ORGANIZATION_UUID,
          platform: {
            ...platform,
            url: 'hello',
          },
        });

        await expect(call).rejects.toThrow('INVALID_SERVICE_CONFIGURATION');
      });
    });

    it('return token when instance is enrolled', async () => {
      const token = await enrollmentApp.enrollOCTIInstance(contextAdminUser, {
        organizationId: PLATFORM_ORGANIZATION_UUID,
        platform,
      });

      expect(token).toBeDefined();
    });
  });

  describe('unenrollOCTIInstance', () => {
    const platformId = uuidv4();
    const platform: OctiPlatformInput = {
      id: platformId,
      title: 'My OCTI instance',
      url: 'http://example.com',
      contract: OctiPlatformContract.Ee,
    };

    beforeEach(async () => {
      await enrollmentApp.enrollOCTIInstance(contextAdminUser, {
        organizationId: PLATFORM_ORGANIZATION_UUID,
        platform,
      });
    });

    it('should unenroll instance when the instance is still active', async () => {
      await enrollmentApp.unenrollOCTIInstance(contextAdminUser, {
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

  describe('canEnrollOCTIInstance', () => {
    const organizationId = uuidv4();
    const platformId = uuidv4();

    let isUserAllowedSpy: MockInstance;
    let loadConfigurationByPlatformSpy: MockInstance;
    let loadSubscriptionByServiceInstanceSpy: MockInstance;

    beforeEach(() => {
      isUserAllowedSpy = vi.spyOn(authHelper, 'isUserAllowed');
      loadConfigurationByPlatformSpy = vi.spyOn(
        serviceContractDomain,
        'loadConfigurationByPlatform'
      );
      loadSubscriptionByServiceInstanceSpy = vi.spyOn(
        subscriptionDomain,
        'loadSubscriptionBy'
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    describe('never_enrolled', () => {
      it(`should allow user to enroll when he has the required capabilities`, async () => {
        loadConfigurationByPlatformSpy.mockReturnValue(Promise.resolve(null));
        isUserAllowedSpy.mockReturnValue(Promise.resolve(true));

        const result = await enrollmentApp.canEnrollOCTIInstance(
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
        loadConfigurationByPlatformSpy.mockReturnValue(Promise.resolve(null));
        isUserAllowedSpy.mockReturnValue(Promise.resolve(false));

        const result = await enrollmentApp.canEnrollOCTIInstance(
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
        loadConfigurationByPlatformSpy.mockReturnValue(
          Promise.resolve({ service_instance_id: uuidv4() })
        );
      });

      describe('same organization', () => {
        beforeEach(() => {
          loadSubscriptionByServiceInstanceSpy.mockReturnValue(
            Promise.resolve({ organization_id: organizationId })
          );
        });

        it(`should allow user to enroll when he has the required capabilities`, async () => {
          isUserAllowedSpy.mockReturnValue(Promise.resolve(true));

          const result = await enrollmentApp.canEnrollOCTIInstance(
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

          const result = await enrollmentApp.canEnrollOCTIInstance(
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
          loadSubscriptionByServiceInstanceSpy.mockReturnValue(
            Promise.resolve({ organization_id: anotherOrganizationId })
          );
        });

        it(`should allow user to enroll when he has the required capabilities on both organizations`, async () => {
          isUserAllowedSpy.mockReturnValue(Promise.resolve(true));

          const result = await enrollmentApp.canEnrollOCTIInstance(
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

          const result = await enrollmentApp.canEnrollOCTIInstance(
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

          const result = await enrollmentApp.canEnrollOCTIInstance(
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
  });

  describe('canUnenrollOCTIInstance', () => {
    const platformId = uuidv4();

    let isUserAllowedSpy: MockInstance;
    let loadConfigurationByPlatformSpy: MockInstance;
    let loadSubscriptionBySpy: MockInstance;

    beforeEach(() => {
      isUserAllowedSpy = vi.spyOn(authHelper, 'isUserAllowed');
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

      const call = enrollmentApp.canUnenrollOCTIInstance(contextAdminUser, {
        platformId,
      });

      await expect(call).rejects.toThrow(
        ErrorCode.ServiceConfigurationNotFound
      );
    });

    it('should throw an error when subscription does not exist', async () => {
      loadConfigurationByPlatformSpy.mockReturnValue(
        Promise.resolve({ service_instance_id: uuidv4() })
      );
      loadSubscriptionBySpy.mockReturnValue(Promise.resolve(null));

      const call = enrollmentApp.canUnenrollOCTIInstance(contextAdminUser, {
        platformId,
      });

      await expect(call).rejects.toThrow(ErrorCode.SubscriptionNotFound);
    });

    it('should allow user to enroll when he has the required capabilities', async () => {
      const organizationId = uuidv4();
      isUserAllowedSpy.mockReturnValue(Promise.resolve(true));
      loadConfigurationByPlatformSpy.mockReturnValue(
        Promise.resolve({ service_instance_id: uuidv4() })
      );
      loadSubscriptionBySpy.mockReturnValue(
        Promise.resolve({ organization_id: organizationId })
      );

      const result = await enrollmentApp.canUnenrollOCTIInstance(
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
      loadSubscriptionBySpy.mockReturnValue(
        Promise.resolve({ organization_id: organizationId })
      );
      isUserAllowedSpy.mockReturnValue(Promise.resolve(false));

      const result = await enrollmentApp.canUnenrollOCTIInstance(
        contextAdminUser,
        { platformId }
      );

      expect(result.isAllowed).toBeFalsy();
      expect(result.organizationId).toBe(organizationId);
    });
  });
});
