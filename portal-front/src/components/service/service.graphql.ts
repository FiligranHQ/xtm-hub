import { graphql } from 'react-relay';

export const ServiceListCreateMutation = graphql`
  mutation serviceListMutation($input: AddServiceInput, $connections: [ID!]!) {
    addServiceInstance(input: $input)
      @prependNode(
        connections: $connections
        edgeTypeName: "ServiceInstanceEdge"
      ) {
      ...subscription_fragment
    }
  }
`;

export const ServiceById = graphql`
  query serviceByIdQuery($service_instance_id: ID) {
    serviceInstanceById(service_instance_id: $service_instance_id) {
      id
      name
      description
      capabilities @required(action: THROW)
    }
  }
`;

export const serviceListFragment = graphql`
  fragment serviceList_fragment on ServiceInstance {
    id
    name
    description
    creation_status
    subscribed
    capabilities
    public
    join_type
    tags
    links {
      name
      url
    }
    service_definition {
      id
      name
      identifier
    }
  }
`;

export const subscription = graphql`
  subscription serviceListSubscription($connections: [ID!]!) {
    ServiceInstance {
      add
        @prependNode(
          connections: $connections
          edgeTypeName: "ServiceInstanceEdge"
        ) {
        ...serviceList_fragment
      }
      edit {
        ...serviceList_fragment
      }
      delete {
        id @deleteRecord
      }
    }
  }
`;

export const servicesListFragment = graphql`
  fragment servicesList_services on Query
  @refetchable(queryName: "ServicesPaginationQuery") {
    serviceInstances(
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
          ...serviceList_fragment @relay(mask: false)
        }
      }
    }
  }
`;

export const ServiceListQuery = graphql`
  query serviceQuery(
    $count: Int!
    $cursor: ID
    $orderBy: ServiceInstanceOrdering!
    $orderMode: OrderingMode!
  ) {
    ...servicesList_services
  }
`;

export const ServiceByIdWithSubscriptions = graphql`
  query serviceByIdWithSubscriptionsQuery($service_instance_id: ID) {
    serviceInstanceByIdWithSubscriptions(
      service_instance_id: $service_instance_id
    ) {
      ...serviceWithSubscriptions_fragment @relay(mask: false)
    }
  }
`;

export const serviceWithSubscriptionsFragment = graphql`
  fragment serviceWithSubscriptions_fragment on ServiceInstance {
    __id
    name
    id
    description
    subscriptions {
      ...subscriptionWithUserService_fragment @relay(mask: false)
    }
  }
`;

export const serviceUsersFragment = graphql`
  fragment serviceUser on Query
  @refetchable(queryName: "ServiceUserPaginationQuery") {
    serviceUsers(
      id: $id
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
            organization {
              name
              id
            }
            service_instance {
              name
              id
            }
          }
        }
      }
    }
  }
`;

// Configuration or Preloader Query
export const ServiceUserSlugQuery = graphql`
  query serviceUserSlugQuery(
    $id: ID!
    $count: Int!
    $cursor: ID
    $orderBy: UserServiceOrdering!
    $orderMode: OrderingMode!
  ) {
    ...serviceUser
  }
`;
