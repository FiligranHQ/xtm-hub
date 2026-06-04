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
} from '../security-management/subscription-capability/subscription-capability.domain';
import { subscriptionApp } from './subscription.app';
import { SubscriptionDomain } from './subscription.domain';

describe('subscription app', () => {
  describe('subscribeOrganizationsToService', async () => {
    let serviceInstanceId: ServiceInstanceId;

    beforeEach(async () => {
      serviceInstanceId = uuidv4() as ServiceInstanceId;
      await TestHelper.serviceInstance.create({
        id: serviceInstanceId,
        name: 'test-multi-org',
      });
    });

    it('should create one subscription per organization id', async () => {
      await subscriptionApp.subscribeOrganizationsToService({
        organizationIds: [
          TEST_ORGANIZATIONS.FILIGRAN.ID,
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        ],
        serviceInstanceId,
        startDate: new Date(),
        endDate: new Date(),
        capabilityIds: [],
      });

      const filigranSubscription = await TestHelper.subscription.load({
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: serviceInstanceId,
      });
      const secondOrganizationSubscription = await TestHelper.subscription.load(
        {
          organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
          service_instance_id: serviceInstanceId,
        }
      );

      expect(filigranSubscription).toBeDefined();
      expect(secondOrganizationSubscription).toBeDefined();
    });

    it('should rollback all creations when one organization is already subscribed', async () => {
      await SubscriptionDomain.createSubscription({
        id: uuidv4() as SubscriptionId,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        service_instance_id: serviceInstanceId,
        start_date: new Date(),
        end_date: new Date(),
      });

      const call = subscriptionApp.subscribeOrganizationsToService({
        organizationIds: [
          TEST_ORGANIZATIONS.FILIGRAN.ID,
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        ],
        serviceInstanceId,
        startDate: new Date(),
        endDate: new Date(),
        capabilityIds: [],
      });

      await expect(call).rejects.toThrow(ErrorCode.AlreadySubscribed);

      const filigranSubscription = await TestHelper.subscription.load({
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: serviceInstanceId,
      });

      expect(filigranSubscription).toBeUndefined();
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

      await SubscriptionDomain.createSubscription({
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

      await SubscriptionDomain.createSubscription({
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
      await SubscriptionDomain.createSubscription({
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

      await SubscriptionDomain.createSubscription({
        id: uuidv4() as SubscriptionId,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: serviceInstanceId,
        start_date: new Date(),
        end_date: null,
      });

      const secondOrganizationSubscription =
        await SubscriptionDomain.createSubscription({
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

  describe(`${subscriptionApp.deleteSubscriptions.name}`, () => {
    it('should delete the subscription', async () => {
      const id = uuidv4() as SubscriptionId;
      const subscription = await SubscriptionDomain.createSubscription({
        id,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        start_date: new Date(),
        end_date: null,
      });

      expect(subscription).toBeDefined();

      const deletedSubscription = await subscriptionApp.deleteSubscriptions([
        id,
      ]);
      expect(deletedSubscription).toStrictEqual([subscription]);
    });

    it('should delete linked subscription capabilities', async () => {
      const id = uuidv4() as SubscriptionId;
      await SubscriptionDomain.createSubscription({
        id,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        start_date: new Date(),
        end_date: null,
      });
      await addCapabilitiesToSubscription(id, [
        SERVICES.INSTANCES.INTEGRATIONS.CAPABILITIES.UPLOAD.ID,
      ]);

      await subscriptionApp.deleteSubscriptions([id]);

      const deletedSubscription = await TestHelper.subscription.load({ id });
      expect(deletedSubscription).toBeUndefined();

      const capabilities = await loadSubscriptionCapabilities(id);
      expect(capabilities).toHaveLength(0);
    });
  });
});
