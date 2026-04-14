import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it } from 'vitest';
import { TestHelper } from '../../../tests/helper/test.helper';
import { TestServiceHelper } from '../../../tests/helper/test.service.helper';
import { SERVICES, TEST_ORGANIZATIONS } from '../../../tests/tests.const';
import { ServiceCapabilityId } from '../../model/kanel/public/ServiceCapability';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { ErrorCode } from '../../utils/error/error.code';
import { loadSubscriptionCapabilities } from '../security-management/service-capability/subscription-capability.domain';
import { SubscriptionStatus } from '../subscription.const';
import { subscriptionApp } from './subscription.app';
import { createSubscription } from './subscription.domain';

describe('subscription app', () => {
  describe('subscribeOrganizationToService', async () => {
    let serviceInstanceId: ServiceInstanceId;
    beforeEach(async () => {
      serviceInstanceId = uuidv4() as ServiceInstanceId;
      await TestServiceHelper.serviceInstance.create({
        id: serviceInstanceId,
        name: 'test',
      });
    });

    it('should throw an error when organization is already subscribed to the service instance', async () => {
      const subscriptionId = uuidv4() as SubscriptionId;
      const subscriptionData = {
        id: subscriptionId,
        service_instance_id: serviceInstanceId,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        start_date: new Date(),
        end_date: new Date(),
        billing: 0,
        status: SubscriptionStatus.ACCEPTED,
      };
      await createSubscription(subscriptionData);

      const call = subscriptionApp.subscribeOrganizationToService({
        organizationId: TEST_ORGANIZATIONS.FILIGRAN.ID,
        serviceInstanceId,
        startDate: new Date(),
        endDate: new Date(),
        capabilityIds: [],
      });

      await expect(call).rejects.toThrow(ErrorCode.AlreadySubscribed);
    });

    it('should subscribe the organization to the service instance (without capabilities)', async () => {
      await subscriptionApp.subscribeOrganizationToService({
        organizationId: TEST_ORGANIZATIONS.FILIGRAN.ID,
        serviceInstanceId,
        startDate: new Date(),
        endDate: new Date(),
        capabilityIds: [],
      });

      const createdSubscription = await TestHelper.subscription.load({
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: serviceInstanceId,
      });

      expect(createdSubscription).toBeDefined();

      const capabilities: { service_capability_id: ServiceCapabilityId }[] =
        await loadSubscriptionCapabilities(
          createdSubscription?.id ?? ('' as SubscriptionId)
        );
      expect(capabilities).toHaveLength(0);
    });

    it('should subscribe the organization to the service instance (with capabilities)', async () => {
      await subscriptionApp.subscribeOrganizationToService({
        organizationId: TEST_ORGANIZATIONS.FILIGRAN.ID,
        serviceInstanceId,
        startDate: new Date(),
        endDate: new Date(),
        capabilityIds: [
          SERVICES.INSTANCES.INTEGRATIONS.CAPABILITIES.UPLOAD.ID,
          SERVICES.INSTANCES.INTEGRATIONS.CAPABILITIES.DELETE.ID,
        ],
      });

      const createdSubscription = await TestHelper.subscription.load({
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: serviceInstanceId,
      });

      expect(createdSubscription).toBeDefined();

      const capabilities: { service_capability_id: ServiceCapabilityId }[] =
        await loadSubscriptionCapabilities(
          createdSubscription?.id ?? ('' as SubscriptionId)
        );
      expect(capabilities).toHaveLength(2);
      expect(
        capabilities.some(
          (capa) =>
            capa.service_capability_id ===
            SERVICES.INSTANCES.INTEGRATIONS.CAPABILITIES.UPLOAD.ID
        )
      ).toBeTruthy();
      expect(
        capabilities.some(
          (capa) =>
            capa.service_capability_id ===
            SERVICES.INSTANCES.INTEGRATIONS.CAPABILITIES.DELETE.ID
        )
      ).toBeTruthy();
    });
  });

  describe(`${subscriptionApp.deleteSubscription.name}`, () => {
    it('should delete the subscription', async () => {
      const id = uuidv4() as SubscriptionId;
      const subscription = await createSubscription({
        id,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        start_date: new Date(),
        end_date: null,
        status: 'ACCEPTED',
        joining: 'AUTO_JOIN',
        billing: 0,
        justification: null,
      });

      expect(subscription).toBeDefined();

      const deletedSubscription = await subscriptionApp.deleteSubscription(id);
      expect(deletedSubscription).toStrictEqual(subscription);
    });
  });
});
