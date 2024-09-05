'use client';

import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import useMountingLoader from '@/hooks/useMountingLoader';
import { useLocalStorage } from 'usehooks-ts';
import { subscriptionsByOrganizationFetch } from '@/components/subcription/subscription.graphql';
import ManageServicesList from '@/components/manage-services-list/manage-services-list';
import { subscriptionsByOrganizationSelectQuery } from '../../../../__generated__/subscriptionsByOrganizationSelectQuery.graphql';
import { ColumnDef } from '@tanstack/react-table';
import { subscriptionItem_fragment$data } from '../../../../__generated__/subscriptionItem_fragment.graphql';
import { ServiceTypeBadge } from '@/components/ui/service-type-badge';
import { Badge } from 'filigran-ui/servers';
import { DataTable } from 'filigran-ui/clients';

// Component interface
interface PageProps {}

const columns: ColumnDef<subscriptionItem_fragment$data>[] = [
  {
    id: 'name',
    header: 'Name',
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          {row.original.service?.name}
        </div>
      );
    },
  },
  {
    id: 'type',
    size: 30,
    header: 'Type',
    cell: ({ row }) => (
      <>
        {row.original.service?.type && (
          <ServiceTypeBadge
            type={row.original.service.type as ServiceTypeBadge}
          />
        )}
      </>
    ),
  },
  {
    accessorKey: 'service.provider',
    id: 'provider',
    size: 30,
    header: 'Provider',
  },
  {
    size: 300,
    accessorKey: 'service.description',
    id: 'description',
    header: 'Description',
  },
  {
    id: 'status',
    size: 30,
    header: 'Status',
    cell: ({ row }) => (
      <Badge
        variant={
          row.original?.status && row.original?.status === 'REQUESTED'
            ? 'warning'
            : 'secondary'
        }
        className={'cursor-default'}>
        {row.original?.status ?? 'ACCEPTED'}
      </Badge>
    ),
  },
];
// Component
const PageLoader: React.FunctionComponent<PageProps> = () => {
  const [count, setCount] = useLocalStorage('countRequestsList', 50);
  const [orderMode, setOrderMode] = useLocalStorage(
    'orderModeRequestsList',
    'asc'
  );
  const [orderBy, setOrderBy] = useLocalStorage(
    'orderByRequestsList',
    'status'
  );
  const [queryRef, loadQuery] =
    useQueryLoader<subscriptionsByOrganizationSelectQuery>(
      subscriptionsByOrganizationFetch
    );
  useMountingLoader(loadQuery, { count, orderBy, orderMode });
  return (
    <>
      {queryRef ? (
        <ManageServicesList
          queryRef={queryRef}
          columns={columns}
        />
      ) : (
        <DataTable
          columns={columns}
          isLoading={true}
          data={[]}
        />
      )}
    </>
  );
};
// Component export
export default PageLoader;
