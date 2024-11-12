'use client';

import DocumentList from '@/components/service/vault/document-list';
import { documentListLocalStorage } from '@/components/service/vault/document-list-localstorage';
import { DocumentsListQuery } from '@/components/service/vault/document.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';
import { FormatDate } from '@/utils/date';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from 'filigran-ui/clients';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import { documentItem_fragment$data } from '../../../../../__generated__/documentItem_fragment.graphql';
import { documentsQuery } from '../../../../../__generated__/documentsQuery.graphql';

interface PreloaderProps {}

const PageLoader: React.FunctionComponent<PreloaderProps> = () => {
  const t = useTranslations();

  const columns: ColumnDef<documentItem_fragment$data>[] = [
    {
      accessorKey: 'file_name',
      id: 'file_name',
      header: t('Service.Vault.FileTab.FileName'),
    },
    {
      id: 'created_at',
      header: t('Service.Vault.FileTab.UploadDate'),
      cell: ({ row }) => <>{FormatDate(row.original.created_at)}</>,
    },
    {
      accessorKey: 'description',
      id: 'description',
      header: t('Service.Vault.FileTab.Description'),
    },
    {
      id: 'actions',
      size: 100,
      enableHiding: false,
      enableSorting: false,
      enableResizing: false,
      cell: ({ row }) => ({}),
    },
  ];

  const [queryRef, loadQuery] =
    useQueryLoader<documentsQuery>(DocumentsListQuery);
  const { count, orderBy, orderMode } = documentListLocalStorage(columns);
  useMountingLoader(loadQuery, { count, orderBy, orderMode });
  return (
    <>
      <h1 className="pb-s">{t('Service.Vault.Vault')}</h1>
      {queryRef ? (
        <DocumentList queryRef={queryRef} />
      ) : (
        <DataTable
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
