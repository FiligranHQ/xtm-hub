'use client';
import {
  ServiceListQuery,
  servicesListFragment,
} from '@/components/service/service.graphql';
import { ColumnDef, getSortedRowModel } from '@tanstack/react-table';
import { DataTable } from 'filigran-ui/clients';
import { useRouter } from 'next/navigation';
import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';
import { serviceList_fragment$data } from '../../../../../__generated__/serviceList_fragment.graphql';
import { serviceQuery } from '../../../../../__generated__/serviceQuery.graphql';
import { servicesList_services$key } from '../../../../../__generated__/servicesList_services.graphql';

const columns: ColumnDef<serviceList_fragment$data>[] = [
  {
    accessorKey: 'name',
    id: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'description',
    id: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'creation_status',
    id: 'creation_status',
    header: 'Creation status',
  },
];
const Page = () => {
  const router = useRouter();
  const queryData = useLazyLoadQuery<serviceQuery>(ServiceListQuery, {
    count: 50,
    orderBy: 'name',
    orderMode: 'asc',
  });
  const [data, refetch] = useRefetchableFragment<
    serviceQuery,
    servicesList_services$key
  >(servicesListFragment, queryData);
  const serviceData = data?.services?.edges.map(
    (service) => service.node as serviceList_fragment$data
  );
  return (
    <>
      <h1>Services</h1>
      <DataTable
        columns={columns}
        data={serviceData}
        tableOptions={{
          getSortedRowModel: getSortedRowModel(),
        }}
        onClickRow={(row) => {
          router.push(`/admin/service/${row.id}`);
        }}
      />
    </>
  );
};

export default Page;
