import 'knex';
import gql from 'graphql-tag';
import { print } from 'graphql/language';
import { getAdminAgent } from '../../../tests/test.util';
import { describe, expect, it } from 'vitest';
import { fromGlobalId, toGlobalId } from 'graphql-relay/node/node.js';
import { dbUnsecure } from '../../../knexfile';
import UserService from '../../model/kanel/public/UserService';

const addSubscriptionTestQuery = (serviceId) => ({
  query: print(gql`
    mutation addSubscriptionMutation(
      $service_id: String
      $organization_id: ID
      $user_id: ID
    ) {
      addSubscription(
        service_id: $service_id
        organization_id: $organization_id
        user_id: $user_id
      ) {
        id
        start_date
        end_date
        status
      }
    }
  `),
  variables: {
    service_id: toGlobalId('Service', serviceId),
    organization_id: toGlobalId(
      'Organization',
      'ba091095-418f-4b4f-b150-6c9295e232c4'
    ),
    user_id: toGlobalId('User', 'ba091095-418f-4b4f-b150-6c9295e232c3'),
  },
});

describe('UserAdmin can subscribe to a service', async () => {
  const userAdmin = await getAdminAgent();

  it.each`
    serviceId                                 | subscriptionStatus | subscriptionType              | numberOfUserServiceAccess
    ${'c6343882-f609-4a3f-abe0-a34f8cb11302'} | ${'ACCEPTED'}      | ${'Subscriptable_direct'}     | ${'2'}
    ${'234a5d21-8a1f-4d3f-8f57-7fd21c321bd4'} | ${'REQUESTED'}     | ${'Subscriptable_backoffice'} | ${'1'}
  `(
    'Should add service $subscriptionStatus for service $subscriptionType',
    async ({ serviceId, subscriptionStatus, numberOfUserServiceAccess }) => {
      const response = await userAdmin
        .post('/graphql-api')
        .send(addSubscriptionTestQuery(serviceId));
      const transform = JSON.parse(response.text);
      expect(response.status).toBe(200);
      expect(transform.data.addSubscription.status).toBe(subscriptionStatus);
      // It should also add access for users in the organization
      const userService = await dbUnsecure<UserService>('User_Service')
        .where(
          'User_Service.subscription_id',
          '=',
          fromGlobalId(transform.data.addSubscription.id).id
        )

        .countDistinct('id as totalCount')
        .first();

      // Only access for the subscriber for service SUBSCRIPTABLE_BACK_OFFICE and access for all users fort SUBSCRIPTABLE_DIRECT
      expect(userService.totalCount).toEqual(numberOfUserServiceAccess);

      // Clean everything
      await dbUnsecure<UserService>('Subscription').delete('*').returning('*');
    }
  );
});
