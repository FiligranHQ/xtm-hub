import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it } from 'vitest';
import { TestHelper } from '../../../tests/helper/test.helper';
import { SERVICES, TEST_ORGANIZATIONS } from '../../../tests/tests.const';
import { ServiceCapabilityId } from '../../model/kanel/public/ServiceCapability';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { UserLoadUserBy } from '../../model/user';
import { ErrorCode } from '../../utils/error/error.code';
import {
  addCapabilitiesToSubscription,
  loadSubscriptionCapabilities,
} from '../security-management/service-capability/subscription-capability.domain';
import { subscriptionApp } from './subscription.app';
import { createSubscription } from './subscription.domain';

describe('subscription app', () => {
  describe('subscribeOrganizationToService', async () => {
    let serviceInstanceId: ServiceInstanceId;
    beforeEach(async () => {
      serviceInstanceId = uuidv4() as ServiceInstanceId;
      await TestHelper.serviceInstance.create({
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

    it('should rollback subscription creation when capability insertion fails', async () => {
      const call = subscriptionApp.subscribeOrganizationToService({
        organizationId: TEST_ORGANIZATIONS.FILIGRAN.ID,
        serviceInstanceId,
        startDate: new Date(),
        endDate: new Date(),
        capabilityIds: [uuidv4() as ServiceCapabilityId],
      });

      await expect(call).rejects.toThrow();

      const createdSubscription = await TestHelper.subscription.load({
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: serviceInstanceId,
      });
      expect(createdSubscription).toBeUndefined();
    });
  });

  describe(`${subscriptionApp.updateSubscription.name}`, () => {
    let serviceInstanceId: ServiceInstanceId;

    beforeEach(async () => {
      serviceInstanceId = uuidv4() as ServiceInstanceId;
      await TestHelper.serviceInstance.create({
        id: serviceInstanceId,
        name: 'test-update',
      });
    });

    it('should update only dates and keep existing capabilities', async () => {
      const id = uuidv4() as SubscriptionId;
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-10');
      const newStartDate = new Date('2026-03-01');
      const newEndDate = new Date('2026-03-10');

      await createSubscription({
        id,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: serviceInstanceId,
        start_date: startDate,
        end_date: endDate,
      });
      await addCapabilitiesToSubscription(id, [
        SERVICES.INSTANCES.INTEGRATIONS.CAPABILITIES.UPLOAD.ID,
        SERVICES.INSTANCES.INTEGRATIONS.CAPABILITIES.DELETE.ID,
      ]);

      await subscriptionApp.updateSubscription({
        id,
        startDate: newStartDate,
        endDate: newEndDate,
      });

      const updatedSubscription = await TestHelper.subscription.load({ id });
      expect(updatedSubscription).toBeDefined();
      expect(updatedSubscription?.start_date?.toISOString().slice(0, 10)).toBe(
        '2026-03-01'
      );
      expect(updatedSubscription?.end_date?.toISOString().slice(0, 10)).toBe(
        '2026-03-10'
      );

      const capabilities = await loadSubscriptionCapabilities(id);
      expect(capabilities).toHaveLength(2);
    });

    it('should replace only capabilities and keep existing dates', async () => {
      const id = uuidv4() as SubscriptionId;
      const startDate = new Date('2026-02-01');
      const endDate = new Date('2026-02-10');

      await createSubscription({
        id,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: serviceInstanceId,
        start_date: startDate,
        end_date: endDate,
      });
      await addCapabilitiesToSubscription(id, [
        SERVICES.INSTANCES.INTEGRATIONS.CAPABILITIES.UPLOAD.ID,
      ]);

      await subscriptionApp.updateSubscription({
        id,
        capabilityIds: [SERVICES.INSTANCES.INTEGRATIONS.CAPABILITIES.DELETE.ID],
      });

      const updatedSubscription = await TestHelper.subscription.load({ id });
      expect(updatedSubscription?.start_date?.toISOString().slice(0, 10)).toBe(
        '2026-02-01'
      );
      expect(updatedSubscription?.end_date?.toISOString().slice(0, 10)).toBe(
        '2026-02-10'
      );

      const capabilities = await loadSubscriptionCapabilities(id);
      expect(capabilities).toHaveLength(1);
      expect(capabilities[0].service_capability_id).toBe(
        SERVICES.INSTANCES.INTEGRATIONS.CAPABILITIES.DELETE.ID
      );
    });

    it('should rollback updated dates and capabilities replacement on invalid capability id', async () => {
      const id = uuidv4() as SubscriptionId;
      await createSubscription({
        id,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: serviceInstanceId,
        start_date: new Date('2026-04-01'),
        end_date: new Date('2026-04-30'),
      });
      await addCapabilitiesToSubscription(id, [
        SERVICES.INSTANCES.INTEGRATIONS.CAPABILITIES.UPLOAD.ID,
      ]);

      const call = subscriptionApp.updateSubscription({
        id,
        startDate: new Date('2026-05-01'),
        capabilityIds: [uuidv4() as ServiceCapabilityId],
      });
      await expect(call).rejects.toThrow();

      const updatedSubscription = await TestHelper.subscription.load({ id });
      expect(updatedSubscription?.start_date?.toISOString().slice(0, 10)).toBe(
        '2026-04-01'
      );

      const capabilities = await loadSubscriptionCapabilities(id);
      expect(capabilities).toHaveLength(1);
      expect(capabilities[0].service_capability_id).toBe(
        SERVICES.INSTANCES.INTEGRATIONS.CAPABILITIES.UPLOAD.ID
      );
    });
  });

  describe(`${subscriptionApp.loadSubscriptionModel.name}`, () => {
    it('should load the subscription for the selected organization only', async () => {
      const serviceInstanceId = uuidv4() as ServiceInstanceId;
      await TestHelper.serviceInstance.create({
        id: serviceInstanceId,
        name: 'test-load-model',
      });

      await createSubscription({
        id: uuidv4() as SubscriptionId,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: serviceInstanceId,
        start_date: new Date(),
        end_date: null,
      });

      const secondOrganizationSubscription = await createSubscription({
        id: uuidv4() as SubscriptionId,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        service_instance_id: serviceInstanceId,
        start_date: new Date(),
        end_date: null,
      });

      const user = {
        selected_organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
      } as unknown as UserLoadUserBy;

      const loadedSubscription = await subscriptionApp.loadSubscriptionModel(
        user,
        serviceInstanceId
      );

      expect(loadedSubscription.id).toBe(secondOrganizationSubscription.id);
      expect(loadedSubscription.organization_id).toBe(
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
      );
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
      });

      expect(subscription).toBeDefined();

      const deletedSubscription = await subscriptionApp.deleteSubscription(id);
      expect(deletedSubscription).toStrictEqual(subscription);
    });

    it('should delete linked subscription capabilities', async () => {
      const id = uuidv4() as SubscriptionId;
      await createSubscription({
        id,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        start_date: new Date(),
        end_date: null,
      });
      await addCapabilitiesToSubscription(id, [
        SERVICES.INSTANCES.INTEGRATIONS.CAPABILITIES.UPLOAD.ID,
      ]);

      await subscriptionApp.deleteSubscription(id);

      const deletedSubscription = await TestHelper.subscription.load({ id });
      expect(deletedSubscription).toBeUndefined();

      const capabilities = await loadSubscriptionCapabilities(id);
      expect(capabilities).toHaveLength(0);
    });
  });
});
