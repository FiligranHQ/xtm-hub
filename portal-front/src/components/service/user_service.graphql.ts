import { graphql } from 'react-relay';

export const UserServiceFromSubscription = graphql`
  query userServiceFromSubscriptionQuery(
    $count: Int!
    $cursor: ID
    $orderBy: UserServiceOrdering!
    $orderMode: OrderingMode!
    $subscriptionId: ID!
  ) {
    ...userServiceFromSubscription
  }
`;

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

export const userServiceFromSubscriptionFragment = graphql`
  fragment userServiceFromSubscription on Query
  @refetchable(queryName: "ServiceUserFromSubscriptionPaginationQuery") {
    userServiceFromSubscription(
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      subscription_id: $subscriptionId
    ) {
      __id
      totalCount
      edges {
        node {
          id
          ...userServices_fragment
        }
      }
    }
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
          ...userServices_fragment
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
        ...serviceList_fragment @relay(mask: false)
      }
    }
    ordering
  }
`;

export const userServicesFragment = graphql`
  fragment userServices_fragment on UserService @inline {
    id
    user {
      first_name
      last_name
      email
    }
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
  }
`;

export const UserServiceCreateMutation = graphql`
  mutation userServiceCreateMutation(
    $input: UserServiceAddInput!
    $connections: [ID!]!
  ) {
    addUserService(input: $input)
      @prependNode(connections: $connections, edgeTypeName: "UserServiceEdge") {
      id
      user {
        id
        first_name
        last_name
        email
      }
      user_service_capability {
        id
        generic_service_capability {
          id
          name
        }
        subscription_capability {
          id
          service_capability {
            id
            description
            name
          }
        }
      }
    }
  }
`;

export const UserServiceDeleteMutation = graphql`
  mutation userServiceDeleteMutation(
    $input: UserServiceDeleteInput!
    $connections: [ID!]!
  ) {
    deleteUserService(input: $input) {
      id @deleteEdge(connections: $connections)
    }
  }
`;
