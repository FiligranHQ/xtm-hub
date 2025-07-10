import { MockInstance } from '@vitest/spy';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dbUnsecure } from '../../../../knexfile';
import { contextAdminUser } from '../../../../tests/tests.const';
import { CanEnrollStatus } from '../../../__generated__/resolvers-types';
import ServiceConfiguration from '../../../model/kanel/public/ServiceConfiguration';
import ServiceInstance from '../../../model/kanel/public/ServiceInstance';
import Subscription from '../../../model/kanel/public/Subscription';
import { PLATFORM_ORGANIZATION_UUID } from '../../../portal.const';
import * as authHelper from '../../../security/auth.helper';
import * as subscriptionDomain from '../../subcription/subscription.domain';
import { serviceContractDomain } from '../contract/domain';
import { enrollmentApp } from './enrollment.app';

describe('Enrollment app', () => {
  describe('enrollOCTIInstance', () => {
    const context = contextAdminUser;

    it('should save enrollment data', async () => {
      const platformId = uuidv4();
      const platformTitle = 'My OCTI instance';
      const platformUrl = 'http://example.com';
      const token = await enrollmentApp.enrollOCTIInstance(context, {
        organizationId: PLATFORM_ORGANIZATION_UUID,
        platformTitle,
        platformId,
        platformUrl,
      });

      expect(token).toBeDefined();

      const serviceInstance = await dbUnsecure<ServiceInstance>(
        'ServiceInstance'
      )
        .where('name', '=', 'OpenCTI Instance')
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
      expect(configuration.enroller_id).toBe(context.user.id);
      expect(configuration.platform_id).toBe(platformId);
      expect(configuration.platform_title).toBe(platformTitle);
      expect(configuration.platform_url).toBe(platformUrl);
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
        'findConfiguration'
      );
      loadSubscriptionByServiceInstanceSpy = vi.spyOn(
        subscriptionDomain,
        'loadSubscriptionByServiceInstance'
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
