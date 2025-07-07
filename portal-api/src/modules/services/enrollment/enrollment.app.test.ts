import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { dbUnsecure } from '../../../../knexfile';
import { contextAdminUser } from '../../../../tests/tests.const';
import ServiceConfiguration from '../../../model/kanel/public/ServiceConfiguration';
import ServiceInstance from '../../../model/kanel/public/ServiceInstance';
import Subscription from '../../../model/kanel/public/Subscription';
import { PLATFORM_ORGANIZATION_UUID } from '../../../portal.const';
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
});
