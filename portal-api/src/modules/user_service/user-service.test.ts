import 'knex';
import { afterAll, describe, expect, it } from 'vitest';
import { getAdminAgent } from '../../../tests/test.util';
import gql from 'graphql-tag';
import { print } from 'graphql/language';
import { toGlobalId } from 'graphql-relay/node/node';
import { loadUnsecureUserServiceBy } from './user-service.helper';
import { UserId } from '../../model/kanel/public/User';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { loadUnsecureServiceCapabitiesBy } from '../service_capability/service_capability.helper';
import { loadUserBy } from '../users/users.domain';
import { v4 as uuidv4 } from 'uuid';
import { deleteUserUnsecure } from '../users/users.helper';
import {
  deleteOrganizationByName,
  loadUnsecureOrganizationBy,
} from '../organizations/organizations.helper';
import {
  deleteSubscriptionUnsecure,
  loadUnsecureSubscriptionBy,
} from '../subcription/subscription.helper';
import { fromGlobalId } from 'graphql-relay/node/node.js';

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
      await userAdmin.post('/graphql-api').send({
        ...userServiceCreateMutation,
        variables: {
          ...userServiceCreateMutation.variables,
          input: {
            ...userServiceCreateMutation.variables.input,
            email: 'user15@test.fr',
          },
        },
      });
      const existingUserService = await loadUnsecureUserServiceBy({
        user_id: 'e389e507-f1cd-4f2f-bfb2-274140d87d28' as UserId,
        subscription_id:
          'fdd973f0-6e8e-4794-9857-da84830679d5' as SubscriptionId,
      });
      it('check if the user has 1 and only 1 access', async () => {
        expect(existingUserService.length).toBe(1);
      });

      it('check if the user has 3 capacities', async () => {
        const userCapacities = await loadUnsecureServiceCapabitiesBy({
          user_service_id: existingUserService[0].id,
        });
        expect(userCapacities.length).toBe(3);
      });
    });

    describe('add an new user and create different capacity for the Service', async () => {
      const testEmail = `newUserService${uuidv4()}@filigran.io`;
      await userAdmin.post('/graphql-api').send({
        ...userServiceCreateMutation,
        variables: {
          ...userServiceCreateMutation.variables,
          input: {
            ...userServiceCreateMutation.variables.input,
            email: testEmail,
            capabilities: ['ACCESS_SERVICE'],
          },
        },
      });
      const createdUser = await loadUserBy('email', testEmail);

      it('the user should be created', async () => {
        expect(createdUser).toBeTruthy();
      });

      const existingUserService = await loadUnsecureUserServiceBy({
        user_id: createdUser.id as UserId,
        subscription_id:
          'fdd973f0-6e8e-4794-9857-da84830679d5' as SubscriptionId,
      });
      it('check if the user has 1 and only 1 access', async () => {
        expect(existingUserService.length).toBe(1);
      });
      it('check if the user has 1 capacity ACCESS_SERVICE', async () => {
        const userCapacities = await loadUnsecureServiceCapabitiesBy({
          user_service_id: existingUserService[0].id,
        });
        expect(userCapacities.length).toBe(1);
      });

      afterAll(async () => {
        await deleteUserUnsecure({ email: testEmail });
      });
    });

    describe('add an new user and a new organization', async () => {
      const testEmail = `newUserService${uuidv4()}@tripadvisor.io`;
      const response = await userAdmin.post('/graphql-api').send({
        ...userServiceCreateMutation,
        variables: {
          ...userServiceCreateMutation.variables,
          input: {
            ...userServiceCreateMutation.variables.input,
            email: testEmail,
            capabilities: ['ACCESS_SERVICE'],
          },
        },
      });
      const transform = JSON.parse(response.text);
      const createdUser = await loadUserBy('email', testEmail);
      const newOrganization = await loadUnsecureOrganizationBy(
        'name',
        'tripadvisor'
      );
      it('the user should be created and with his organization', async () => {
        expect(createdUser).toBeTruthy();
        expect(createdUser.email).toBe(testEmail);

        expect(createdUser.organization_id).toBe(newOrganization.id);
      });
      it('the subscription should be created and with his organization', async () => {
        expect(createdUser.organization_id).toBe(newOrganization.id);
        const [createdSubscription] = await loadUnsecureSubscriptionBy({
          id: fromGlobalId(transform.data.addUserService.subscription.id)
            .id as SubscriptionId,
        });
        expect(createdSubscription.organization_id).toBe(newOrganization.id);
      });
      afterAll(async () => {
        await deleteUserUnsecure({ email: testEmail });
        await deleteOrganizationByName('tripadvisor');
        await deleteSubscriptionUnsecure(
          fromGlobalId(transform.data.addUserService.subscription.id).id
        );
      });
    });
    describe('add two user and with the same organizations', async () => {
      const testEmail1 = `newUserService${uuidv4()}@thales.com`;
      const testEmail2 = `newUserService${uuidv4()}@thales.com`;
      const response1 = await userAdmin.post('/graphql-api').send({
        ...userServiceCreateMutation,
        variables: {
          ...userServiceCreateMutation.variables,
          input: {
            ...userServiceCreateMutation.variables.input,
            email: testEmail1,
            capabilities: ['ACCESS_SERVICE'],
          },
        },
      });
      const response2 = await userAdmin.post('/graphql-api').send({
        ...userServiceCreateMutation,
        variables: {
          ...userServiceCreateMutation.variables,
          input: {
            ...userServiceCreateMutation.variables.input,
            email: testEmail2,
            capabilities: ['ACCESS_SERVICE'],
          },
        },
      });
      const transform1 = JSON.parse(response1.text);
      const transform2 = JSON.parse(response2.text);
      it('for the same organization the two users should have the same subscription', async () => {
        expect(transform1.data.addUserService.subscription.id).toBe(
          transform2.data.addUserService.subscription.id
        );
      });
      afterAll(async () => {
        await deleteUserUnsecure({ email: testEmail1 });
        await deleteUserUnsecure({ email: testEmail2 });
        await deleteSubscriptionUnsecure(
          fromGlobalId(transform1.data.addUserService.subscription.id).id
        );
      });
    });
  });
});
