import 'knex';
import gql from 'graphql-tag';
import { print } from 'graphql/language';
import { getAdminAgent } from '../../../tests/test.util';
import { describe, expect, it } from 'vitest';
import { fromGlobalId, toGlobalId } from 'graphql-relay/node/node.js';
import { dbUnsecure } from '../../../knexfile';
import UserService from '../../model/kanel/public/UserService';
import { ServiceId } from '../../model/kanel/public/Service';
import { loadUnsecureSubscriptionBy } from './subscription.domain';
import { deleteSubscriptionUnsecure } from './subscription.helper';

const addSubscriptionTestQuery = (serviceId) => ({
  query: print(gql`
    mutation addSubscriptionMutation($service_id: String) {
      addSubscription(service_id: $service_id) {
        id
      }
    }
  `),
  variables: {
    service_id: toGlobalId('Service', serviceId),
  },
});

describe('UserAdmin can subscribe to a service ', async () => {
  const userAdmin = await getAdminAgent();

  it.each`
    serviceId                                 | subscriptionType          | numberOfUserServiceAccess
    ${'c6343882-f609-4a3f-abe0-a34f8cb11302'} | ${'Subscriptable_direct'} | ${'2'}
  `(
    'Should add service $subscriptionStatus for service $subscriptionType ',
    async ({ serviceId, numberOfUserServiceAccess }) => {
      const response = await userAdmin
        .post('/graphql-api')
        .send(addSubscriptionTestQuery(serviceId));
      const transform = JSON.parse(response.text);

      expect(response.status).toBe(200);

      const [subscription] = await loadUnsecureSubscriptionBy({
        service_id: fromGlobalId(transform.data.addSubscription.id)
          .id as ServiceId,
      });
      // It should also add access for users in the organization
      const userService = await dbUnsecure<UserService>('User_Service')
        .where('User_Service.subscription_id', '=', subscription.id)

        .countDistinct('id as totalCount')
        .first();

      expect(userService.totalCount).toEqual(numberOfUserServiceAccess);

      // Clean everything
      deleteSubscriptionUnsecure(
        fromGlobalId(transform.data.addSubscription.id).id
      );
    }
  );
});
