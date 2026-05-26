import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it } from 'vitest';
import { TestHelper } from '../../../tests/helper/test.helper';
import { SERVICES, TEST_ORGANIZATIONS } from '../../../tests/tests.const';
import { ServiceCapabilityId } from '../../model/kanel/public/ServiceCapability';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { addCapabilitiesToSubscription } from '../security-management/subscription-capability/subscription-capability.domain';
import {
  createSubscription,
  getServiceCapability,
  getSubscriptionCapability,
  loadSubscriptionBy,
  SubscriptionDomain,
  transferSubscriptionToOrganization,
  updateSubscriptionBy,
} from './subscription.domain';

const toCapabilityGlobalId = (capabilityId: ServiceCapabilityId) =>
  toGlobalId('Service_Capability', capabilityId) as ServiceCapabilityId;

describe('subscription domain', () => {
  let serviceInstanceId: ServiceInstanceId;

  beforeEach(async () => {
    serviceInstanceId = uuidv4() as ServiceInstanceId;
    await TestHelper.serviceInstance.create({
      id: serviceInstanceId,
      name: 'domain-test-instance',
    });
  });

  describe(`should test createSubscription`, () => {
    it('should create a subscription and return it', async () => {
      const id = uuidv4() as SubscriptionId;
      const start_date = new Date('2025-01-01');
      const end_date = new Date('2026-01-01');

      const result = await createSubscription({
        id,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: serviceInstanceId,
        start_date,
        end_date,
      });

      expect(result).toMatchObject({
        id,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: serviceInstanceId,
      });
      expect(result.start_date?.toISOString().slice(0, 10)).toBe('2025-01-01');
      expect(result.end_date?.toISOString().slice(0, 10)).toBe('2026-01-01');
    });

    it('should create a subscription with a null end_date', async () => {
      const id = uuidv4() as SubscriptionId;

      const result = await createSubscription({
        id,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: serviceInstanceId,
        start_date: new Date(),
        end_date: null,
      });

      expect(result.id).toBe(id);
      expect(result.end_date).toBeNull();
    });
  });

  describe(`should test loadSubscriptionBy`, () => {
    it('should return the subscription matching the given field', async () => {
      const id = uuidv4() as SubscriptionId;
      await createSubscription({
        id,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: serviceInstanceId,
        start_date: new Date(),
        end_date: null,
      });

      const result = await loadSubscriptionBy({ id });

      expect(result).toBeDefined();
      expect(result?.id).toBe(id);
    });

    it('should return undefined when no subscription matches', async () => {
      const result = await loadSubscriptionBy({
        id: uuidv4() as SubscriptionId,
      });

      expect(result).toBeUndefined();
    });

    it('should filter by organization_id', async () => {
      const id = uuidv4() as SubscriptionId;
      await createSubscription({
        id,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        service_instance_id: serviceInstanceId,
        start_date: new Date(),
        end_date: null,
      });

      const result = await loadSubscriptionBy({
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        service_instance_id: serviceInstanceId,
      });

      expect(result?.id).toBe(id);
    });
  });

  describe(`should test updateSubscriptionBy`, () => {
    it('should update the subscription fields and return the updated rows', async () => {
      const id = uuidv4() as SubscriptionId;
      await createSubscription({
        id,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: serviceInstanceId,
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-12-31'),
      });

      const [updated] = await updateSubscriptionBy(
        { id },
        { start_date: new Date('2026-06-01'), end_date: new Date('2026-12-31') }
      );

      expect(updated).toBeDefined();
      expect(updated?.start_date?.toISOString().slice(0, 10)).toBe(
        '2026-06-01'
      );
      expect(updated?.end_date?.toISOString().slice(0, 10)).toBe('2026-12-31');
    });
  });

  describe(`SubscriptionDomain.${SubscriptionDomain.deleteSubscriptions.name}`, () => {
    it('should delete subscriptions by ids and return the deleted rows', async () => {
      const id1 = uuidv4() as SubscriptionId;
      const id2 = uuidv4() as SubscriptionId;
      await createSubscription({
        id: id1,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: serviceInstanceId,
        start_date: new Date(),
        end_date: null,
      });
      await createSubscription({
        id: id2,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        service_instance_id: serviceInstanceId,
        start_date: new Date(),
        end_date: null,
      });

      const deleted = await SubscriptionDomain.deleteSubscriptions([id1, id2]);

      expect(deleted).toHaveLength(2);
      expect(deleted?.map((s) => s.id)).toEqual(
        expect.arrayContaining([id1, id2])
      );

      const remaining1 = await loadSubscriptionBy({ id: id1 });
      const remaining2 = await loadSubscriptionBy({ id: id2 });
      expect(remaining1).toBeUndefined();
      expect(remaining2).toBeUndefined();
    });

    it('should return an empty array when no ids match', async () => {
      const deleted = await SubscriptionDomain.deleteSubscriptions([
        uuidv4() as SubscriptionId,
      ]);
      expect(deleted).toEqual([]);
    });
  });

  describe('should test getSubscriptionCapability', () => {
    it('should return capabilities linked to the subscription', async () => {
      const id = uuidv4() as SubscriptionId;
      await createSubscription({
        id,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        start_date: new Date(),
        end_date: null,
      });
      await addCapabilitiesToSubscription(id, [
        toCapabilityGlobalId(
          SERVICES.INSTANCES.INTEGRATIONS.CAPABILITIES.UPLOAD.ID
        ),
        toCapabilityGlobalId(
          SERVICES.INSTANCES.INTEGRATIONS.CAPABILITIES.DELETE.ID
        ),
      ]);

      const result = await getSubscriptionCapability(id);

      expect(result).toHaveLength(2);
      const capabilityIds = result.map(
        (subscriptionCapability: {
          service_capability_id: ServiceCapabilityId;
        }) => subscriptionCapability.service_capability_id
      );
      expect(capabilityIds).toEqual(
        expect.arrayContaining([
          SERVICES.INSTANCES.INTEGRATIONS.CAPABILITIES.UPLOAD.ID,
          SERVICES.INSTANCES.INTEGRATIONS.CAPABILITIES.DELETE.ID,
        ])
      );
    });

    it('should return an empty array when the subscription has no capabilities', async () => {
      const id = uuidv4() as SubscriptionId;
      await createSubscription({
        id,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: serviceInstanceId,
        start_date: new Date(),
        end_date: null,
      });

      const result = await getSubscriptionCapability(id);
      expect(result).toHaveLength(0);
    });
  });

  describe('should test getServiceCapability', () => {
    it('should return the service capability linked to a subscription_capability id', async () => {
      const subscriptionId = uuidv4() as SubscriptionId;
      await createSubscription({
        id: subscriptionId,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        start_date: new Date(),
        end_date: null,
      });
      const [subscriptionCapability] = await addCapabilitiesToSubscription(
        subscriptionId,
        [
          toCapabilityGlobalId(
            SERVICES.INSTANCES.INTEGRATIONS.CAPABILITIES.UPLOAD.ID
          ),
        ]
      );

      const result = await getServiceCapability(subscriptionCapability!.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(
        SERVICES.INSTANCES.INTEGRATIONS.CAPABILITIES.UPLOAD.ID
      );
    });

    it('should return undefined when the subscription_capability id does not exist', async () => {
      const result = await getServiceCapability(
        uuidv4() as ServiceCapabilityId
      );
      expect(result).toBeUndefined();
    });
  });

  describe(`should test transferSubscriptionToOrganization`, () => {
    it('should transfer a subscription to a new organization', async () => {
      const id = uuidv4() as SubscriptionId;
      await createSubscription({
        id,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: serviceInstanceId,
        start_date: new Date(),
        end_date: null,
      });

      await transferSubscriptionToOrganization({
        subscriptionId: id,
        organizationId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
      });

      const updated = await loadSubscriptionBy({ id });
      expect(updated?.organization_id).toBe(
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
      );
    });
  });
});
