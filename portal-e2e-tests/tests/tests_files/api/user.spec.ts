import { test } from '../../fixtures/baseFixtures';
import gql from 'graphql-tag';
import {
  checkCapability,
} from '../../db-utils/capability.helper';

test.describe('User API', () => {
  test.describe('editUser', () => {
    const query = gql`
      mutation EditUser($id: ID!, $input: EditUserInput!) {
        editUser(id: $id, input: $input) {
          id
        }
      }
    `;

    test('should prevent user to update another one when he does not have MANAGE_ACCESS', async () => {
      const adminId = 'ba091095-418f-4b4f-b150-6c9295e232c3';
      const variables = {
        id: adminId,
        input: {},
      };

      await checkCapability({
        loginUserEmail: 'user@thales.com',
        organizationName: 'Thales',
        shouldBeAuthorized: false,
        capabilityBlackList: ['ADMINISTRATE_ORGANIZATION', 'MANAGE_ACCESS'],
        query,
        variables,
      });
    });

    test('should allow user to update another one when he has ADMINISTRATE_ORGANIZATION', async () => {
      const thalesUserId = '154006e2-f24b-42da-b39c-e0fb17bead00';
      await checkCapability({
        loginUserEmail: 'admin@thales.com',
        organizationName: 'Thales',
        shouldBeAuthorized: true,
        requiredCapability: 'ADMINISTRATE_ORGANIZATION',
        query,
        variables: {
          id: thalesUserId,
          input: {},
        },
      });
    });

    test('should allow user to update another one when he has MANAGE_ACCESS', async () => {
      const thalesUserId = '154006e2-f24b-42da-b39c-e0fb17bead00';
      await checkCapability({
        loginUserEmail: 'access-subscription@filigran.io',
        organizationName: 'Filigran',
        // TODO: should not be authorized because we have capability on a different organization !
        shouldBeAuthorized: true,
        requiredCapability: 'MANAGE_ACCESS',
        capabilityBlackList: ['ADMINISTRATE_ORGANIZATION'],
        query,
        variables: {
          id: thalesUserId,
          input: {},
        },
      });
    });
  });
});
