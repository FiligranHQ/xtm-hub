import { graphql } from 'react-relay';

export const ServiceInstancesListQuery = graphql`
  query serviceInstancesListQuery(
    $count: Int!
    $cursor: ID
    $orderBy: ServiceInstanceOrdering!
    $orderMode: OrderingMode!
    $filters: [ServiceInstanceFilter!]
    $searchTerm: String
  ) {
    serviceInstances(
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      filters: $filters
      searchTerm: $searchTerm
    ) {
      edges {
        node {
          id
          slug
          service_definition {
            id
            identifier
          }
        }
      }
    }
  }
`;
