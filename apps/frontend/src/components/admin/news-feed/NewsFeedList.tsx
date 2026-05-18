'use client';
import {
  DeleteNewsFeedItemMutation,
  newsFeedItemFragment,
  newsFeedListFragment,
  NewsFeedListQuery,
} from '@/components/admin/news-feed/news-feed.graphql';
import { AlertDialogComponent } from '@/components/ui/AlertDialog';
import { IconActions, IconActionsItem } from '@/components/ui/IconActions';
import { i18nKey } from '@/utils/datatable';
import { formatDate } from '@/utils/date';
import { MoreVertIcon } from '@filigran/icon';
import { DataTable, toast } from '@filigran/ui';
import { Badge } from '@filigran/ui/servers';
import { newsFeedDeleteMutation } from '@generated/newsFeedDeleteMutation.graphql';
import {
  newsFeedItem_fragment$data,
  newsFeedItem_fragment$key,
} from '@generated/newsFeedItem_fragment.graphql';
import { newsFeedList_fragment$key } from '@generated/newsFeedList_fragment.graphql';
import { newsFeedListQuery } from '@generated/newsFeedListQuery.graphql';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import {
  readInlineData,
  useLazyLoadQuery,
  useMutation,
  useRefetchableFragment,
} from 'react-relay';

const DEFAULT_PAGE_SIZE = 25;

const NewsFeedList = () => {
  const t = useTranslations();
  const [deleteTarget, setDeleteTarget] = useState<
    newsFeedItem_fragment$data | undefined
  >(undefined);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const queryData = useLazyLoadQuery<newsFeedListQuery>(NewsFeedListQuery, {
    count: DEFAULT_PAGE_SIZE,
  });

  const [data, refetch] = useRefetchableFragment<
    newsFeedListQuery,
    newsFeedList_fragment$key
  >(newsFeedListFragment, queryData);

  const [deleteNewsFeedItem, isDeleteInFlight] =
    useMutation<newsFeedDeleteMutation>(DeleteNewsFeedItemMutation);

  const newsFeedData = useMemo<newsFeedItem_fragment$data[]>(
    () =>
      (data?.newsFeedItems?.edges || []).map(({ node }) =>
        readInlineData<newsFeedItem_fragment$key>(newsFeedItemFragment, node)
      ),
    [data]
  );

  const handleRefetchData = (
    args?: Partial<{ count: number; cursor: string }>
  ) => {
    refetch(
      {
        count: pagination.pageSize,
        cursor: btoa(String(pagination.pageSize * pagination.pageIndex)),
        ...args,
      },
      { fetchPolicy: 'store-and-network' }
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
  };

  const handleDelete = (item: newsFeedItem_fragment$data) => {
    deleteNewsFeedItem({
      variables: { id: item.id },
      onCompleted: () => {
        toast({
          title: t('NewsFeedAdminPage.DeleteSuccess', { title: item.title }),
        });
        setDeleteTarget(undefined);
        handleRefetchData();
      },
      onError: () => {
        toast({
          variant: 'destructive',
          title: t('NewsFeedAdminPage.DeleteError'),
        });
        setDeleteTarget(undefined);
      },
    });
  };

  const columns: ColumnDef<newsFeedItem_fragment$data>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        id: 'title',
        header: t('NewsFeedAdminPage.Title'),
        cell: ({ row }) => (
          <span className="truncate">{row.original.title}</span>
        ),
      },
      {
        accessorKey: 'creation_date',
        id: 'creation_date',
        header: t('NewsFeedAdminPage.CreationDate'),
        cell: ({ row }) => (
          <span>{formatDate(row.original.creation_date)}</span>
        ),
      },
      {
        accessorKey: 'tags',
        id: 'tags',
        header: t('NewsFeedAdminPage.Tags'),
        cell: ({ row }) => (
          <span className="truncate">{row.original.tags.join(', ')}</span>
        ),
      },
      {
        accessorKey: 'is_deleted',
        id: 'is_deleted',
        header: t('NewsFeedAdminPage.IsDeleted'),
        cell: ({ row }) =>
          row.original.is_deleted ? (
            <Badge variant="destructive">
              {t('NewsFeedAdminPage.IsDeletedYes')}
            </Badge>
          ) : null,
      },
      {
        id: 'actions',
        size: 100,
        enableHiding: false,
        enableSorting: false,
        enableResizing: false,
        cell: ({ row }) =>
          row.original.is_deleted ? null : (
            <div className="flex items-center justify-end">
              <IconActions
                icon={
                  <>
                    <MoreVertIcon className="h-4 w-4 text-primary" />
                    <span className="sr-only">{t('Utils.OpenMenu')}</span>
                  </>
                }>
                <IconActionsItem onClick={() => setDeleteTarget(row.original)}>
                  {t('NewsFeedAdminPage.Delete')}
                </IconActionsItem>
              </IconActions>
            </div>
          ),
      },
    ],
    [t]
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={newsFeedData}
        i18nKey={i18nKey(t)}
        tableOptions={{
          onPaginationChange,
          manualPagination: true,
          rowCount: data.newsFeedItems.totalCount,
        }}
        tableState={{ pagination, columnPinning: { right: ['actions'] } }}
      />
      {deleteTarget && (
        <AlertDialogComponent
          isOpen={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(undefined)}
          AlertTitle={t('NewsFeedAdminPage.DeleteDialog.Title')}
          actionButtonText={t('NewsFeedAdminPage.DeleteDialog.Confirm')}
          variantName="destructive"
          onClickContinue={() => handleDelete(deleteTarget)}
          continueButtonDisabled={isDeleteInFlight}>
          {t('NewsFeedAdminPage.DeleteDialog.Text', {
            title: deleteTarget.title,
          })}
        </AlertDialogComponent>
      )}
    </>
  );
};

export default NewsFeedList;
