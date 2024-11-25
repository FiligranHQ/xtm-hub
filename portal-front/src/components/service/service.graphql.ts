import { graphql } from 'react-relay';

export const ServiceListCreateMutation = graphql`
  mutation serviceListMutation($input: AddServiceInput, $connections: [ID!]!) {
    addService(input: $input)
      @prependNode(connections: $connections, edgeTypeName: "ServiceEdge") {
      ...subscription_fragment
    }
  }
`;

export const ServiceById = graphql`
  query serviceByIdQuery($service_id: ID) {
    serviceById(service_id: $service_id) {
      id
      name
      description
      type
    }
  }
`;

export const serviceListFragment = graphql`
  fragment serviceList_fragment on Service {
    id
    name
    description
    provider
    type
    creation_status
    subscribed
    capabilities
    public
    join_type
  }
`;

export const subscription = graphql`
  subscription serviceListSubscription($connections: [ID!]!) {
    Service {
      add @prependNode(connections: $connections, edgeTypeName: "ServiceEdge") {
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
    services(
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
    $orderBy: ServiceOrdering!
    $orderMode: OrderingMode!
  ) {
    ...servicesList_services
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
            service {
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
