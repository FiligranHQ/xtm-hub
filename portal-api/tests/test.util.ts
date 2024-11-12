import gql from 'graphql-tag';
import { print } from 'graphql/language';
import request from 'supertest';

const ENDPOINT_URL = 'http://localhost:4001';

export const logAdminUserTest = async (agent) => {
  return await agent.post('/graphql-api').send({
    query: print(gql`
      mutation loginFormMutation($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          ...meContext_fragment
          id
        }
      }
      fragment meContext_fragment on User {
        id
        email
        capabilities {
          name
          id
        }
        roles_portal {
          id
        }
        organizations {
          id
          name
        }
      }
    `),
    variables: {
      email: 'admin@filigran.io',
      password: 'admin',
    },
  });
};

export const getAdminAgent = async () => {
  const agent = request.agent(ENDPOINT_URL);
  await logAdminUserTest(agent);
  return agent;
};
