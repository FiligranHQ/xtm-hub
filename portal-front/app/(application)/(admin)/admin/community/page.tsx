'use client';

import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import { ServiceCommunityListQuery } from '@/components/service/service.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';
import Loader from '@/components/loader';
import { serviceCommunitiesQuery } from '../../../../../__generated__/serviceCommunitiesQuery.graphql';
import CommunityList from '@/components/service/community/community-list';
import { useLocalStorage } from 'usehooks-ts';
import { Badge, Breadcrumb } from 'filigran-ui/servers';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { ServiceTypeBadge } from '@/components/ui/service-type-badge';
import { ColumnDef } from '@tanstack/react-table';
import { serviceCommunityList_fragment$data } from '../../../../../__generated__/serviceCommunityList_fragment.graphql';
import { DataTable } from 'filigran-ui/clients';
import {
  SubscriptionStatusBadge,
  SubscriptionStatusTypeBadge,
} from '@/components/ui/subscription-status-badge';

// Component interface
interface PageProps {}

const breadcrumbValue = [
  {
    label: 'Backoffice',
  },
  {
    label: 'Communities',
  },
];

const columns: ColumnDef<serviceCommunityList_fragment$data>[] = [
  {
    id: 'name',
    header: 'Name',
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">{row.original.name}</div>
      );
    },
  },
  {
    id: 'type',
    size: 30,
    header: 'Type',
    cell: ({ row }) => (
      <>
        {row.original.type && (
          <ServiceTypeBadge type={row.original.type as ServiceTypeBadge} />
        )}
      </>
    ),
  },
  {
    size: 300,
    accessorKey: 'description',
    id: 'description',
    header: 'Description',
    enableSorting: false,
  },
  {
    id: 'status',
    size: 30,
    header: 'Status',
    cell: ({ row }) => (
      <>
        {' '}
        {row.original?.subscription && row.original?.subscription[0] && (
          <SubscriptionStatusBadge
            type={
              row.original?.subscription[0]
                .status as SubscriptionStatusTypeBadge
            }
          />
        )}
      </>
    ),
  },
];
// Component
const Page: React.FunctionComponent<PageProps> = () => {
  const [count, setCount] = useLocalStorage('countCommunitiesList', 50);
  const [orderMode, setOrderMode] = useLocalStorage(
    'orderModeCommunitiesList',
    'asc'
  );
  const [orderBy, setOrderBy] = useLocalStorage(
    'orderByCommunitiesList',
    'name'
  );

  const [queryRef, loadQuery] = useQueryLoader<serviceCommunitiesQuery>(
    ServiceCommunityListQuery
  );
  useMountingLoader(loadQuery, { count, orderBy, orderMode });
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1>Communities list</h1>
      {queryRef ? (
        <CommunityList
          queryRef={queryRef}
          columns={columns}
        />
      ) : (
        <DataTable
          columns={columns}
          data={[]}
          isLoading={true}
        />
      )}
    </>
  );
};

// Component export
export default Page;
