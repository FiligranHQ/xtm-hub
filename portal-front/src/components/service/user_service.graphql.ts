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
          ...userServicesOwned_fragment @relay(mask: false)
        }
      }
    }
  }
`;

export const userServiceFragment = graphql`
  fragment userService_fragment on UserService {
    id
    user_service_capability {
      generic_service_capability {
        id
        name
      }
      subscription_capability {
        service_capability {
          id
          name
        }
      }
    }
    user {
      id
      last_name
      first_name
      email
    }
  }
`;

export const userServicesOwnedFragment = graphql`
  fragment userServicesOwned_fragment on UserService {
    id
    user_service_capability {
      generic_service_capability {
        name
      }
      subscription_capability {
        service_capability {
          id
          name
        }
      }
    }
    subscription {
      id
      status
      service_instance {
        name
        id
        description
        links {
          id
          name
          url
        }
        service_definition {
          id
          name
          identifier
        }
      }
    }
  }
`;

export const UserServiceCreateMutation = graphql`
  mutation userServiceCreateMutation(
    $input: UserServiceAddInput!
    $connections: [ID!]!
  ) {
    addUserService(input: $input)
      @prependNode(connections: $connections, edgeTypeName: "Subscription") {
      id
      organization {
        name
      }
      user_service {
        ...userService_fragment @relay(mask: false)
      }
      service_instance {
        id
        name
        description
      }
    }
  }
`;

export const UserServiceDeleteMutation = graphql`
  mutation userServiceDeleteMutation($input: UserServiceDeleteInput!) {
    deleteUserService(input: $input) {
      id
      organization {
        name
      }
      user_service {
        ...userService_fragment @relay(mask: false)
      }
      service_instance {
        id
        name
        description
      }
    }
  }
`;
