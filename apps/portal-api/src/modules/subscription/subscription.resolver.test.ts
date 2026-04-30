import { v4 as uuidv4 } from 'uuid';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TestHelper } from '../../../tests/helper/test.helper';
import {
  contextSimpleUserFiligran2,
  contextSimpleUserSecondOrga,
  GRAPHQL_RESOLVE_INFO,
  SERVICES,
  TEST_ORGANIZATIONS,
} from '../../../tests/tests.const';
import {
  SubscriptionCapabilityResolvers,
  SubscriptionModel,
  SubscriptionModelResolvers,
} from '../../__generated__/resolvers-types';
import { requestContext } from '../../context/request.context';
import ServiceInstance from '../../model/kanel/public/ServiceInstance';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import * as serviceInstanceDomain from '../service/instance/service-instance.domain';
import { telemetryApp } from '../telemetry/telemetry.app';
import {
  TelemetryEventService,
  TelemetrySource,
} from '../telemetry/telemetry.const';
import { TelemetryEventType } from '../telemetry/telemetry.types';
import * as subscriptionDomain from './subscription.domain';
import * as subscriptionHelper from './subscription.helper';
import subscriptionResolver from './subscription.resolver';

describe('subscription mutation resolver', () => {
  describe('addSubscription mutation - should create subscription', () => {
    afterEach(async () => {
      vi.useRealTimers();
      await TestHelper.subscription.delete({});
    });

    it('should return the service subscribed', async () => {
      // @ts-ignore
      const response = await subscriptionResolver.Mutation.addSubscription(
        undefined,
        {
          service_instance_id: SERVICES.INSTANCES.OPENAEV_SCENARIOS.ID,
        },
        contextSimpleUserSecondOrga
      );
      expect(response).toMatchObject({
        name: SERVICES.INSTANCES.OPENAEV_SCENARIOS.NAME,
      });
    });
    it('should send a telemetry event for subscription integrations service', async () => {
      vi.useFakeTimers();
      const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
      vi.setSystemTime(date);
      const telemetrySpy = vi
        .spyOn(telemetryApp, 'sendTelemetryEvent')
        .mockResolvedValue();

      requestContext.set(contextSimpleUserSecondOrga);
      // @ts-ignore

      await subscriptionResolver.Mutation.addSubscription(
        undefined,
        {
          service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        },
        contextSimpleUserSecondOrga
      );
      expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
        '@timestamp': '2025-02-03T13:12:15.000Z',
        event_type: TelemetryEventType.SUBSCRIBE,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        organization_name: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.NAME,
        organization_type: 'Professional',
        source: TelemetrySource.XTMHUB,
        user_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.ID,
        service: TelemetryEventService.INTEGRATIONS_LIBRARY,
      });
    });
    it('should not send a telemetry event for vault service', async () => {
      const telemetrySpy = vi.spyOn(telemetryApp, 'sendTelemetryEvent');

      // @ts-ignore
      await subscriptionResolver.Mutation.addSubscription(
        undefined,
        {
          service_instance_id: SERVICES.INSTANCES.EPIC.ID,
        },
        contextSimpleUserSecondOrga
      );
      expect(telemetrySpy).not.toHaveBeenCalled();
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

      expect(serviceInstanceDomain.loadServiceInstanceBy).toHaveBeenCalledWith(
        'id',
        serviceInstanceId
      );
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
