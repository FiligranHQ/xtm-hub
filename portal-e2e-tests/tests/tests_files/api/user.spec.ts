import { expect, test } from '../../fixtures/baseFixtures';
import { ApiClient } from './client';
import gql from 'graphql-tag';

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
      const apiClient = await ApiClient.init();
      await apiClient.login('user@thales.com');

      const adminId = 'ba091095-418f-4b4f-b150-6c9295e232c3';
      const response = await apiClient.callGraphQL(query, {
        id: adminId,
        input: {},
      });

      const responseBody = (await response.body()).toString();
      expect(responseBody.includes('Not authorized')).toBeTruthy();
    });

    test('should allow user to update another one when he has MANAGE_ACCESS', async () => {
      const apiClient = await ApiClient.init();
      await apiClient.login('admin@thales.com');

      const thalesUserId = '154006e2-f24b-42da-b39c-e0fb17bead00';
      const response = await apiClient.callGraphQL(query, {
        id: thalesUserId,
        input: {},
      });

      const responseBody = (await response.body()).toString();

      expect(responseBody.includes('Not authorized')).toBeFalsy();
    });
  });
});
