import { toGlobalId } from 'graphql-relay/node/node';
import { afterAll, describe, expect, it } from 'vitest';
import {
  contextAdminUser,
  SERVICE_MALWARE_ID,
} from '../../../tests/tests.const';
import { ServiceId } from '../../model/kanel/public/Service';
import { deleteSubscriptionUnsecure } from './subscription.helper';
import subscriptionResolver from './subscription.resolver';

describe('Subscription mutation resolver', () => {
  describe('addSubscription mutation - should create subscription', () => {
    it('should return the service subscribed', async () => {
      // @ts-ignore
      const response = await subscriptionResolver.Mutation.addSubscription(
        undefined,
        {
          service_id: toGlobalId('Service', SERVICE_MALWARE_ID),
        },
        contextAdminUser
      );
      expect(response).toBeTruthy();
      expect(response.name).toEqual('Malware analysis');
    });
    afterAll(async () => {
      await deleteSubscriptionUnsecure({
        service_id: SERVICE_MALWARE_ID as ServiceId,
      });
    });
  });
});
