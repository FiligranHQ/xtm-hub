import 'knex';
import { describe, expect } from 'vitest';
import { getAdminAgent } from '../../../tests/test.util';
import gql from 'graphql-tag';
import { print } from 'graphql/language';

const serviceTestQuery = {
  query: print(gql`
    mutation addUserToCommunityMutation($id: ID!, $email: String!) {
      addUserToCommunity(id: $id, email: $email)
    }
  `),
  variables: {
    id: '123',
    email: 'admin@filigran.io',
  },
};

describe('Services GraphQL Endpoint', async () => {
  const userAdmin = await getAdminAgent();
  describe('Call GraphqlEndpoint addUserToCommunity', () => {
    it('should return 200', async () => {
      const response = await userAdmin
        .post('/graphql-api')
        .send(serviceTestQuery);
      expect(response.status).toBe(200);
    });
    it('should return true as response', async () => {
      const response = await userAdmin
        .post('/graphql-api')
        .send(serviceTestQuery);
      const transform = JSON.parse(response.text);
      expect(transform.data.addUserToCommunity).toBe(true);
    });
    it('should find the user and add to the DB', async () => {
      const response = await userAdmin
        .post('/graphql-api')
        .send(serviceTestQuery);
      const transform = JSON.parse(response.text);
      expect(transform.data.addUserToCommunity).toBe(true);
    });
    it('should not find the user and return false', async () => {
      const response = await userAdmin.post('/graphql-api').send({
        ...serviceTestQuery,
        variables: {
          ...serviceTestQuery.variables,
          email: 'user10@test.fr',
        },
      });
      const transform = JSON.parse(response.text);
      expect(transform.data.addUserToCommunity).toBe(false);
    });
  });
});
