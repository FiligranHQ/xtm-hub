import { graphql } from 'react-relay';

export const publicServiceListFragment = graphql`
  fragment publicServiceList_services on Query
  @refetchable(queryName: "PublicServiceInstancesPaginationQuery") {
    publicServiceInstances(
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
export const publicServiceListQuery = graphql`
  query publicServiceQuery(
    $count: Int!
    $cursor: ID
    $orderBy: ServiceInstanceOrdering!
    $orderMode: OrderingMode!
  ) {
    ...publicServiceList_services
  }
`;
