import { graphql } from 'react-relay';

export const LoginFormMutation = graphql`
  mutation loginFormMutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      ...meContext_fragment
    }
  }
`;