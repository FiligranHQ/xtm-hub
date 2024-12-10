'use client';
import {
  ServiceListQuery,
  servicesListFragment,
} from '@/components/service/service.graphql';
import { IconActions } from '@/components/ui/icon-actions';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { UseTranslationsProps } from '@/i18n/config';
import { ColumnDef, getSortedRowModel } from '@tanstack/react-table';
import { MoreVertIcon } from 'filigran-icon';
import { Button } from 'filigran-ui';
import { DataTable } from 'filigran-ui/clients';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';
import { serviceList_fragment$data } from '../../../../../__generated__/serviceList_fragment.graphql';
import { serviceQuery } from '../../../../../__generated__/serviceQuery.graphql';
import { servicesList_services$key } from '../../../../../__generated__/servicesList_services.graphql';

const breadcrumbValue = (t: UseTranslationsProps) => [
    {
        label: t('MenuLinks.Settings'),
    },
    {
        label: t('MenuLinks.Services'),
    },
];

const Page = () => {
  const router = useRouter();
  const t = useTranslations();
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
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <IconActions
            icon={
              <>
                <MoreVertIcon className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </>
            }>
            <Button
              variant={'ghost'}
              className="w-full justify-start"
              aria-label={t('Service.GoToManagement')}
              onClick={() => {
                router.push(`/admin/service/${row.id}`);
              }}>
              Manage
            </Button>
            <Button
              variant={'ghost'}
              className="w-full justify-start"
              aria-label={t('Service.GoToManagement')}
              onClick={() => router.push(`/service/vault/${row.id}`)}>
              Go to
            </Button>
          </IconActions>
        );
      },
    },
  ];

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
      <BreadcrumbNav value={breadcrumbValue(t)} />
      <h1>{t('MenuLinks.Services')}</h1>
      <DataTable
        columns={columns}
        data={serviceData}
        tableOptions={{
          getSortedRowModel: getSortedRowModel(),
        }}
      />
    </>
  );
};

export default Page;
