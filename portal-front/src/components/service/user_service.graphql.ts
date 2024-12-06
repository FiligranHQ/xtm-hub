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
    service_capability {
      id
      service_capability_name
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
    service_capability {
      service_capability_name
    }
    subscription {
      id
      status
      service {
        name
        id
        type
        provider
        description
        links {
          id
          name
          url
        }
      }
    }
  }
`;

export const UserServiceCreateMutation = graphql`
  mutation userServiceCreateMutation(
    $input: UserServiceInput!
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
      service {
        id
        name
        description
      }
    }
  }
`;

export const UserServiceDeleteMutation = graphql`
  mutation userServiceDeleteMutation($input: UserServiceInput!) {
    deleteUserService(input: $input) {
      id
      organization {
        name
      }
      user_service {
        ...userService_fragment @relay(mask: false)
      }
      service {
        id
        name
        description
      }
    }
  }
`;
