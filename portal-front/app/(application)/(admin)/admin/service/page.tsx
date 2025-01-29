'use client';
import {
  ServiceListQuery,
  servicesListFragment,
} from '@/components/service/service.graphql';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { IconActions, IconActionsButton } from '@/components/ui/icon-actions';
import useGoToServiceLink from '@/hooks/useGoToServiceLink';
import { i18nKey } from '@/utils/datatable';
import { ColumnDef, getSortedRowModel } from '@tanstack/react-table';
import { MoreVertIcon } from 'filigran-icon';
import { DataTable } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';
import { serviceList_fragment$data } from '../../../../../__generated__/serviceList_fragment.graphql';
import { serviceQuery } from '../../../../../__generated__/serviceQuery.graphql';
import { servicesList_services$key } from '../../../../../__generated__/servicesList_services.graphql';

const breadcrumbValue = [
  {
    label: 'MenuLinks.Settings',
  },
  {
    label: 'MenuLinks.Services',
  },
];

const Page = () => {
  const router = useRouter();
  const t = useTranslations();
  const goToServiceLink = useGoToServiceLink();

  const columns: ColumnDef<serviceList_fragment$data>[] = [
    {
      accessorKey: 'name',
      id: 'name',
      header: t('Service.Name'),
    },
    {
      accessorKey: 'description',
      id: 'description',
      header: t('Service.Description'),
    },
    {
      accessorKey: 'creation_status',
      id: 'creation_status',
      header: t('Service.CreationStatus'),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-end">
            <IconActions
              icon={
                <>
                  <MoreVertIcon
                    aria-hidden={true}
                    focusable={false}
                    className="h-4 w-4 text-primary"
                  />
                  <span className="sr-only">{t('Utils.OpenMenu')}</span>
                </>
              }>
              {row.original.service_definition?.identifier !== 'link' && (
                <IconActionsButton
                  aria-label={t('Service.GoToAdminLabel')}
                  onClick={() => {
                    router.push(`/admin/service/${row.id}`);
                  }}>
                  {t('Service.GoToAdminLabel')}
                </IconActionsButton>
              )}
              <IconActionsButton
                aria-label={t('Service.GoTo')}
                onClick={() => goToServiceLink(row.original, row.id)}>
                {t('Service.GoToLabel')}
              </IconActionsButton>
            </IconActions>
          </div>
        );
      },
    },
  ];

  const queryData = useLazyLoadQuery<serviceQuery>(ServiceListQuery, {
    count: 50,
    orderBy: 'name',
    orderMode: 'asc',
  });
  const [data] = useRefetchableFragment<
    serviceQuery,
    servicesList_services$key
  >(servicesListFragment, queryData);
  const serviceData = data?.serviceInstances?.edges.map(
    (service) => service.node as serviceList_fragment$data
  );
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1>{t('MenuLinks.Services')}</h1>
      <DataTable
        columns={columns}
        i18nKey={i18nKey(t)}
        data={serviceData}
        tableOptions={{
          getSortedRowModel: getSortedRowModel(),
        }}
      />
    </>
  );
};

export default Page;
