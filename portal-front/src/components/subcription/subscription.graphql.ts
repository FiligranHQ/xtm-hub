import { graphql } from 'react-relay';

export const subscriptionWithUserServiceFragment = graphql`
  fragment subscriptionWithUserService_fragment on Subscription {
    id
    organization {
      name
    }
    user_service {
      ...userService_fragment @relay(mask: false)
    }
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
  }
`;

export const SubscriptionDeleteMutation = graphql`
  mutation subscriptionDeleteMutation($subscription_id: ID!) {
    deleteSubscription(subscription_id: $subscription_id) {
      ...serviceWithSubscriptions_fragment @relay(mask: false)
    }
  }
`;

export const AddSubscriptionInServiceMutation = graphql`
  mutation subscriptionInServiceCreateMutation(
    $service_id: String!
    $organization_id: ID
  ) {
    addSubscriptionInService(
      service_id: $service_id
      organization_id: $organization_id
    ) {
      ...serviceWithSubscriptions_fragment @relay(mask: false)
    }
  }
`;

export const AddSubscriptionMutation = graphql`
  mutation subscriptionCreateMutation(
    $service_id: String!
    $connections: [ID!]!
  ) {
    addSubscription(service_id: $service_id)
      @prependNode(connections: $connections, edgeTypeName: "Subscription") {
      ...serviceList_fragment
    }
  }
`;
