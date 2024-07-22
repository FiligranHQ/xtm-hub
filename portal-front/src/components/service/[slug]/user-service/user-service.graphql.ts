import { graphql } from 'react-relay';

export const UserServiceCreateMutation = graphql`
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
`;

export const UserServiceDeleteMutation = graphql`
  mutation userServiceDeleteMutation($input: UserServiceInput!) {
    deleteUserService(input: $input) {
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
`;
