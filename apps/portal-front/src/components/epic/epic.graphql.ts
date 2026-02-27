import { graphql } from 'react-relay';

export const epicFragment = graphql`
  fragment epic_fragment on Epic {
    id
    short_description
    long_description
    epic
    title
    timeline
  }
`;
export const epicsListFragment = graphql`
  fragment epicsList_epics on Query
  @refetchable(queryName: "EpicPaginationQuery") {
    epics(
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
    ) {
      __id
      edges {
        node {
          id
          ...epic_fragment @relay(mask: false)
        }
      }
    }
  }
`;
export const EpicListQuery = graphql`
  query epicsQuery(
    $count: Int!
    $cursor: ID
    $orderBy: EpicOrdering!
    $orderMode: OrderingMode!
  ) {
    ...epicsList_epics
  }
`;
