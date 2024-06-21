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
    url
    provider
    type
    subscription_type
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
