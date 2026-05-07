import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  GRAPHQL_RESOLVE_INFO,
  SERVICES,
  TEST_ORGANIZATIONS,
} from '../../../tests/tests.const';
import {
  SubscriptionCapabilityResolvers,
  SubscriptionModel,
  SubscriptionModelResolvers,
} from '../../__generated__/resolvers-types';
import ServiceInstance from '../../model/kanel/public/ServiceInstance';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import * as serviceInstanceDomain from '../service/instance/service-instance.domain';
import { subscriptionApp } from './subscription.app';
import * as subscriptionDomain from './subscription.domain';
import * as subscriptionHelper from './subscription.helper';
import subscriptionResolver from './subscription.resolver';

describe('subscription resolver — unit tests', () => {
  describe('subscriptionModel field resolvers', () => {
    it('subscription_capability should call getSubscriptionCapability with subscription id', async () => {
      const id = uuidv4();
      const expected = [] as unknown as Awaited<
        ReturnType<typeof subscriptionDomain.getSubscriptionCapability>
      >;
      vi.spyOn(
        subscriptionDomain,
        'getSubscriptionCapability'
      ).mockResolvedValue(expected);

      const result = await (
        subscriptionResolver.SubscriptionModel as unknown as SubscriptionModelResolvers
      ).subscription_capability!(
        { id } as SubscriptionModel,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      expect(subscriptionDomain.getSubscriptionCapability).toHaveBeenCalledWith(
        id
      );
      expect(result).toEqual(expected);
    });

    it('service_instance should call loadServiceInstanceBy with service_instance_id', async () => {
      const serviceInstanceId = SERVICES.INSTANCES.EPIC.ID;
      const expected = { id: serviceInstanceId } as unknown as
        | ServiceInstance
        | undefined;
      vi.spyOn(
        serviceInstanceDomain,
        'loadServiceInstanceBy'
      ).mockResolvedValue(expected);

      const result = await (
        subscriptionResolver.SubscriptionModel as unknown as SubscriptionModelResolvers
      ).service_instance!(
        {
          id: uuidv4() as SubscriptionId,
          service_instance_id: serviceInstanceId,
        } as unknown as SubscriptionModel,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      expect(serviceInstanceDomain.loadServiceInstanceBy).toHaveBeenCalledWith({
        id: serviceInstanceId,
      });
      expect(result).toEqual(expected);
    });

    it('user_service should call getUserService with subscription id', async () => {
      const id = uuidv4();
      const expected = [] as unknown as Awaited<
        ReturnType<typeof subscriptionDomain.getUserService>
      >;
      vi.spyOn(subscriptionDomain, 'getUserService').mockResolvedValue(
        expected
      );

      const result = await (
        subscriptionResolver.SubscriptionModel as unknown as SubscriptionModelResolvers
      ).user_service!(
        { id } as SubscriptionModel,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      expect(subscriptionDomain.getUserService).toHaveBeenCalledWith(id);
      expect(result).toEqual(expected);
    });
  });

  describe('subscriptionCapability field resolvers', () => {
    it('service_capability should call getServiceCapability with subscription capability id', async () => {
      const id = uuidv4();
      const expected = { id: uuidv4() } as unknown as Awaited<
        ReturnType<typeof subscriptionDomain.getServiceCapability>
      >;
      vi.spyOn(subscriptionDomain, 'getServiceCapability').mockResolvedValue(
        expected
      );

      const result = await (
        subscriptionResolver.SubscriptionCapability as unknown as SubscriptionCapabilityResolvers
      ).service_capability!(
        { id },
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      expect(subscriptionDomain.getServiceCapability).toHaveBeenCalledWith(id);
      expect(result).toEqual(expected);
    });
  });

  describe('query.subscriptionById', () => {
    it('should decode subscription_id and return first subscription', async () => {
      const subscriptionId = uuidv4() as SubscriptionId;
      const expected = { id: subscriptionId } as unknown as Awaited<
        ReturnType<
          typeof subscriptionHelper.loadSubscriptionWithOrganizationAndCapabilitiesBy
        >
      >[number];
      vi.spyOn(
        subscriptionHelper,
        'loadSubscriptionWithOrganizationAndCapabilitiesBy'
      ).mockResolvedValue([expected]);

      const result = await subscriptionResolver.Query!.subscriptionById!(
        {},
        { subscription_id: subscriptionId },
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      expect(
        subscriptionHelper.loadSubscriptionWithOrganizationAndCapabilitiesBy
      ).toHaveBeenCalledWith(
        expect.objectContaining({ 'Subscription.id': subscriptionId })
      );
      expect(result).toEqual(expected);
    });
  });

  describe('mutation.createSubscription', () => {
    const serviceInstanceId = SERVICES.INSTANCES.EPIC.ID;
    const organizationId = TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID;
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2026-01-01');
    const capabilityIds = [
      SERVICES.INSTANCES.INTEGRATIONS.CAPABILITIES.UPLOAD.ID,
    ];

    it('should call subscribeOrganizationToService with input organization_id when provided', async () => {
      const expected = {
        id: uuidv4() as SubscriptionId,
      } as unknown as SubscriptionModel;
      vi.spyOn(
        subscriptionApp,
        'subscribeOrganizationToService'
      ).mockResolvedValue(expected as never);

      const result = await subscriptionResolver.Mutation!.createSubscription!(
        {},
        {
          input: {
            organization_id: organizationId,
            service_instance_id: serviceInstanceId,
            start_date: startDate,
            end_date: endDate,
            capability_ids: capabilityIds,
          },
        },
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      expect(
        subscriptionApp.subscribeOrganizationToService
      ).toHaveBeenCalledWith({
        organizationId,
        serviceInstanceId,
        startDate,
        endDate,
        capabilityIds,
      });
      expect(result).toEqual(expected);
    });

    it('should fallback to context selected_organization_id when organization_id equals context organization', async () => {
      const contextOrgId =
        contextSimpleUserFiligran2.user.selected_organization_id;
      const expected = {
        id: uuidv4() as SubscriptionId,
      } as unknown as SubscriptionModel;
      vi.spyOn(
        subscriptionApp,
        'subscribeOrganizationToService'
      ).mockResolvedValue(expected as never);

      await subscriptionResolver.Mutation!.createSubscription!(
        {},
        {
          input: {
            organization_id: contextOrgId,
            service_instance_id: serviceInstanceId,
            start_date: startDate,
            end_date: endDate,
            capability_ids: capabilityIds,
          },
        },
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      expect(
        subscriptionApp.subscribeOrganizationToService
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: contextOrgId,
        })
      );
    });

    it('should throw a GraphQL error when subscribeOrganizationToService throws', async () => {
      vi.spyOn(
        subscriptionApp,
        'subscribeOrganizationToService'
      ).mockRejectedValue(new Error('AlreadySubscribed'));

      await expect(
        subscriptionResolver.Mutation!.createSubscription!(
          {},
          {
            input: {
              organization_id: organizationId,
              service_instance_id: serviceInstanceId,
              start_date: startDate,
              end_date: endDate,
              capability_ids: capabilityIds,
            },
          },
          contextSimpleUserFiligran2,
          GRAPHQL_RESOLVE_INFO
        )
      ).rejects.toThrow();
    });
  });
});
