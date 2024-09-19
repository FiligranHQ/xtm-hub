import 'knex';
import gql from 'graphql-tag';
import { print } from 'graphql/language';
import { getAdminAgent } from '../../../tests/test.util';
import { describe, expect, it } from 'vitest';
import { fromGlobalId, toGlobalId } from 'graphql-relay/node/node.js';
import { dbUnsecure } from '../../../knexfile';
import UserService from '../../model/kanel/public/UserService';
import { ServiceId } from '../../model/kanel/public/Service';
import { loadUnsecureSubscriptionBy } from './subscription.helper';
import Subscription from '../../model/kanel/public/Subscription';

const addSubscriptionTestQuery = {
  query: print(gql`
    mutation addSubscriptionMutation($service_id: String) {
      addSubscription(service_id: $service_id) {
        id
      }
    }
  `),
  variables: {
    service_id: toGlobalId('Service', 'c6343882-f609-4a3f-abe0-a34f8cb11302'),
  },
};
const getSubscriptionsByServiceIdTestQuery = {
  query: print(gql`
    query subscriptionsByServiceIdQuery($service_id: ID) {
      subscriptionsByServiceId(service_id: $service_id) {
        status
        justification
        id
        user_service {
          id
          user {
            last_name
            first_name
            email
            organization {
              name
            }
          }
        }
      }
    }
  `),
  variables: {
    service_id: toGlobalId('Service', '575d37c8-53ed-4c63-ae86-2d8d10f14eaf'),
  },
};

describe('UserAdmin can subscribe to a service', async () => {
  const userAdmin = await getAdminAgent();

  it('Should add subscription for service SUBSCRIPTABLE_DIRECT', async () => {
    const response = await userAdmin
      .post('/graphql-api')
      .send(addSubscriptionTestQuery);
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

    expect(userService.totalCount).toEqual('2');

    // Clean everything
    await dbUnsecure<Subscription>('Subscription')
      .where(
        'Subscription.service_id',
        '=',
        fromGlobalId(transform.data.addSubscription.id).id
      )
      .delete('*')
      .returning('*');
  });
});

describe('Should return Subscriptions by serviceId ', async () => {
  const userAdmin = await getAdminAgent();
  const response = await userAdmin
    .post('/graphql-api')
    .send(getSubscriptionsByServiceIdTestQuery);
  const transform = JSON.parse(response.text);

  it('Should return all subscriptions ', async () => {
    expect(response.status).toBe(200);
    const [request] =
      await dbUnsecure<Subscription>('Subscription').countDistinct(
        'id as count'
      );
    expect(transform.data.subscriptionsByServiceId.length).toEqual(
      parseInt(request.count)
    );
  });
  it('Should return correct user_service object ', async () => {
    const userServiceTest = transform.data.subscriptionsByServiceId.find(
      ({ user_service }) => {
        return user_service?.length > 0;
      }
    );
    expect(userServiceTest.id).not.toBeNull();
    expect(userServiceTest.user_service[0].user.email).not.toBeNull();
    expect(
      userServiceTest.user_service[0].user.organization.name
    ).not.toBeNull();
  });
});

describe('Should not add subscription on Community service', async () => {
  const addCommunitySubscriptiontQuery = {
    query: print(gql`
      mutation addSubscriptionMutation($service_id: String) {
        addSubscription(service_id: $service_id) {
          id
        }
      }
    `),
    variables: {
      service_id: toGlobalId('Service', '575d37c8-53ed-4c63-ae86-2d8d10f14eaf'),
    },
  };
  const userAdmin = await getAdminAgent();
  const response = await userAdmin
    .post('/graphql-api')
    .send(addCommunitySubscriptiontQuery);
  const transform = JSON.parse(response.text);

  it('Should return error on addSubscription', async () => {
    expect(transform.errors[0].message).toBe(
      `You cannot subscribe directly to an community.`
    );
  });
});
