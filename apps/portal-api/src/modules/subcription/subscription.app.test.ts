import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import {
  FILIGRAN_ORGA_ID,
  SERVICE_CSV_FEEDS_ID,
} from '../../../tests/tests.const';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { subscriptionApp } from './subscription.app';
import { createSubscription } from './subscription.domain';

describe('Subscription app', () => {
  describe(`${subscriptionApp.deleteSubscription.name}`, () => {
    it('should delete the subscription', async () => {
      const id = uuidv4() as SubscriptionId;
      const subscription = await createSubscription({
        id,
        organization_id: FILIGRAN_ORGA_ID,
        service_instance_id: SERVICE_CSV_FEEDS_ID,
        start_date: new Date(),
        end_date: null,
        status: 'ACCEPTED',
        joining: 'AUTO_JOIN',
        billing: 0,
        justification: null,
      });

      expect(subscription).toBeDefined();

      const deletedSubscription = await subscriptionApp.deleteSubscription(id);
      expect(deletedSubscription).toStrictEqual(subscription);
    });
  });
});
