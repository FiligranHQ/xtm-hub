import { test } from '../../fixtures/baseFixtures';
import gql from 'graphql-tag';
import {
  checkCapability,
  getUserOrganizationCapabilityNames,
} from '../../db-utils/capability.helper';
import {
  ACCESS_SUBSCRIPTION_USER,
  ADMIN_USER,
  THALES_ADMIN_USER,
  THALES_USER,
} from '../../db-utils/const';

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
      await checkCapability({
        loginUserEmail: THALES_USER.EMAIL,
        organizationName: 'Thales',
        shouldBeAuthorized: false,
        capabilityBlackList: ['ADMINISTRATE_ORGANIZATION', 'MANAGE_ACCESS'],
        query,
        variables: {
          id: ADMIN_USER.GLOBAL_ID,
          input: {},
        },
      });
    });

    test('should allow user to update another one when he has ADMINISTRATE_ORGANIZATION', async () => {
      await checkCapability({
        loginUserEmail: THALES_ADMIN_USER.EMAIL,
        organizationName: 'Thales',
        shouldBeAuthorized: true,
        requiredCapability: 'ADMINISTRATE_ORGANIZATION',
        query,
        variables: {
          id: THALES_USER.GLOBAL_ID,
          input: {},
        },
      });
    });

    test('should allow user to update another one when he has MANAGE_ACCESS', async () => {
      // update user with same capabilities to prevent other tests failure
      const adminCapabilityNames = await getUserOrganizationCapabilityNames(
        ADMIN_USER.EMAIL,
        'Filigran'
      );
      await checkCapability({
        loginUserEmail: ACCESS_SUBSCRIPTION_USER.EMAIL,
        organizationName: 'Filigran',
        shouldBeAuthorized: true,
        requiredCapability: 'MANAGE_ACCESS',
        capabilityBlackList: ['ADMINISTRATE_ORGANIZATION'],
        query,
        variables: {
          id: ADMIN_USER.GLOBAL_ID,
          input: {
            capabilities: adminCapabilityNames,
          },
        },
      });
    });
  });
});
