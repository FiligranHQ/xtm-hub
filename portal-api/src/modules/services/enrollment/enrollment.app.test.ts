import { MockInstance } from '@vitest/spy';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { contextAdminUser } from '../../../../tests/tests.const';
import { CanEnrollStatus } from '../../../__generated__/resolvers-types';
import { PLATFORM_ORGANIZATION_UUID } from '../../../portal.const';
import * as authHelper from '../../../security/auth.helper';
import * as subscriptionDomain from '../../subcription/subscription.domain';
import { serviceContractDomain } from '../contract/domain';
import { enrollmentApp } from './enrollment.app';

describe('Enrollment app', () => {
  describe('enrollOCTIInstance', () => {
    const platformId = uuidv4();
    const platformTitle = 'My OCTI instance';
    const platformUrl = 'http://example.com';

    describe('invalid configuration', async () => {
      it('should throw when platformId is not valid', async () => {
        const call = enrollmentApp.enrollOCTIInstance(contextAdminUser, {
          organizationId: PLATFORM_ORGANIZATION_UUID,
          platformTitle,
          platformId: 'hello',
          platformUrl,
        });

        await expect(call).rejects.toThrow('INVALID_SERVICE_CONFIGURATION');
      });

      it('should throw when platformUrl is not valid', async () => {
        const call = enrollmentApp.enrollOCTIInstance(contextAdminUser, {
          organizationId: PLATFORM_ORGANIZATION_UUID,
          platformTitle,
          platformId,
          platformUrl: 'hello',
        });

        await expect(call).rejects.toThrow('INVALID_SERVICE_CONFIGURATION');
      });

      it('should throw when platformTitle is not valid', async () => {
        const call = enrollmentApp.enrollOCTIInstance(contextAdminUser, {
          organizationId: PLATFORM_ORGANIZATION_UUID,
          platformTitle: null,
          platformId,
          platformUrl,
        });

        await expect(call).rejects.toThrow('INVALID_SERVICE_CONFIGURATION');
      });
    });

    it('return token when instance is enrolled', async () => {
      const token = await enrollmentApp.enrollOCTIInstance(contextAdminUser, {
        organizationId: PLATFORM_ORGANIZATION_UUID,
        platformTitle,
        platformId,
        platformUrl,
      });

      expect(token).toBeDefined();
    });
  });

  describe('canEnrollOCTIInstance', () => {
    const organizationId = uuidv4();
    const platformId = uuidv4();

    let isUserAllowedSpy: MockInstance;
    let findConfigurationSpy: MockInstance;
    let loadSubscriptionByServiceInstanceSpy: MockInstance;

    beforeEach(() => {
      isUserAllowedSpy = vi.spyOn(authHelper, 'isUserAllowed');
      findConfigurationSpy = vi.spyOn(
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
        findConfigurationSpy.mockReturnValue(Promise.resolve(null));
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
        findConfigurationSpy.mockReturnValue(Promise.resolve(null));
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
        findConfigurationSpy.mockReturnValue(
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
});
