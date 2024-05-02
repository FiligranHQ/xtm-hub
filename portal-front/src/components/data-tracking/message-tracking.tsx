import { graphql, useFragment } from 'react-relay';
import { messageTracking_fragment$key } from '../../../__generated__/messageTracking_fragment.graphql';
import { FunctionComponent } from 'react';
import { FormatDate } from '@/utils/date';

export const messageTrackingFragment = graphql`
  fragment messageTracking_fragment on MessageTracking {
    id
    created_at
    type
    technical
    tracking_info
  }
`;

interface MessageTrackingProps {
  data: messageTracking_fragment$key;
}

export const MessageTracking: FunctionComponent<MessageTrackingProps> = ({
  data,
}) => {
  const messageTracking = useFragment<messageTracking_fragment$key>(
    messageTrackingFragment,
    data
  );
  return (
    <div>
      {messageTracking.type}
      {FormatDate(messageTracking.created_at)}
      {messageTracking.tracking_info}
    </div>
  );
};
