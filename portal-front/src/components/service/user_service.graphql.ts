import { graphql } from 'react-relay';

export const UserServiceOwnedQuery = graphql`
  query userServiceOwnedQuery(
    $count: Int!
    $cursor: ID
    $orderBy: UserServiceOrdering!
    $orderMode: OrderingMode!
  ) {
    ...userServiceOwnedUser
  }
`;

export const userServiceOwnedFragment = graphql`
  fragment userServiceOwnedUser on Query
  @refetchable(queryName: "ServiceUserOwnedPaginationQuery") {
    userServiceOwned(
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
    ) {
      __id
      totalCount
      edges {
        node {
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
            status
            organization {
              name
              id
            }
            service {
              name
              id
              type
              provider
              description
            }
          }
        }
      }
    }
  }
`;

export const userServicesOwnedFragment = graphql`
  fragment userServicesOwned_fragment on UserService {
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
      status
      organization {
        name
        id
      }
      service {
        name
        id
        type
        provider
        description
      }
    }
  }
`;

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
