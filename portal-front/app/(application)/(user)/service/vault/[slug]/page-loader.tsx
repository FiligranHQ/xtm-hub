'use client';

import { ServiceById } from '@/components/service/service.graphql';
import DocumentList from '@/components/service/vault/[slug]/document-list';
import { documentListLocalStorage } from '@/components/service/vault/document-list-localstorage';
import { DocumentsListQuery } from '@/components/service/vault/document.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';
import { FormatDate } from '@/utils/date';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from 'filigran-ui/clients';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { useQueryLoader } from 'react-relay';
import { documentItem_fragment$data } from '../../../../../../__generated__/documentItem_fragment.graphql';
import { documentsQuery } from '../../../../../../__generated__/documentsQuery.graphql';
import { serviceByIdQuery } from '../../../../../../__generated__/serviceByIdQuery.graphql';
interface PreloaderProps {}

const PageLoader: React.FunctionComponent<PreloaderProps> = ({}) => {
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

  const params = useParams<{ slug: string }>();
  const encodedServiceId = params.slug;

  // Have to decode it, otherwise = become %3D for instance
  const serviceId = encodedServiceId
    ? decodeURIComponent(encodedServiceId)
    : null;
  const [queryRef, loadQuery] =
    useQueryLoader<documentsQuery>(DocumentsListQuery);
  const { count, orderBy, orderMode } = documentListLocalStorage(columns);
  const [readyToLoad, setReadyToLoad] = useState(false);

  const [queryRefService, loadQueryService] =
    useQueryLoader<serviceByIdQuery>(ServiceById);
  useMountingLoader(loadQueryService, { service_id: serviceId });

  useEffect(() => {
    if (serviceId) {
      setReadyToLoad(true);
    }
  }, [serviceId]);

  useEffect(() => {
    if (readyToLoad) {
      const variablesValues = JSON.stringify({
        count,
        orderBy,
        orderMode,
        serviceId,
      });
      loadQuery(JSON.parse(variablesValues), {
        fetchPolicy: 'store-and-network',
      });
    }
  }, [readyToLoad, loadQuery, count, orderBy, orderMode, serviceId]);

  return (
    <>
      {queryRef && serviceId && queryRefService ? (
        <DocumentList
          queryRefService={queryRefService}
          queryRef={queryRef}
        />
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
