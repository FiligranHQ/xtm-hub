import { test } from '../../fixtures/baseFixtures';
import gql from 'graphql-tag';
import { getUserOrganizationCapabilityNames } from '../../db-utils/capability.helper';
import {
  ACCESS_SUBSCRIPTION_USER,
  ADMIN_USER,
  THALES_ADMIN_USER,
  THALES_USER,
} from '../../db-utils/const';
import { TestAgent } from '../../db-utils/test-agent';

test.describe('User API', () => {
  test.describe('editUser', () => {
    const query = gql`
      mutation EditUser($id: ID!, $input: EditUserCapabilitiesInput!) {
        editUserCapabilities(id: $id, input: $input) {
          id
        }
      }
    `;

    test('should prevent user to update another one when he does not have MANAGE_ACCESS', async () => {
      const agent = await TestAgent.init(THALES_USER.EMAIL);

      await agent.assertUserHasCapabilities('Thales', {
        disallowedCapabilities: ['ADMINISTRATE_ORGANIZATION', 'MANAGE_ACCESS'],
      });

      await agent.assertIsAuthorized({
        query,
        variables: {
          id: ADMIN_USER.GLOBAL_ID,
          input: {
            capabilities: ['MANAGE_ACCESS'],
          },
        },
        shouldBeAuthorized: false,
      });
    });

    test('should allow user to update another one when he has ADMINISTRATE_ORGANIZATION', async () => {
      const agent = await TestAgent.init(THALES_ADMIN_USER.EMAIL);

      await agent.assertUserHasCapabilities('Thales', {
        requiredCapability: 'ADMINISTRATE_ORGANIZATION',
      });

      await agent.assertIsAuthorized({
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

      const agent = await TestAgent.init(ACCESS_SUBSCRIPTION_USER.EMAIL);

      await agent.assertUserHasCapabilities('Filigran', {
        requiredCapability: 'MANAGE_ACCESS',
        disallowedCapabilities: ['ADMINISTRATE_ORGANIZATION'],
      });

      await agent.assertIsAuthorized({
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
