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

export const SubscriptionsByService = graphql`
  query subscriptionByServiceQuery($service_id: ID) {
    subscriptionsByServiceId(service_id: $service_id) {
      ...subscriptionByService_fragment @relay(mask: false)
    }
  }
`;

export const subscriptionByServiceFragment = graphql`
  fragment subscriptionByService_fragment on Subscription {
    status
    justification
    id
    billing
    organization_name
    user_service {
      ...userService_fragment @relay(mask: false)
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
    organization_id
    service_id
    service_url
    service {
      name
      id
      description
      provider
      subscription_service_type
      type
    }
    start_date
    end_date
    status
    billing
    justification
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
    $count: Int
    $cursor: ID
    $orderBy: SubscriptionOrdering!
    $orderMode: OrderingMode!
  ) {
    ...subscriptionListByOrganization_subscriptions
  }
`;

export const subscriptionFragment = graphql`
  fragment subscription_fragment on Subscription {
    id
    organization_id
    organization {
      name
      id
    }
    service_id
    service {
      name
    }
    start_date
    end_date
    status
    billing
    justification
  }
`;

export const SubscriptionEditMutation = graphql`
  mutation subscriptionEditMutation($id: ID!, $input: EditSubscriptionInput!) {
    editSubscription(id: $id, input: $input) {
      ...subscription_fragment
    }
  }
`;

export const SubscriptionDeleteMutation = graphql`
  mutation subscriptionDeleteMutation($subscription_id: ID!) {
    deleteSubscription(subscription_id: $subscription_id) {
      ...subscription_fragment
    }
  }
`;

export const AddSubscriptionInCommunityMutation = graphql`
  mutation subscriptionInCommunityCreateMutation(
    $service_id: String!
    $organization_id: ID
    $connections: [ID!]!
  ) {
    addSubscriptionInCommunity(
      service_id: $service_id
      organization_id: $organization_id
    ) @prependNode(connections: $connections, edgeTypeName: "UserServiceEdge") {
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
        billing
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
`;

export const AddSubscriptionMutation = graphql`
  mutation subscriptionCreateMutation(
    $service_id: String!
    $connections: [ID!]!
  ) {
    addSubscription(service_id: $service_id)
      @prependNode(
        connections: $connections
        edgeTypeName: "SubscriptionEdge"
      ) {
      ...serviceList_fragment
    }
  }
`;
