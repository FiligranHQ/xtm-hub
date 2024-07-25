import { graphql } from 'react-relay';

export const dataTrackingFragment = graphql`
  fragment trackingData_fragment on ActionTracking @relay(plural: true) {
    id
    contextual_id
    created_at
    ended_at
    status
    message_tracking {
      ...trackingMessage_fragment
    }
  }
`;

export const trackingSubscription = graphql`
  subscription trackingSubscription {
    ActionTracking {
      edit {
        id
        contextual_id
        created_at
        ended_at
        status
        message_tracking {
          ...trackingMessage_fragment
        }
      }
    }
  }
`;

export const messageTrackingFragment = graphql`
  fragment trackingMessage_fragment on MessageTracking @relay(plural: true) {
    id
    created_at
    type
    technical
    tracking_info
  }
`;
