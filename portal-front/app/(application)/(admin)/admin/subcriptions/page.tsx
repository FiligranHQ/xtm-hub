'use client';
import * as React from 'react';
import GuardCapacityComponent from '@/components/admin-guard';
import { RESTRICTION } from '@/utils/constant';
import SubscriptionPage from '@/components/subcription/subscription-page';
import { useQueryLoader } from 'react-relay';
import { subscriptionsSelectQuery } from '../../../../../__generated__/subscriptionsSelectQuery.graphql';
import { subscriptionFetch } from '@/components/subcription/subscription.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';
import { DataTable } from 'filigran-ui/clients';
import { ColumnDef } from '@tanstack/react-table';
import { subscriptionItem_fragment$data } from '../../../../../__generated__/subscriptionItem_fragment.graphql';
import { Badge } from 'filigran-ui/servers';
import { useLocalStorage } from 'usehooks-ts';
import { cn } from '@/lib/utils';

// Component interface
interface PageProps {}

// Table columns
const columns: ColumnDef<subscriptionItem_fragment$data>[] = [
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      return (
        <Badge
          variant={'secondary'}
          className={cn(row.original.status === 'REQUESTED' && 'text-orange')}>
          {row.original.status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'start_date',
    id: 'start_date',
    header: 'Start Date',
  },
  {
    accessorKey: 'end_date',
    id: 'end_date',
    header: 'End Date',
  },
  {
    accessorKey: 'organization.name',
    id: 'organization_name',
    header: 'Organization',
  },
  {
    accessorKey: 'service.name',
    id: 'service_name',
    header: 'Service',
  },
];

// Component
const Page: React.FunctionComponent<PageProps> = () => {
  const [count, setCount] = useLocalStorage('countSubscriptionList', 50);
  const [orderMode, setOrderMode] = useLocalStorage(
    'orderModeSubscriptionList',
    'desc'
  );
  const [orderBy, setOrderBy] = useLocalStorage(
    'orderBySubscriptionList',
    'status'
  );

  const [queryRef, loadQuery] =
    useQueryLoader<subscriptionsSelectQuery>(subscriptionFetch);
  useMountingLoader(loadQuery, { count, orderBy, orderMode });

  return (
    <GuardCapacityComponent
      capacityRestriction={[RESTRICTION.CAPABILITY_BYPASS]}>
      {queryRef ? (
        <SubscriptionPage
          columns={columns}
          queryRef={queryRef}
        />
      ) : (
        <DataTable
          data={[]}
          columns={columns}
          isLoading={true}
        />
      )}
    </GuardCapacityComponent>
  );
};

// Component export
export default Page;
