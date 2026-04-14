import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TestHelper } from '../../../tests/helper/test.helper';
import {
  contextSimpleUserFiligran2,
  contextSimpleUserSecondOrga,
  INFO,
  SERVICES,
  TEST_ORGANIZATIONS,
} from '../../../tests/tests.const';
import { requestContext } from '../../context/request.context';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import {
  ForbiddenErrorCode,
  NotFoundErrorCode,
} from '../../utils/error/error.code';
import { ErrorType } from '../../utils/error/error.type';
import * as serviceInstanceDomain from '../service/instance/service-instance.domain';
import { telemetryApp } from '../telemetry/telemetry.app';
import {
  TelemetryEventService,
  TelemetrySource,
} from '../telemetry/telemetry.const';
import { TelemetryEventType } from '../telemetry/telemetry.types';
import { subscriptionApp } from './subscription.app';
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
          service_instance_id: SERVICES.INSTANCES.VAULT.ID,
        },
        contextSimpleUserSecondOrga
      );
      expect(telemetrySpy).not.toHaveBeenCalled();
    });
  });
});

describe('Subscription resolver — unit tests', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('SubscriptionModel field resolvers', () => {
    it('subscription_capability should call getSubscriptionCapability with subscription id', async () => {
      const id = uuidv4();
      const expected = [] as never;
      vi.spyOn(
        subscriptionDomain,
        'getSubscriptionCapability'
      ).mockResolvedValue(expected);

      const result = await (
        subscriptionResolver.SubscriptionModel as never
      ).subscription_capability({ id }, {}, contextSimpleUserFiligran2, INFO);

      expect(subscriptionDomain.getSubscriptionCapability).toHaveBeenCalledWith(
        id
      );
      expect(result).toEqual(expected);
    });

    it('service_instance should call loadServiceInstanceBy with service_instance_id', async () => {
      const serviceInstanceId = SERVICES.INSTANCES.VAULT.ID;
      const expected = { id: serviceInstanceId } as never;
      vi.spyOn(
        serviceInstanceDomain,
        'loadServiceInstanceBy'
      ).mockResolvedValue(expected);

      const result = await (
        subscriptionResolver.SubscriptionModel as never
      ).service_instance(
        { service_instance_id: serviceInstanceId },
        {},
        contextSimpleUserFiligran2,
        INFO
      );

      expect(serviceInstanceDomain.loadServiceInstanceBy).toHaveBeenCalledWith(
        'id',
        serviceInstanceId
      );
      expect(result).toEqual(expected);
    });

    it('user_service should call getUserService with subscription id', async () => {
      const id = uuidv4();
      const expected = [] as never;
      vi.spyOn(subscriptionDomain, 'getUserService').mockResolvedValue(
        expected
      );

      const result = await (
        subscriptionResolver.SubscriptionModel as never
      ).user_service({ id }, {}, contextSimpleUserFiligran2, INFO);

      expect(subscriptionDomain.getUserService).toHaveBeenCalledWith(id);
      expect(result).toEqual(expected);
    });
  });

  describe('SubscriptionCapability field resolvers', () => {
    it('service_capability should call getServiceCapability with subscription capability id', async () => {
      const id = uuidv4();
      const expected = { id: uuidv4() } as never;
      vi.spyOn(subscriptionDomain, 'getServiceCapability').mockResolvedValue(
        expected
      );

      const result = await (
        subscriptionResolver.SubscriptionCapability as never
      ).service_capability({ id }, {}, contextSimpleUserFiligran2, INFO);

      expect(subscriptionDomain.getServiceCapability).toHaveBeenCalledWith(id);
      expect(result).toEqual(expected);
    });
  });

  describe('Mutation.addSubscriptionInService', () => {
    it('should extract capability ids and subscribe organization, then load service with subscriptions', async () => {
      const serviceInstanceId = SERVICES.INSTANCES.VAULT.ID;
      const expected = { id: serviceInstanceId } as never;
      vi.spyOn(
        subscriptionApp,
        'subscribeOrganizationToService'
      ).mockResolvedValue(undefined);
      vi.spyOn(
        serviceInstanceDomain,
        'loadServiceWithSubscriptions'
      ).mockResolvedValue(expected);

      const result = await subscriptionResolver.Mutation!
        .addSubscriptionInService!(
        {},
        {
          service_instance_id: serviceInstanceId,
          organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
          capability_ids: [],
          start_date: null,
          end_date: null,
        },
        contextSimpleUserFiligran2,
        INFO
      );

      expect(
        subscriptionApp.subscribeOrganizationToService
      ).toHaveBeenCalledWith(
        expect.objectContaining({ serviceInstanceId, capabilityIds: [] })
      );
      expect(result).toEqual(expected);
    });

    it('should use context organization when organization_id is null', async () => {
      const serviceInstanceId = SERVICES.INSTANCES.VAULT.ID;
      vi.spyOn(
        subscriptionApp,
        'subscribeOrganizationToService'
      ).mockResolvedValue(undefined);
      vi.spyOn(
        serviceInstanceDomain,
        'loadServiceWithSubscriptions'
      ).mockResolvedValue({} as never);

      await subscriptionResolver.Mutation!.addSubscriptionInService!(
        {},
        {
          service_instance_id: serviceInstanceId,
          organization_id: null,
          capability_ids: [],
          start_date: null,
          end_date: null,
        },
        contextSimpleUserFiligran2,
        INFO
      );

      expect(
        subscriptionApp.subscribeOrganizationToService
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId:
            contextSimpleUserFiligran2.user.selected_organization_id,
        })
      );
    });

    it('should map to ForbiddenAccess for AlreadySubscribed error', async () => {
      vi.spyOn(
        subscriptionApp,
        'subscribeOrganizationToService'
      ).mockRejectedValue(new Error(ForbiddenErrorCode.AlreadySubscribed));

      const call = subscriptionResolver.Mutation!.addSubscriptionInService!(
        {},
        {
          service_instance_id: SERVICES.INSTANCES.VAULT.ID,
          organization_id: null,
          capability_ids: [],
          start_date: null,
          end_date: null,
        },
        contextSimpleUserFiligran2,
        INFO
      );

      await expect(call).rejects.toMatchObject({
        name: ErrorType.ForbiddenAccess,
      });
    });
  });

  describe('Mutation.deleteSubscription', () => {
    it('should decode subscription_id and call deleteSubscription app', async () => {
      const rawId = uuidv4() as SubscriptionId;
      const globalId = toGlobalId('Subscription', rawId);
      const serviceInstanceId = SERVICES.INSTANCES.VAULT.ID;
      const expected = { id: serviceInstanceId } as never;
      vi.spyOn(subscriptionApp, 'deleteSubscription').mockResolvedValue({
        service_instance_id: serviceInstanceId,
      } as never);
      vi.spyOn(
        serviceInstanceDomain,
        'loadServiceWithSubscriptions'
      ).mockResolvedValue(expected);

      const result = await subscriptionResolver.Mutation!.deleteSubscription!(
        {},
        { subscription_id: globalId },
        contextSimpleUserFiligran2,
        INFO
      );

      expect(subscriptionApp.deleteSubscription).toHaveBeenCalledWith(rawId);
      expect(result).toEqual(expected);
    });

    it('should map to NotFound for SubscriptionNotFound error', async () => {
      vi.spyOn(subscriptionApp, 'deleteSubscription').mockRejectedValue(
        new Error(NotFoundErrorCode.SubscriptionNotFound)
      );

      const call = subscriptionResolver.Mutation!.deleteSubscription!(
        {},
        { subscription_id: toGlobalId('Subscription', uuidv4()) },
        contextSimpleUserFiligran2,
        INFO
      );

      await expect(call).rejects.toMatchObject({ name: ErrorType.NotFound });
    });
  });

  describe('Query.subscriptionById', () => {
    it('should decode subscription_id and return first subscription', async () => {
      const rawId = uuidv4() as SubscriptionId;
      const globalId = toGlobalId('Subscription', rawId);
      const expected = { id: rawId } as never;
      vi.spyOn(
        subscriptionHelper,
        'loadSubscriptionWithOrganizationAndCapabilitiesBy'
      ).mockResolvedValue([expected]);

      const result = await subscriptionResolver.Query!.subscriptionById!(
        {},
        { subscription_id: globalId },
        contextSimpleUserFiligran2,
        INFO
      );

      expect(
        subscriptionHelper.loadSubscriptionWithOrganizationAndCapabilitiesBy
      ).toHaveBeenCalledWith(
        expect.objectContaining({ 'Subscription.id': rawId })
      );
      expect(result).toEqual(expected);
    });
  });
});
