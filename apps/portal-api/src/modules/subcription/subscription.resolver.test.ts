import { toGlobalId } from 'graphql-relay/node/node.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  contextAdminUser,
  SERVICE_INTEGRATIONS_ID,
  SERVICE_MALWARE_ID,
} from '../../../tests/tests.const';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { ADMIN_UUID, PLATFORM_ORGANIZATION_UUID } from '../../portal.const';
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
            SERVICE_MALWARE_ID
          ),
        },
        contextAdminUser
      );
      expect(response).toBeTruthy();
      expect(response?.name).toEqual('Malware analysis');
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
            SERVICE_INTEGRATIONS_ID
          ),
        },
        contextAdminUser
      );
      expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
        '@timestamp': '2025-02-03T13:12:15.000Z',
        event_type: TelemetryEventType.SUBSCRIBE,
        organization_id: PLATFORM_ORGANIZATION_UUID,
        organization_name: 'Filigran',
        organization_type: 'Professional',
        source: TELEMETRY_SOURCE,
        user_id: ADMIN_UUID,
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
            SERVICE_MALWARE_ID
          ),
        },
        contextAdminUser
      );
      expect(telemetrySpy).not.toHaveBeenCalled();
    });

    afterEach(async () => {
      vi.useRealTimers();
      await deleteSubscription({
        service_instance_id: SERVICE_MALWARE_ID as ServiceInstanceId,
      });
      await deleteSubscription({
        service_instance_id: SERVICE_INTEGRATIONS_ID,
      });
    });
  });
});
