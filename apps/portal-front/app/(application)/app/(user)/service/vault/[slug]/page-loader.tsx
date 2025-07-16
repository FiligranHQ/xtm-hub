'use client';

import { DocumentsListQuery } from '@/components/service/document/document.graphql';
import { ServiceById } from '@/components/service/service.graphql';
import DocumentList from '@/components/service/vault/[slug]/document-list';
import { documentListLocalStorage } from '@/components/service/vault/document-list-localstorage';
import useMountingLoader from '@/hooks/useMountingLoader';
import { i18nKey } from '@/utils/datatable';
import { formatDate } from '@/utils/date';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useEffect, useState } from 'react';

import useDecodedParams from '@/hooks/useDecodedParams';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { documentsQuery } from '@generated/documentsQuery.graphql';
import { serviceByIdQuery } from '@generated/serviceByIdQuery.graphql';
import { useQueryLoader } from 'react-relay';

const PageLoader: React.FunctionComponent = ({}) => {
  const t = useTranslations();

  const columns: ColumnDef<documentItem_fragment$data>[] = [
    {
      accessorKey: 'file_name',
      id: 'file_name',
      header: t('Service.Vault.FileTab.FileName'),
    },
    {
      accessorKey: 'description',
      id: 'description',
      size: 300,
      header: t('Service.Vault.FileTab.Description'),
    },
    {
      id: 'created_at',
      header: t('Service.Vault.FileTab.UploadDate'),
      cell: ({ row }) => <>{formatDate(row.original.created_at)}</>,
    },
    {
      accessorKey: 'download_number',
      id: 'download_number',
      size: 40,
      header: t('Service.Vault.FileTab.NumberDownload'),
    },
  ];

  const { slug } = useDecodedParams();
  const [queryRef, loadQuery] =
    useQueryLoader<documentsQuery>(DocumentsListQuery);
  const { count, orderBy, orderMode } = documentListLocalStorage(columns);
  const [readyToLoad, setReadyToLoad] = useState(false);

  const [queryRefService, loadQueryService] =
    useQueryLoader<serviceByIdQuery>(ServiceById);
  useMountingLoader(loadQueryService, { service_instance_id: slug });

  useEffect(() => {
    if (slug) {
      setReadyToLoad(true);
    }
  }, [slug]);

  useEffect(() => {
    if (readyToLoad) {
      const variablesValues = JSON.stringify({
        count,
        orderBy,
        orderMode,
        serviceInstanceId: slug,
      });
      loadQuery(JSON.parse(variablesValues), {
        fetchPolicy: 'store-and-network',
      });
    }
  }, [readyToLoad, loadQuery, count, orderBy, orderMode, slug]);

  return (
    <>
      {queryRef && slug && queryRefService ? (
        <DocumentList
          queryRefService={queryRefService}
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
