import { toGlobalId } from 'graphql-relay/node/node';
import { afterAll, describe, expect, it } from 'vitest';
import { contextAdminUser } from '../../../tests/tests.const';
import { deleteSubscriptionUnsecure } from './subscription.helper';
import subscriptionResolver from './subscription.resolver';

describe('Subscription mutation resolver', () => {
  describe('addSubscription mutation - should create subscription', () => {
    it('should return the service subscribed', async () => {
      // @ts-ignore
      const response = await subscriptionResolver.Mutation.addSubscription(
        undefined,
        {
          service_id: toGlobalId(
            'Service',
            '234a5d21-8a1f-4d3f-8f57-7fd21c321bd4'
          ),
        },
        contextAdminUser
      );
      expect(response).toBeTruthy();
      expect(response.name).toEqual('Malware analysis');
    });
    afterAll(async () => {
      await deleteSubscriptionUnsecure('234a5d21-8a1f-4d3f-8f57-7fd21c321bd4');
    });
  });
});
