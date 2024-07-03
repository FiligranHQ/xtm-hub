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

export const subscriptionsByOrganizationFragment = graphql`
  fragment subscriptionListByOrganization_subscriptions on Query
  @refetchable(queryName: "SubscriptionsByOrganizationPaginationQuery") {
    subscriptionsByOrganization(
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      organization_id: $organization_id
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

    organization {
      name
      id
    }
    service {
      name
      id
    }
    start_date
    end_date
  }
`;
export const subscriptionFetch = graphql`
  query subscriptionsSelectQuery(
    $count: Int
    $cursor: ID
    $orderBy: SubscriptionOrdering!
    $orderMode: OrderingMode!
  ) {
    ...subscriptionList_subscriptions
  }
`;

export const subscriptionsByOrganizationFetch = graphql`
  query subscriptionsByOrganizationSelectQuery(
    $count: Int!
    $cursor: ID
    $orderBy: SubscriptionOrdering!
    $orderMode: OrderingMode!
    $organization_id: String!
  ) {
    ...subscriptionListByOrganization_subscriptions
  }
`;

export const AddSubscriptionMutation = graphql`
  mutation subscriptionCreateMutation(
    $service_id: String!
    $organization_id: ID!
    $user_id: ID!
    $connections: [ID!]!
  ) {
    addSubscription(
      service_id: $service_id
      organization_id: $organization_id
      user_id: $user_id
    )
      @prependNode(
        connections: $connections
        edgeTypeName: "SubscriptionsEdge"
      ) {
      id
    }
  }
`;
