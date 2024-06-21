import { graphql } from 'react-relay';

export const subscriptionsFragment = graphql`
  fragment subscriptionList_subscriptions on Query
  @refetchable(queryName: "SubscriptionsPaginationQuery") {
    subscriptions(
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
    ) {
      __id
      totalCount
      edges {
        node {
          ...subscriptionItem_fragment @relay(mask: false)
        }
      }
    }
  }
`;

export const subscriptionItem = graphql`
  fragment subscriptionItem_fragment on Subscription {
    id
    organization_id
    organization {
      name
    }
    service_id
    service {
      name
    }
    start_date
    end_date
  }
`;
export const subscriptionFetch = graphql`
  query subscriptionsSelectQuery(
    $count: Int!
    $cursor: ID
    $orderBy: SubscriptionOrdering!
    $orderMode: OrderingMode!
  ) {
    ...subscriptionList_subscriptions
  }
`;
