'use client';

import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import ServiceList from '@/components/service/service-list';
import useMountingLoader from '@/hooks/useMountingLoader';
import Loader from '@/components/loader';
import { ServiceListQuery } from '@/components/service/service.graphql';
import {
  OrderingMode,
  ServiceOrdering,
  serviceQuery,
} from '../../../../__generated__/serviceQuery.graphql';
import { useLocalStorage } from 'usehooks-ts';
import { ColumnDef } from '@tanstack/react-table';
import { serviceList_fragment$data } from '../../../../__generated__/serviceList_fragment.graphql';
import { ServiceTypeBadge } from '@/components/ui/service-type-badge';
import { DataTable } from 'filigran-ui/clients';

// Component interface
interface ServiceListPreloaderProps {}

const columns: ColumnDef<serviceList_fragment$data>[] = [
  {
    id: 'type',
    size: 30,
    header: 'Type',
    cell: ({ row }) => {
      return <ServiceTypeBadge type={row.original.type as ServiceTypeBadge} />;
    },
  },
  {
    id: 'name',
    header: 'Name',
    cell: ({ row }) => {
      return <>{row.original.name}</>;
    },
  },
  {
    size: 300,
    accessorKey: 'description',
    id: 'description',
    header: 'Description',
  },
];
// Component
const PageLoader: React.FunctionComponent<ServiceListPreloaderProps> = () => {
  const [count, setCount] = useLocalStorage('countServiceList', 50);
  const [orderMode, setOrderMode] = useLocalStorage<OrderingMode>(
    'orderModeServiceList',
    'asc'
  );
  const [orderBy, setOrderBy] = useLocalStorage<ServiceOrdering>(
    'orderByServiceList',
    'name'
  );

  const [queryRef, loadQuery] = useQueryLoader<serviceQuery>(ServiceListQuery);
  useMountingLoader(loadQuery, { count, orderBy, orderMode });
  return (
    <>
      {queryRef ? (
        <ServiceList
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
export default PageLoader;
