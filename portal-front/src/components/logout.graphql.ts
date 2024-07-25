import { graphql } from 'react-relay';

export const LogoutMutation = graphql`
  mutation logoutMutation {
    logout
  }
`;
