import { graphql } from 'react-relay';

export const subscriptionWithUserServiceFragment = graphql`
  fragment subscriptionWithUserService_fragment on Subscription {
    id
    organization {
      id
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
    service_instance_id
    service_instance {
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
    $service_instance_id: String!
    $organization_id: ID
  ) {
    addSubscriptionInService(
      service_instance_id: $service_instance_id
      organization_id: $organization_id
    ) {
      ...serviceWithSubscriptions_fragment @relay(mask: false)
    }
  }
`;

export const AddSubscriptionMutation = graphql`
  mutation subscriptionCreateMutation(
    $service_instance_id: String!
    $connections: [ID!]!
  ) {
    addSubscription(service_instance_id: $service_instance_id)
      @prependNode(connections: $connections, edgeTypeName: "Subscription") {
      ...serviceList_fragment
    }
  }
`;

export const SelfSubscribeMutation = graphql`
  mutation subscriptionSelfSubscribeMutation(
    $service_instance_id: String!
    $connections: [ID!]!
  ) {
    selfSubscribe(service_instance_id: $service_instance_id)
      @prependNode(connections: $connections, edgeTypeName: "Subscription") {
      ...serviceList_fragment
    }
  }
`;
