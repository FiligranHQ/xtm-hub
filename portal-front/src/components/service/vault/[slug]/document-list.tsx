import GuardCapacityComponent from '@/components/admin-guard';
import { ServiceById } from '@/components/service/service.graphql';
import DeleteDocument from '@/components/service/vault/delete-document';
import { documentListLocalStorage } from '@/components/service/vault/document-list-localstorage';
import {
  DocumentsListQuery,
  documentsFragment,
} from '@/components/service/vault/document.graphql';
import DownloadDocument from '@/components/service/vault/download-document';
import EditDocument from '@/components/service/vault/edit-document';
import { VaultForm } from '@/components/service/vault/vault-form';
import VisualizeDocument from '@/components/service/vault/visualize-document';
import {
  mapToSortingTableValue,
  transformSortingValueToParams,
} from '@/components/ui/handle-sorting.utils';
import { IconActions } from '@/components/ui/icon-actions';
import useDecodedParams from '@/hooks/useDecodedParams';
import { DEBOUNCE_TIME, RESTRICTION } from '@/utils/constant';
import { i18nKey } from '@/utils/datatable';
import { FormatDate } from '@/utils/date';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { MoreVertIcon } from 'filigran-icon';
import {
  Button,
  DataTable,
  DataTableHeadBarOptions,
  Input,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import * as React from 'react';
import { useState } from 'react';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';
import { useDebounceCallback } from 'usehooks-ts';
import { documentItem_fragment$data } from '../../../../../__generated__/documentItem_fragment.graphql';
import { documentsList$key } from '../../../../../__generated__/documentsList.graphql';
import {
  DocumentOrdering,
  OrderingMode,
  documentsQuery,
  documentsQuery$variables,
} from '../../../../../__generated__/documentsQuery.graphql';
import { serviceByIdQuery } from '../../../../../__generated__/serviceByIdQuery.graphql';

interface ServiceProps {
  queryRef: PreloadedQuery<documentsQuery>;
  queryRefService: PreloadedQuery<serviceByIdQuery>;
}

const DocumentList: React.FunctionComponent<ServiceProps> = ({
  queryRef,
  queryRefService,
}) => {
  const queryData = usePreloadedQuery<documentsQuery>(
    DocumentsListQuery,
    queryRef
  );
  const { slug } = useDecodedParams();
  const t = useTranslations();
  const [data, refetch] = useRefetchableFragment<
    documentsQuery,
    documentsList$key
  >(documentsFragment, queryData);

  const queryDataService = usePreloadedQuery<serviceByIdQuery>(
    ServiceById,
    queryRefService
  );

  const canManageService =
    queryDataService.serviceInstanceById?.capabilities.includes(
      'MANAGE_ACCESS'
    );

  const documentData: documentItem_fragment$data[] = data.documents.edges.map(
    ({ node }) =>
      ({
        ...node,
      }) as documentItem_fragment$data
  );

  const columns: ColumnDef<documentItem_fragment$data>[] = [
    {
      accessorKey: 'file_name',
      id: 'file_name',
      header: t('Service.Vault.FileTab.FileName'),
      size: 250,
    },
    {
      id: 'description',
      header: t('Service.Vault.FileTab.Description'),
      size: -1,
      cell: ({ row }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className={'w-full truncate text-left'}>
              {row.original.description}
            </TooltipTrigger>
            <TooltipContent className={'max-w-lg'}>
              <p>{row.original.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      id: 'created_at',
      header: t('Service.Vault.FileTab.UploadDate'),
      size: 100,
      cell: ({ row }) => <>{FormatDate(row.original.created_at)}</>,
    },
    {
      accessorKey: 'download_number',
      id: 'download_number',
      size: 50,
      header: t('Service.Vault.FileTab.NumberDownload'),
    },
    {
      id: 'actions',
      enableHiding: false,
      enableSorting: false,
      enableResizing: false,
      size: 48,
      cell: ({ row }) => (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-end">
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
            <GuardCapacityComponent
              capacityRestriction={[RESTRICTION.CAPABILITY_BYPASS]}
              displayError={false}>
              <EditDocument documentData={row.original} />
            </GuardCapacityComponent>
            <DownloadDocument documentData={row.original} />
            <VisualizeDocument documentData={row.original} />
            <GuardCapacityComponent
              capacityRestriction={[RESTRICTION.CAPABILITY_BYPASS]}
              displayError={false}>
              <DeleteDocument
                documentData={row.original}
                connectionId={data.documents.__id}
              />
            </GuardCapacityComponent>
          </IconActions>
        </div>
      ),
    },
  ];

  const {
    pageSize,
    setPageSize,
    orderMode,
    setOrderMode,
    orderBy,
    setOrderBy,
    columnOrder,
    setColumnOrder,
    columnVisibility,
    setColumnVisibility,
    resetAll,
  } = documentListLocalStorage(columns);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const handleRefetchData = (args?: Partial<documentsQuery$variables>) => {
    const sorting = mapToSortingTableValue(orderBy, orderMode);
    refetch({
      count: pagination.pageSize,
      cursor: btoa(String(pagination.pageSize * pagination.pageIndex)),
      orderBy,
      orderMode,
      ...transformSortingValueToParams(sorting),
      ...args,
    });
  };

  const onSortingChange = (updater: unknown) => {
    const sorting = mapToSortingTableValue(orderBy, orderMode);
    const newSortingValue =
      updater instanceof Function ? updater(sorting) : updater;
    setOrderBy(newSortingValue[0].id);
    setOrderMode(newSortingValue[0].desc ? 'desc' : 'asc');
    handleRefetchData(
      transformSortingValueToParams<DocumentOrdering, OrderingMode>(
        newSortingValue
      )
    );
  };

  const onPaginationChange = (updater: unknown) => {
    const newPaginationValue: PaginationState =
      updater instanceof Function ? updater(pagination) : updater;
    handleRefetchData({
      count: newPaginationValue.pageSize,
      cursor: btoa(
        String(newPaginationValue.pageSize * newPaginationValue.pageIndex)
      ),
    });
    setPagination(newPaginationValue);
    if (newPaginationValue.pageSize !== pageSize) {
      setPageSize(newPaginationValue.pageSize);
    }
  };

  const handleInputChange = (inputValue: string) => {
    refetch({
      filter: inputValue,
    });
  };

  const debounceHandleInput = useDebounceCallback(
    (e) => handleInputChange(e.target.value),
    DEBOUNCE_TIME
  );

  return (
    <>
      <h1 className="pb-s">{queryDataService.serviceInstanceById?.name}</h1>

      <DataTable
        i18nKey={i18nKey(t)}
        columns={columns}
        data={documentData}
        onResetTable={resetAll}
        tableOptions={{
          onSortingChange: onSortingChange,
          onPaginationChange: onPaginationChange,
          onColumnOrderChange: setColumnOrder,
          onColumnVisibilityChange: setColumnVisibility,
          manualSorting: true,
          manualPagination: true,
          rowCount: data.documents.totalCount,
        }}
        onClickRow={(row) => {
          const url = `/document/visualize/${queryDataService.serviceInstanceById?.id}/${row.id}`;
          window.open(url, '_blank', 'noopener,noreferrer');
        }}
        toolbar={
          <div className="flex-col-reverse sm:flex-row flex items-center justify-between gap-s">
            <Input
              className="w-full sm:w-1/3"
              placeholder={t('Service.Vault.FileTab.Search')}
              onChange={debounceHandleInput}
            />
            <div className="justify-between flex w-full sm:w-auto items-center gap-s">
              <DataTableHeadBarOptions />

              {canManageService && (
                <Button
                  asChild
                  variant="outline">
                  <Link href={`/manage/service/${slug}`}>
                    {t('Service.Vault.ManageVault')}
                  </Link>
                </Button>
              )}
              <VaultForm connectionId={data?.documents?.__id} />
            </div>
          </div>
        }
        tableState={{
          sorting: mapToSortingTableValue(orderBy, orderMode),
          pagination,
          columnOrder,
          columnVisibility,
          columnPinning: {
            right: ['actions'],
          },
        }}
      />
    </>
  );
};

export default DocumentList;
