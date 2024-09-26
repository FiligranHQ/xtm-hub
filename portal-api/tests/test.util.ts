import request from 'supertest';
import { print } from 'graphql/language';
import gql from 'graphql-tag';

const ENDPOINT_URL = 'http://127.0.0.1:4001';

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
        roles_portal_id {
          id
        }
        organization {
          id
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
