import { graphql } from 'react-relay';

export const newsFeedItemFragment = graphql`
  fragment newsFeedItem_fragment on NewsFeedItem @inline {
    id
    title
    creation_date
    tags
    is_deleted
  }
`;

export const newsFeedListFragment = graphql`
  fragment newsFeedList_fragment on Query
  @refetchable(queryName: "NewsFeedPaginationQuery") {
    newsFeedItems(first: $count, after: $cursor) {
      __id
      totalCount
      edges {
        node {
          ...newsFeedItem_fragment
        }
      }
    }
  }
`;

export const NewsFeedListQuery = graphql`
  query newsFeedListQuery($count: Int!, $cursor: ID) {
    ...newsFeedList_fragment
  }
`;

export const DeleteNewsFeedItemMutation = graphql`
  mutation newsFeedDeleteMutation($id: NewsFeedItemId!) {
    deleteNewsFeedItem(id: $id)
  }
`;
