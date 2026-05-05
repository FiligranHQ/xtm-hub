import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestHelper } from '../../../tests/helper/test.helper';
import {
  contextSimpleUserFiligran2,
  GRAPHQL_RESOLVE_INFO,
  SERVICES,
  TEST_ORGANIZATIONS,
} from '../../../tests/tests.const';
import {
  CreateSubscriptionInput,
  SubscriptionCapabilityResolvers,
  SubscriptionModel,
  SubscriptionModelResolvers,
} from '../../__generated__/resolvers-types';
import ServiceInstance, {
  ServiceInstanceId,
} from '../../model/kanel/public/ServiceInstance';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { ErrorCode, UnknownErrorCode } from '../../utils/error/error.code';
import { ErrorType } from '../../utils/error/error.type';
import { loadSubscriptionCapabilities } from '../security-management/service-capability/subscription-capability.domain';
import * as serviceInstanceDomain from '../service/instance/service-instance.domain';
import * as subscriptionDomain from './subscription.domain';
import * as subscriptionHelper from './subscription.helper';
import subscriptionResolver from './subscription.resolver';

describe('subscription mutation resolver', () => {
  describe('createSubscription mutation - should create subscription', () => {
    let serviceInstanceId: ServiceInstanceId;

    beforeEach(async () => {
      serviceInstanceId = uuidv4() as ServiceInstanceId;
      await TestHelper.serviceInstance.create({
        id: serviceInstanceId,
        name: `test-subscription-${serviceInstanceId}`,
      });
    });

    afterEach(async () => {
      vi.useRealTimers();
      await TestHelper.subscription.delete({});
      await TestHelper.serviceInstance.delete({ id: serviceInstanceId });
    });

    it.each`
      description                                       | organizationId
      ${'use organization_id from input when provided'} | ${TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID}
      ${'fallback to context selected organization id'} | ${undefined}
    `(
      'should $description',
      async ({ organizationId }: { organizationId?: string }) => {
        // Given
        const startDate = new Date('2026-01-10T10:00:00.000Z');
        const endDate = new Date('2026-12-10T10:00:00.000Z');
        const input = {
          service_instance_id: serviceInstanceId,
          organization_id: organizationId,
          capability_ids: [
            SERVICES.INSTANCES.INTEGRATIONS.CAPABILITIES.UPLOAD.ID,
            SERVICES.INSTANCES.INTEGRATIONS.CAPABILITIES.DELETE.ID,
          ],
          start_date: startDate,
          end_date: endDate,
        } as unknown as CreateSubscriptionInput;

        // When
        const result = await subscriptionResolver.Mutation!.createSubscription!(
          {},
          { input },
          contextSimpleUserFiligran2,
          GRAPHQL_RESOLVE_INFO
        );

        // Then
        const expectedOrganizationId =
          organizationId ??
          contextSimpleUserFiligran2.user.selected_organization_id;
        expect(result).toMatchObject({
          organization_id: expectedOrganizationId,
          service_instance_id: serviceInstanceId,
          start_date: startDate,
          end_date: endDate,
        });

        const createdSubscription = await TestHelper.subscription.load({
          id: result?.id as SubscriptionId,
        });
        expect(createdSubscription).toMatchObject({
          id: result?.id,
          organization_id: expectedOrganizationId,
          service_instance_id: serviceInstanceId,
          start_date: startDate,
          end_date: endDate,
        });

        const subscriptionCapabilities = await loadSubscriptionCapabilities(
          result?.id as SubscriptionId
        );
        expect(subscriptionCapabilities).toHaveLength(2);
        expect(subscriptionCapabilities).toMatchObject([
          {
            subscription_id: result?.id,
            service_capability_id:
              SERVICES.INSTANCES.INTEGRATIONS.CAPABILITIES.UPLOAD.ID,
          },
          {
            subscription_id: result?.id,
            service_capability_id:
              SERVICES.INSTANCES.INTEGRATIONS.CAPABILITIES.DELETE.ID,
          },
        ]);
      }
    );

    it('should reject when organization is already subscribed to service instance', async () => {
      // Given
      const startDate = new Date('2026-01-10T10:00:00.000Z');
      const endDate = new Date('2026-12-10T10:00:00.000Z');
      await TestHelper.subscription.create({
        organization_id:
          contextSimpleUserFiligran2.user.selected_organization_id,
        service_instance_id: serviceInstanceId,
        start_date: startDate,
        end_date: endDate,
      });

      const call = subscriptionResolver.Mutation!.createSubscription!(
        {},
        {
          input: {
            service_instance_id: serviceInstanceId,
            organization_id:
              contextSimpleUserFiligran2.user.selected_organization_id,
            capability_ids: [],
            start_date: startDate,
            end_date: endDate,
          },
        },
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      // When / Then
      await expect(call).rejects.toMatchObject({
        name: ErrorType.ForbiddenAccess,
        message: ErrorCode.AlreadySubscribed,
      });

      const subscriptions = await TestHelper.subscription.loadAll({
        organization_id:
          contextSimpleUserFiligran2.user.selected_organization_id,
        service_instance_id: serviceInstanceId,
      });
      expect(subscriptions).toHaveLength(1);
      expect(subscriptions[0]).toMatchObject({
        organization_id:
          contextSimpleUserFiligran2.user.selected_organization_id,
        service_instance_id: serviceInstanceId,
      });
    });

    it('should map unexpected input errors to SERVICE_SUBSCRIPTION_ERROR', async () => {
      // Given
      const call = subscriptionResolver.Mutation!.createSubscription!(
        {},
        {
          input: {
            service_instance_id: serviceInstanceId,
            organization_id:
              contextSimpleUserFiligran2.user.selected_organization_id,
            start_date: new Date('2026-01-10T10:00:00.000Z'),
            end_date: null,
          } as CreateSubscriptionInput,
        },
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      // When / Then
      await expect(call).rejects.toMatchObject({
        name: ErrorType.UnknownError,
        message: UnknownErrorCode.ServiceSubscriptionError,
      });

      const subscriptions = await TestHelper.subscription.loadAll({
        service_instance_id: serviceInstanceId,
      });
      expect(subscriptions).toHaveLength(0);
    });
  });
});

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
});
