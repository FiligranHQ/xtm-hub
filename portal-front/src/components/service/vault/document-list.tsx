import { documentListLocalStorage } from '@/components/service/vault/document-list-localstorage';
import {
  DocumentsListQuery,
  documentsFragment,
} from '@/components/service/vault/document.graphql';
import { VaultForm } from '@/components/service/vault/vault-form';
import {
  mapToSortingTableValue,
  transformSortingValueToParams,
} from '@/components/ui/handle-sorting.utils';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { DataTable, DataTableHeadBarOptions } from 'filigran-ui/clients';
import { Input } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useState } from 'react';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';
import { documentItem_fragment$data } from '../../../../__generated__/documentItem_fragment.graphql';
import { documentsList$key } from '../../../../__generated__/documentsList.graphql';
import {
  DocumentOrdering,
  OrderingMode,
  documentsQuery,
  documentsQuery$variables,
} from '../../../../__generated__/documentsQuery.graphql';
interface ServiceProps {
  queryRef: PreloadedQuery<documentsQuery>;
  columns: ColumnDef<documentItem_fragment$data>[];
}

const DocumentList: React.FunctionComponent<ServiceProps> = ({
  queryRef,
  columns,
}) => {
  const queryData = usePreloadedQuery<documentsQuery>(
    DocumentsListQuery,
    queryRef
  );
  const t = useTranslations();
  const [data, refetch] = useRefetchableFragment<
    documentsQuery,
    documentsList$key
  >(documentsFragment, queryData);

  const documentData: documentItem_fragment$data[] = data.documents.edges.map(
    ({ node }) =>
      ({
        ...node,
      }) as documentItem_fragment$data
  );

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

  return (
    <DataTable
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
      toolbar={
        <div className="flex-col-reverse sm:flex-row flex items-center justify-between gap-s">
          <Input
            className="w-full sm:w-1/3"
            placeholder={t('Service.Vault.FileTab.Search')}
            onChange={(e) => handleInputChange(e.target.value)}
          />
          <div className="justify-between flex w-full sm:w-auto items-center gap-s">
            <DataTableHeadBarOptions />
            <VaultForm connectionId={data?.documents?.__id} />
          </div>
        </div>
      }
      tableState={{
        sorting: mapToSortingTableValue(orderBy, orderMode),
        pagination,
        columnOrder,
        columnVisibility,
      }}
    />
  );
};

export default DocumentList;
