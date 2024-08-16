import 'knex';
import { describe, expect } from 'vitest';
import { getAdminAgent } from '../../../tests/test.util';
import gql from 'graphql-tag';
import { print } from 'graphql/language';
import { toGlobalId } from 'graphql-relay/node/node';
import { loadUnsecureUserServiceBy } from './user-service.helper';
import { UserId } from '../../model/kanel/public/User';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { getDbTestConnection } from '../../../tests/config-test';

const userServiceCreateMutation = {
  query: print(gql`
    mutation userServiceCreateMutation($input: UserServiceInput!) {
      addUserService(input: $input) {
        id
        user {
          id
          last_name
          first_name
          email
        }
        service_capability {
          id
          service_capability_name
        }
        subscription {
          id
          organization {
            name
            id
          }
          service {
            name
            id
          }
        }
      }
    }
  `),
  variables: {
    input: {
      email: 'admin@filigran.io',
      capabilities: ['ADMIN_SUBSCRIPTION', 'MANAGE_ACCESS', 'ACCESS_SERVICE'],
      subscriptionId: toGlobalId(
        'Subscription',
        'fdd973f0-6e8e-4794-9857-da84830679d5'
      ),
    },
  },
};

describe('Services GraphQL Endpoint', async () => {
  const userAdmin = await getAdminAgent();

  describe('Call GraphqlEndpoint addUserService', () => {
    it('should return 200', async () => {
      console.log('####Should return 200');
      const response = await userAdmin
        .post('/graphql-api')
        .send(userServiceCreateMutation);
      expect(response.status).toBe(200);
    });
    it('should not find the subscription id 123 and throw error', async () => {
      const response = await userAdmin.post('/graphql-api').send({
        ...userServiceCreateMutation,
        variables: {
          ...userServiceCreateMutation.variables,
          input: {
            ...userServiceCreateMutation.variables.input,
            subscriptionId: '123',
          },
        },
      });
      const transform = JSON.parse(response.text);
      expect(transform.errors).toBeTruthy();
    });

    describe('add an already created user and create different capacity for the Service', async () => {
      const response = await userAdmin.post('/graphql-api').send({
        ...userServiceCreateMutation,
        variables: {
          ...userServiceCreateMutation.variables,
          input: {
            ...userServiceCreateMutation.variables.input,
            email: 'user15@test.fr',
          },
        },
      });

      it('check if there only 1 access', async () => {
        const existingUserService = await loadUnsecureUserServiceBy({
          user_id: 'e389e507-f1cd-4f2f-bfb2-274140d87d28' as UserId,
          subscription_id:
            'fdd973f0-6e8e-4794-9857-da84830679d5' as SubscriptionId,
        });
        expect(existingUserService.length).toBe(1);
      });
    });
  });
});
