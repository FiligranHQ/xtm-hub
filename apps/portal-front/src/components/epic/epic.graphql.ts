import { graphql } from 'react-relay';

export const epicListFragment = graphql`
  fragment epicList_fragment on Epic {
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
    epics {
      __id
      ...epicList_fragment @relay(mask: false)
    }
  }
`;
export const epicListQuery = graphql`
  query epicsQuery {
    ...epicsList_epics
  }
`;
