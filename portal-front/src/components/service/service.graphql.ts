import { graphql } from 'react-relay';

export const ServiceListCreateMutation = graphql`
  mutation serviceListMutation($name: String!, $connections: [ID!]!) {
    addService(name: $name)
      @prependNode(connections: $connections, edgeTypeName: "ServicesEdge") {
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
  }
`;

export const subscription = graphql`
  subscription serviceListSubscription($connections: [ID!]!) {
    Service {
      add
        @prependNode(connections: $connections, edgeTypeName: "ServicesEdge") {
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
