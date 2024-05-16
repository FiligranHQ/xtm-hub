import { graphql } from 'react-relay';

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
          ...messageTracking_fragment
        }
      }
    }
  }
`;
