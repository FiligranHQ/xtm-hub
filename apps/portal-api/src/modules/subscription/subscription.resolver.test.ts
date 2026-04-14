import { afterEach, describe, expect, it, vi } from 'vitest';
import { TestHelper } from '../../../tests/helper/test.helper';
import {
  contextSimpleUserSecondOrga,
  SERVICES,
  TEST_ORGANIZATIONS,
} from '../../../tests/tests.const';
import { requestContext } from '../../context/request.context';
import { telemetryApp } from '../telemetry/telemetry.app';
import {
  TelemetryEventService,
  TelemetrySource,
} from '../telemetry/telemetry.const';
import { TelemetryEventType } from '../telemetry/telemetry.types';
import subscriptionResolver from './subscription.resolver';

describe('Subscription mutation resolver', () => {
  describe('addSubscription mutation - should create subscription', () => {
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

    afterEach(async () => {
      vi.useRealTimers();
      await TestHelper.subscription.delete({});
    });
  });
});
