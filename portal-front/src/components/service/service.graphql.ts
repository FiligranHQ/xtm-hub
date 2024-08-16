import { graphql } from 'react-relay';

export const ServiceListCreateMutation = graphql`
  mutation serviceListMutation($input: AddServiceInput, $connections: [ID!]!) {
    addService(input: $input)
      @prependNode(connections: $connections, edgeTypeName: "ServiceEdge") {
      ...subscription_fragment
    }
  }
`;

export const ServiceCommunityListCreateMutation = graphql`
  mutation serviceCommunityListMutation(
    $input: AddServiceCommunityInput
    $connections: [ID!]!
  ) {
    addServiceCommunity(input: $input)
      @prependNode(connections: $connections, edgeTypeName: "ServiceEdge") {
      ...serviceList_fragment
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
    subscription_service_type
    status
    links {
      url
    }
  }
`;

export const communityListFragment = graphql`
  fragment serviceCommunityList_fragment on Service {
    id
    name
    description
    provider
    type
    subscription_service_type
    status
    organization {
      id
      name
    }
    subscription {
      id
      status
    }
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
  fragment serviceList_services on Query
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
export const communitiesListFragment = graphql`
  fragment serviceCommunityList_services on Query
  @refetchable(queryName: "CommunitiesPaginationQuery") {
    communities(
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
          name
          description
          provider
          type
          subscription_service_type
          status
          organization {
            id
            name
          }
          subscription {
            id
            status

            organization {
              name
              id
            }
            start_date
            end_date
          }
        }
      }
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

export const ServiceListQuery = graphql`
  query serviceQuery(
    $count: Int!
    $cursor: ID
    $orderBy: ServiceOrdering!
    $orderMode: OrderingMode!
  ) {
    ...serviceList_services
  }
`;

export const ServiceCommunityListQuery = graphql`
  query serviceCommunitiesQuery(
    $count: Int!
    $cursor: ID
    $orderBy: ServiceOrdering!
    $orderMode: OrderingMode!
  ) {
    ...serviceCommunityList_services
  }
`;
