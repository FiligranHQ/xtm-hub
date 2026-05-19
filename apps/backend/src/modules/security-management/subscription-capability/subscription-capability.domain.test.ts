import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { TestHelper } from '../../../../tests/helper/test.helper';
import ServiceCapability from '../../../model/kanel/public/ServiceCapability';
import ServiceDefinition from '../../../model/kanel/public/ServiceDefinition';
import ServiceInstance from '../../../model/kanel/public/ServiceInstance';
import Subscription from '../../../model/kanel/public/Subscription';
import SubscriptionCapability from '../../../model/kanel/public/SubscriptionCapability';
import {
  addCapabilitiesToSubscription,
  loadSubscriptionCapabilities,
  loadSubscriptionCapabilitiesBy,
  replaceCapabilitiesForSubscription,
} from './subscription-capability.domain';
type SubscriptionCapabilityWithJoin = SubscriptionCapability & {
  service_capability: {
    id: string | null;
    name: string | null;
    description: string | null;
    __typename: 'Service_Capability';
  };
};
describe('subscription capability domain', () => {
  let serviceDefinition: ServiceDefinition;
  let serviceInstance: ServiceInstance;
  let subscription: Subscription;
  let capability1: ServiceCapability;
  let capability2: ServiceCapability;
  let capability3: ServiceCapability;
  beforeAll(async () => {
    serviceDefinition = await TestHelper.serviceDefinition.create({
      name: 'Subscription Capability Service Definition',
    });
    serviceInstance = await TestHelper.serviceInstance.create({
      name: 'Subscription Capability Service Instance',
      service_definition_id: serviceDefinition.id,
    });
    subscription = await TestHelper.subscription.create({
      service_instance_id: serviceInstance.id,
    });
    capability1 = await TestHelper.serviceCapability.create({
      name: 'Subscription Capability 1',
      description: 'Description 1',
      service_definition_id: serviceDefinition.id,
    });
    capability2 = await TestHelper.serviceCapability.create({
      name: 'Subscription Capability 2',
      description: 'Description 2',
      service_definition_id: serviceDefinition.id,
    });
    capability3 = await TestHelper.serviceCapability.create({
      name: 'Subscription Capability 3',
      description: 'Description 3',
      service_definition_id: serviceDefinition.id,
    });
  });
  afterEach(async () => {
    await TestHelper.subscriptionCapability.delete({
      subscription_id: subscription.id,
    });
  });

  afterAll(async () => {
    await TestHelper.subscriptionCapability.delete({
      subscription_id: subscription.id,
    });

    await TestHelper.serviceCapability.delete({ id: capability1.id });
    await TestHelper.serviceCapability.delete({ id: capability2.id });
    await TestHelper.serviceCapability.delete({ id: capability3.id });
    await TestHelper.subscription.delete({ id: subscription.id });
    await TestHelper.serviceInstance.delete({ id: serviceInstance.id });
    await TestHelper.serviceDefinition.delete({ id: serviceDefinition.id });
  });
  describe('loadSubscriptionCapabilitiesBy', () => {
    it('should load by id', async () => {
      const [createdCapability] = await addCapabilitiesToSubscription(
        subscription.id,
        [capability1.id]
      );

      if (!createdCapability) {
        throw new Error('Capability should be created');
      }

      const capabilities: SubscriptionCapability[] =
        await loadSubscriptionCapabilitiesBy({
          id: createdCapability.id,
        });
      expect(capabilities).toHaveLength(1);
      expect(capabilities[0]).toMatchObject(
        expect.objectContaining({
          id: createdCapability.id,
          service_capability_id: capability1.id,
          subscription_id: subscription.id,
        })
      );
    });
    it('should load by subscription_id', async () => {
      await addCapabilitiesToSubscription(subscription.id, [
        capability1.id,
        capability2.id,
      ]);

      const capabilities: SubscriptionCapability[] =
        await loadSubscriptionCapabilitiesBy({
          subscription_id: subscription.id,
        });
      expect(capabilities).toHaveLength(2);
      expect(
        capabilities.map((capability) => capability.service_capability_id)
      ).toEqual(expect.arrayContaining([capability1.id, capability2.id]));
    });
  });
  describe('addCapabilitiesToSubscription', () => {
    it('should return an empty array when capability list is empty', async () => {
      const capabilities = await addCapabilitiesToSubscription(
        subscription.id,
        []
      );
      expect(capabilities).toEqual([]);
    });
    it('should insert capabilities for a subscription', async () => {
      const capabilities = await addCapabilitiesToSubscription(
        subscription.id,
        [capability1.id, capability2.id]
      );
      expect(capabilities).toHaveLength(2);
      expect(
        capabilities.map((capability) => capability.service_capability_id)
      ).toEqual(expect.arrayContaining([capability1.id, capability2.id]));
      const persistedCapabilities = (await loadSubscriptionCapabilitiesBy({
        subscription_id: subscription.id,
      })) as SubscriptionCapability[];

      expect(persistedCapabilities).toHaveLength(2);
    });
  });
  describe('replaceCapabilitiesForSubscription', () => {
    it('should replace existing capabilities for a subscription', async () => {
      await addCapabilitiesToSubscription(subscription.id, [
        capability1.id,
        capability2.id,
      ]);
      const replacedCapabilities = await replaceCapabilitiesForSubscription(
        subscription.id,
        [capability3.id]
      );
      expect(replacedCapabilities).toHaveLength(1);
      expect(replacedCapabilities[0]).toMatchObject(
        expect.objectContaining({
          service_capability_id: capability3.id,
          subscription_id: subscription.id,
        })
      );
      const persistedCapabilities = (await loadSubscriptionCapabilitiesBy({
        subscription_id: subscription.id,
      })) as SubscriptionCapability[];

      expect(persistedCapabilities).toHaveLength(1);
      expect(persistedCapabilities[0]?.service_capability_id).toBe(
        capability3.id
      );
    });
  });
  describe('loadSubscriptionCapabilities', () => {
    it('should return subscription capabilities with joined service_capability field', async () => {
      await addCapabilitiesToSubscription(subscription.id, [capability1.id]);
      const capabilities = (await loadSubscriptionCapabilities(
        subscription.id
      )) as SubscriptionCapabilityWithJoin[];
      expect(capabilities).toHaveLength(1);
      expect(capabilities[0]).toMatchObject(
        expect.objectContaining({
          service_capability_id: capability1.id,
          subscription_id: subscription.id,
          service_capability: {
            id: capability1.id,
            name: capability1.name,
            description: capability1.description,
            __typename: 'Service_Capability',
          },
        })
      );
    });
  });
});
