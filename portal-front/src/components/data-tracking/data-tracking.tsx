import { graphql, useFragment } from 'react-relay';
import { FunctionComponent } from 'react';
import { dataTracking_fragment$key } from '../../../__generated__/dataTracking_fragment.graphql';
import { MessageTracking } from '@/components/data-tracking/message-tracking';
import { FormatDate } from '@/utils/date';

export const dataTrackingFragment = graphql`
  fragment dataTracking_fragment on ActionTracking {
    id
    contextual_id
    created_at
    ended_at
    status
    message_tracking {
      ...messageTracking_fragment
    }
  }
`;

interface DataTrackingProps {
  data?: dataTracking_fragment$key | null;
}

export const DataTracking: FunctionComponent<DataTrackingProps> = ({
  data,
}) => {
  const dataTracking = useFragment<dataTracking_fragment$key>(
    dataTrackingFragment,
    data
  );

  return (
    <div>
      <div>{dataTracking?.status}</div>
      <div>{FormatDate(dataTracking?.created_at)}</div>
      <div>{FormatDate(dataTracking?.ended_at)}</div>
      {dataTracking?.message_tracking.map((message) => (
        <MessageTracking data={message} />
      ))}
    </div>
  );
};
