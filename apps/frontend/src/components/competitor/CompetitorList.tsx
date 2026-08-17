'use client';
import { i18nKey } from '@/utils/datatable';
import { DeleteIcon, EditIcon } from '@filigran/icon';
import { Button, DataTable, DataTableHeadBarOptions } from '@filigran/ui';
import { CompetitorTier } from '@graphql/generated';
import {
  ColumnDef,
  PaginationState,
  SortingState,
  Updater,
} from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import {
  readInlineData,
  useLazyLoadQuery,
  useMutation,
  useRefetchableFragment,
} from 'react-relay';

import {
  CompetitorDeleteMutation,
  competitorFragment,
  competitorListFragment,
  CompetitorListQuery,
} from '@/components/competitor/competitor.graphql';

import ManageCompetitor from '@/components/competitor/ManageCompetitor';
import { useCompetitorListLocalstorage } from '@/components/competitor/competitor-localstorage';
import { formatTier } from '@/components/competitor/competitor.utils';
import { AlertDialogComponent } from '@/components/ui/AlertDialog';
import {
  handleSortingChange,
  mapToSortingTableValue,
  transformSortingValueToParams,
} from '@/components/ui/handle-sorting.utils';
import {
  competitorListQuery,
  competitorListQuery$variables,
} from '@generated/competitorListQuery.graphql';
import {
  competitor_fragment$data,
  competitor_fragment$key,
} from '@generated/competitor_fragment.graphql';
import { competitor_list_fragment$key } from '@generated/competitor_list_fragment.graphql';

import { useTranslate } from '@tolgee/react';
const CompetitorList = () => {
  const { t } = useTranslate();
  const [editRow, setEditRow] = useState<competitor_fragment$data | undefined>(
    undefined
  );

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [deleteCompetitor] = useMutation(CompetitorDeleteMutation);

  const {
    pageSize,
    setPageSize,
    orderMode,
    setOrderMode,
    orderBy,
    setOrderBy,
    resetAll,
    removeOrder,
  } = useCompetitorListLocalstorage();

  const queryData = useLazyLoadQuery<competitorListQuery>(CompetitorListQuery, {
    count: pageSize,
    orderBy,
    orderMode,
  });

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const [data, refetch] = useRefetchableFragment<
    competitorListQuery,
    competitor_list_fragment$key
  >(competitorListFragment, queryData);

  const connectionID = data.competitors.__id;

  const competitorsData = useMemo<competitor_fragment$data[]>(
    () =>
      (data?.competitors?.edges || []).map(({ node }) =>
        readInlineData<competitor_fragment$key>(competitorFragment, node)
      ),
    [data]
  );

  const columns: ColumnDef<competitor_fragment$data>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        id: 'name',
        header: t('CompetitorListPage_Name'),
        cell: ({ row }) => (
          <span className="truncate">{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'tier',
        id: 'tier',
        header: t('CompetitorListPage_Tier'),
        cell: ({ row }) => (
          <span className="truncate">
            {formatTier(row.original.tier as CompetitorTier)}
          </span>
        ),
      },
      {
        accessorKey: 'domain',
        id: 'domain',
        header: t('CompetitorListPage_Domain'),
        cell: ({ row }) => (
          <span className="truncate">{row.original.domain}</span>
        ),
      },
      {
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-s">
            <Button
              variant="tertiary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setEditRow(row.original);
                setOpenEdit(true);
              }}>
              <EditIcon className="h-4 w-4" />
              <span className="sr-only">{t('CompetitorListPage_Edit')}</span>
            </Button>
            <AlertDialogComponent
              AlertTitle={t('CompetitorListPage_DeleteDialog_Title')}
              actionButtonText={t('CompetitorListPage_Delete')}
              variantName="destructive"
              triggerElement={
                <Button
                  variant="tertiary-destructive"
                  size="sm">
                  <DeleteIcon className="h-4 w-4" />
                  <span className="sr-only">
                    {t('CompetitorListPage_Delete')}
                  </span>
                </Button>
              }
              onClickContinue={(e) => {
                e.stopPropagation();
                deleteCompetitor({
                  variables: {
                    id: row.original.id,
                    connections: [connectionID ?? ''],
                  },
                });
              }}>
              {t('CompetitorListPage_DeleteDialog_Text', {
                name: row.original.name,
              })}
            </AlertDialogComponent>
          </div>
        ),
      },
    ],
    [t, connectionID, deleteCompetitor]
  );

  const handleRefetchData = useCallback(
    (args?: Partial<competitorListQuery$variables>) => {
      const sorting = mapToSortingTableValue(orderBy, orderMode);
      refetch({
        count: pagination.pageSize,
        cursor: btoa(String(pagination.pageSize * pagination.pageIndex)),
        orderBy,
        orderMode,
        ...transformSortingValueToParams(sorting),
        ...args,
      });
    },
    [orderBy, orderMode, pagination, refetch]
  );

  const onSortingChange = useCallback(
    (updater: Updater<SortingState>) => {
      handleSortingChange({
        updater,
        removeOrder,
        setOrderBy,
        setOrderMode,
        orderBy,
        orderMode,
        handleRefetchData,
      });
    },
    [
      handleRefetchData,
      orderBy,
      orderMode,
      removeOrder,
      setOrderBy,
      setOrderMode,
    ]
  );

  const onPaginationChange = useCallback(
    (updater: Updater<PaginationState>) => {
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
    },
    [handleRefetchData, pageSize, pagination, setPageSize]
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={competitorsData}
        i18nKey={i18nKey(t)}
        onResetTable={resetAll}
        tableOptions={{
          onSortingChange,
          onPaginationChange,
          manualSorting: true,
          manualPagination: true,
          rowCount: data.competitors.totalCount,
        }}
        tableState={{
          sorting: mapToSortingTableValue(orderBy, orderMode),
          pagination,
          columnPinning: {
            right: ['actions'],
          },
        }}
        toolbar={
          <div className="flex w-full items-center justify-end gap-s">
            <DataTableHeadBarOptions />
            <Button onClick={() => setOpenAdd(true)}>
              {t('CompetitorListPage_AddCompetitor')}
            </Button>
          </div>
        }
      />
      <ManageCompetitor
        connectionId={connectionID}
        open={openAdd}
        setOpen={setOpenAdd}
      />
      {editRow && (
        <ManageCompetitor
          competitor={editRow}
          connectionId={connectionID}
          open={openEdit}
          setOpen={setOpenEdit}
        />
      )}
    </>
  );
};

export default CompetitorList;
