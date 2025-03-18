import { graphql } from 'react-relay';

export const subscriptionWithUserServiceFragment = graphql`
  fragment subscriptionWithUserService_fragment on SubscriptionModel {
    id
    organization {
      id
      name
      personal_space
    }
    subscription_capability {
      id
      service_capability {
        id
        description
        name
      }
    }
    user_service {
      ...userService_fragment @relay(mask: false)
    }
  }
`;
export const subscriptionFragment = graphql`
  fragment subscription_fragment on SubscriptionModel {
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
    $capability_ids: [ID]
  ) {
    addSubscriptionInService(
      service_instance_id: $service_instance_id
      organization_id: $organization_id
      capability_ids: $capability_ids
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
