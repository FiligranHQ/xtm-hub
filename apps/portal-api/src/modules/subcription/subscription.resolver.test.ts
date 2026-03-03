import { toGlobalId } from 'graphql-relay/node/node.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  contextBypassUser,
  SERVICES,
  TEST_ORGANIZATIONS,
} from '../../../tests/tests.const';
import { telemetryApp } from '../telemetry/telemetry.app';
import {
  TELEMETRY_SOURCE,
  TelemetryEventService,
} from '../telemetry/telemetry.const';
import { TelemetryEventType } from '../telemetry/telemetry.types';
import { deleteSubscription } from './subscription.helper';
import subscriptionResolver from './subscription.resolver';

describe('Subscription mutation resolver', () => {
  describe('addSubscription mutation - should create subscription', () => {
    it('should return the service subscribed', async () => {
      // @ts-ignore
      const response = await subscriptionResolver.Mutation.addSubscription(
        undefined,
        {
          service_instance_id: toGlobalId(
            'ServiceInstance',
            SERVICES.INSTANCES.OPENAEV_SCENARIOS.ID
          ),
        },
        contextBypassUser
      );
      expect(response).toBeTruthy();
      expect(response?.name).toEqual(SERVICES.INSTANCES.OPENAEV_SCENARIOS.NAME);
    });
    it('should send a telemetry event for subscription integrations service', async () => {
      vi.useFakeTimers();
      const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
      vi.setSystemTime(date);
      const telemetrySpy = vi
        .spyOn(telemetryApp, 'sendTelemetryEvent')
        .mockResolvedValue();

      // @ts-ignore
      await subscriptionResolver.Mutation.addSubscription(
        undefined,
        {
          service_instance_id: toGlobalId(
            'ServiceInstance',
            SERVICES.INSTANCES.INTEGRATIONS.ID
          ),
        },
        contextBypassUser
      );
      expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
        '@timestamp': '2025-02-03T13:12:15.000Z',
        event_type: TelemetryEventType.SUBSCRIBE,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        organization_name: 'Filigran',
        organization_type: 'Professional',
        source: TELEMETRY_SOURCE,
        user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        service: TelemetryEventService.INTEGRATIONS_LIBRARY,
      });
    });
    it('should not send a telemetry event for vault service', async () => {
      const telemetrySpy = vi.spyOn(telemetryApp, 'sendTelemetryEvent');

      // @ts-ignore
      await subscriptionResolver.Mutation.addSubscription(
        undefined,
        {
          service_instance_id: toGlobalId(
            'ServiceInstance',
            SERVICES.INSTANCES.VAULT.ID
          ),
        },
        contextBypassUser
      );
      expect(telemetrySpy).not.toHaveBeenCalled();
    });

    afterEach(async () => {
      vi.useRealTimers();
      await deleteSubscription({
        service_instance_id: SERVICES.INSTANCES.VAULT.ID,
      });
      await deleteSubscription({
        service_instance_id: SERVICES.INSTANCES.OPENAEV_SCENARIOS.ID,
      });
      await deleteSubscription({
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
      });
    });
  });
});
