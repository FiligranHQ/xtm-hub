'use client';
import { DocumentsListQuery } from '@/components/service/document/document.graphql';
import DocumentList from '@/components/service/vault/[slug]/DocumentList';
import { documentListLocalStorage } from '@/components/service/vault/document-list-localstorage';
import { i18nKey } from '@/utils/datatable';
import { formatDate } from '@/utils/date';
import { DataTable } from '@filigran/ui';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect } from 'react';

import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { documentsQuery } from '@generated/documentsQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { useQueryLoader } from 'react-relay';

import { useTranslate } from '@tolgee/react';
interface PreloaderProps {
  serviceInstance: serviceInstance_fragment$data;
}
const PageLoader = ({ serviceInstance }: PreloaderProps) => {
  const { t } = useTranslate();

  const columns: ColumnDef<documentItem_fragment$data>[] = [
    {
      accessorKey: 'file_name',
      id: 'file_name',
      header: t('Service_Vault_FileTab_FileName'),
    },
    {
      accessorKey: 'description',
      id: 'description',
      size: 300,
      header: t('Service_Vault_FileTab_Description'),
    },
    {
      id: 'created_at',
      header: t('Service_Vault_FileTab_UploadDate'),
      cell: ({ row }) => <>{formatDate(row.original.created_at)}</>,
    },
    {
      accessorKey: 'download_number',
      id: 'download_number',
      size: 40,
      header: t('Service_Vault_FileTab_NumberDownload'),
    },
  ];

  const [queryRef, loadQuery] =
    useQueryLoader<documentsQuery>(DocumentsListQuery);
  const { count, orderBy, orderMode } = documentListLocalStorage(columns);

  useEffect(() => {
    const variablesValues = JSON.stringify({
      count,
      orderBy,
      orderMode,
      serviceInstanceId: serviceInstance.id,
    });
    loadQuery(JSON.parse(variablesValues), {
      fetchPolicy: 'store-and-network',
    });
  }, [loadQuery, count, orderBy, orderMode, serviceInstance.id]);

  return (
    <>
      {queryRef ? (
        <DocumentList
          serviceInstance={serviceInstance}
          queryRef={queryRef}
        />
      ) : (
        <DataTable
          i18nKey={i18nKey(t)}
          data={[]}
          columns={columns}
          isLoading={true}
        />
      )}
    </>
  );
};

// Component export
export default PageLoader;
