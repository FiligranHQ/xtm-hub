import { graphql, useFragment } from 'react-relay';
import * as React from 'react';
import { FunctionComponent } from 'react';
import { dataTracking_fragment$key } from '../../../__generated__/dataTracking_fragment.graphql';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { FormatDate } from '@/utils/date';
import { MessageTracking } from '@/components/data-tracking/message-tracking';
import { messageTracking_fragment$key } from '../../../__generated__/messageTracking_fragment.graphql';
import { DialogCloseButton } from '@/components/ui/dialog-close-button';

export const dataTrackingFragment = graphql`
  fragment dataTracking_fragment on ActionTracking @relay(plural: true) {
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

interface DataTrackingObject {
  readonly contextual_id: string;
  readonly created_at: any;
  readonly ended_at: any | null | undefined;
  readonly id: string;
  readonly status: string | null | undefined;
  readonly message_tracking: messageTracking_fragment$key;
}

const columns: ColumnDef<DataTrackingObject>[] = [
  {
    accessorKey: 'created_at',
    header: 'Created at',
  },
  {
    accessorKey: 'ended_at',
    header: 'Ended at',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <DialogCloseButton
          title={'Message Tracking'}
          trigger={'Details'}>
          <MessageTracking data={row.original.message_tracking} />
        </DialogCloseButton>
      );
    },
  },
];

interface DataTrackingProps {
  data?: dataTracking_fragment$key | null | undefined;
}

export const DataTracking: FunctionComponent<DataTrackingProps> = ({
  data,
}) => {
  const dataTracking = useFragment<dataTracking_fragment$key>(
    dataTrackingFragment,
    data
  );
  console.log(dataTracking);
  const formattedData: DataTrackingObject[] =
    dataTracking?.map((t) => ({
      ...t,
      created_at: FormatDate(t.created_at),
      ended_at: FormatDate(t.ended_at),
      message_tracking:
        t.message_tracking as unknown as messageTracking_fragment$key,
    })) ?? [];
  if (formattedData.length === 0) {
    return null;
  }
  return (
    <div>
      <DataTable
        columns={columns}
        data={formattedData}
      />
    </div>
  );
};
