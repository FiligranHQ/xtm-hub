import { graphql } from 'react-relay';

export const UserServiceFromSubscription = graphql`
  query userServiceFromSubscriptionQuery(
    $count: Int!
    $cursor: ID
    $orderBy: UserServiceOrdering!
    $orderMode: OrderingMode!
    $subscriptionId: SubscriptionId!
  ) {
    ...userServiceFromSubscription
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

export const userServicesFragment = graphql`
  fragment userServices_fragment on UserService @inline {
    id
    user {
      id
      first_name
      last_name
      email
    }
    subscription {
      service_instance {
        service_definition {
          identifier
        }
        id
        name
      }
    }
    user_service_capability {
      generic_service_capability {
        name
        id
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
export const UserServiceEditMutation = graphql`
  mutation userServiceEditMutation($input: UserServiceEditInput!) {
    editUserService(input: $input) {
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
    $input: UserServicesDeleteInput!
    $connections: [ID!]!
  ) {
    deleteUserServices(input: $input) {
      id @deleteEdge(connections: $connections)
    }
  }
`;

export const UserServicesAddCapabilitiesMutation = graphql`
  mutation userServicesAddCapabilitiesMutation(
    $input: UserServicesAddCapabilitiesInput!
  ) {
    AddCapabilitiesToUserServices(input: $input) {
      id
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
            name
          }
        }
      }
    }
  }
`;
