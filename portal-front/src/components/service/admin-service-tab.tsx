'use client';

import { EditService } from '@/components/service/edit-service';
import { IconActions, IconActionsLink } from '@/components/ui/icon-actions';
import { i18nKey } from '@/utils/datatable';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { ColumnDef, getSortedRowModel } from '@tanstack/react-table';
import { MoreVertIcon } from 'filigran-icon';
import { DataTable } from 'filigran-ui';
import { useTranslations } from 'next-intl';

interface AdminServiceTabProps {
  serviceData: serviceList_fragment$data[];
}

const AdminServiceTab = ({ serviceData }: AdminServiceTabProps) => {
  const t = useTranslations();

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
                <IconActionsLink href={`/app/admin/service/${row.id}`}>
                  {t('Service.GoToAdminLabel')}
                </IconActionsLink>
              )}
              <EditService service={row.original} />
            </IconActions>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      i18nKey={i18nKey(t)}
      data={serviceData}
      tableOptions={{
        getSortedRowModel: getSortedRowModel(),
      }}
    />
  );
};
export default AdminServiceTab;
