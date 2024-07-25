import { useFragment } from 'react-relay';
import * as React from 'react';
import { FunctionComponent } from 'react';
import { DataTable } from 'filigran-ui/clients';
import { ColumnDef } from '@tanstack/react-table';
import { FormatDate } from '@/utils/date';
import { MessageTracking } from '@/components/data-tracking/message-tracking';
import { DialogCloseButton } from '@/components/ui/dialog-close-button';
import { dataTrackingFragment } from '@/components/data-tracking/tracking.graphql';
import { trackingMessage_fragment$key } from '../../../__generated__/trackingMessage_fragment.graphql';
import { trackingData_fragment$key } from '../../../__generated__/trackingData_fragment.graphql';

interface DataTrackingObject {
  readonly contextual_id: string;
  readonly created_at: any;
  readonly ended_at: any | null | undefined;
  readonly id: string;
  readonly status: string | null | undefined;
  readonly type: string;
  readonly message_tracking: trackingMessage_fragment$key;
}

const columns: ColumnDef<DataTrackingObject>[] = [
  {
    accessorKey: 'type',
    id: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'created_at',
    id: 'created_at',
    header: 'Created at',
  },
  {
    accessorKey: 'ended_at',
    id: 'ended_at',
    header: 'Ended at',
  },
  {
    accessorKey: 'status',
    id: 'status',
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
  data: trackingData_fragment$key | null | undefined;
}

export const DataTracking: FunctionComponent<DataTrackingProps> = ({
  data,
}) => {
  const dataTracking = useFragment<trackingData_fragment$key>(
    dataTrackingFragment,
    data
  );
  const formattedData: DataTrackingObject[] =
    dataTracking?.map((t) => ({
      ...t,
      created_at: FormatDate(t.created_at),
      ended_at: FormatDate(t.ended_at),
      type: 'CREATE_USER', // Need to add in the env in postgres table
      message_tracking:
        t.message_tracking as unknown as trackingMessage_fragment$key,
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
