'use client';
import {
  DeleteNewsFeedItemMutation,
  newsFeedItemFragment,
  newsFeedListFragment,
  NewsFeedListQuery,
} from '@/components/admin/news-feed/news-feed.graphql';
import { AlertDialogComponent } from '@/components/ui/AlertDialog';
import BadgeOverflowCounter from '@/components/ui/BadgeOverflowCounter';
import { IconActions, IconActionsItem } from '@/components/ui/IconActions';
import { i18nKey } from '@/utils/datatable';
import { formatDate } from '@/utils/date';
import { localizedCardName } from '@/utils/services';
import { ServiceSlug } from '@/utils/shareable-resources/shareable-resources.types';
import { MoreVertIcon } from '@filigran/icon';
import { DataTable, toast } from '@filigran/ui';
import { Badge } from '@filigran/ui/servers';
import { newsFeedDeleteMutation } from '@generated/newsFeedDeleteMutation.graphql';
import {
  newsFeedItem_fragment$data,
  newsFeedItem_fragment$key,
  NewsFeedItemType,
} from '@generated/newsFeedItem_fragment.graphql';
import { newsFeedList_fragment$key } from '@generated/newsFeedList_fragment.graphql';
import { newsFeedListQuery } from '@generated/newsFeedListQuery.graphql';
import { NewsFeedItemMetadataKey } from '@graphql/generated';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  readInlineData,
  useLazyLoadQuery,
  useMutation,
  useRefetchableFragment,
} from 'react-relay';

import { useTranslate } from '@tolgee/react';
const DEFAULT_PAGE_SIZE = 25;

const getUrlPath = (item: newsFeedItem_fragment$data): string | undefined =>
  item.metadata.find((m) => m.key === NewsFeedItemMetadataKey.UrlPath)?.value ??
  undefined;

const NEWS_FEED_TYPE_TO_SERVICE_SLUG: Record<NewsFeedItemType, ServiceSlug> = {
  RESOURCE_CUSTOM_DASHBOARD: ServiceSlug.OPEN_CTI_CUSTOM_DASHBOARDS,
  RESOURCE_PLAYBOOK: ServiceSlug.OPEN_CTI_PLAYBOOKS,
  RESOURCE_CUSTOM_VIEW: ServiceSlug.OPEN_CTI_CUSTOM_VIEWS,
};

const NewsFeedList = () => {
  const { t } = useTranslate();
  const router = useRouter();
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
          title: t('NewsFeedAdminPage_DeleteSuccess', { title: item.title }),
        });
        setDeleteTarget(undefined);
        handleRefetchData();
      },
      onError: () => {
        toast({
          variant: 'destructive',
          title: t('NewsFeedAdminPage_DeleteError'),
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
        header: t('NewsFeedAdminPage_Title'),
        cell: ({ row }) => (
          <span className="truncate">{row.original.title}</span>
        ),
      },
      {
        accessorKey: 'type',
        id: 'library',
        header: t('NewsFeedAdminPage_Library'),
        cell: ({ row }) => {
          const slug = NEWS_FEED_TYPE_TO_SERVICE_SLUG[row.original.type];
          return <span>{localizedCardName({ slug, name: slug }, t)}</span>;
        },
      },
      {
        accessorKey: 'creation_date',
        id: 'creation_date',
        header: t('NewsFeedAdminPage_CreationDate'),
        cell: ({ row }) => (
          <span>{formatDate(row.original.creation_date)}</span>
        ),
      },
      {
        accessorKey: 'tags',
        id: 'tags',
        header: t('NewsFeedAdminPage_Tags'),
        cell: ({ row }) => (
          <BadgeOverflowCounter
            badges={row.original.tags.map((tag) => ({
              id: `${row.original.id}-${tag}`,
              name: tag,
            }))}
          />
        ),
      },
      {
        accessorKey: 'is_deleted',
        id: 'is_deleted',
        header: t('NewsFeedAdminPage_IsDeleted'),
        cell: ({ row }) =>
          row.original.is_deleted ? (
            <Badge variant="destructive">
              {t('NewsFeedAdminPage_IsDeletedYes')}
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
            <div
              className="flex items-center justify-end"
              onClick={(e) => e.stopPropagation()}>
              <IconActions
                icon={
                  <>
                    <MoreVertIcon className="h-4 w-4 text-primary" />
                    <span className="sr-only">{t('Utils_OpenMenu')}</span>
                  </>
                }>
                <IconActionsItem onClick={() => setDeleteTarget(row.original)}>
                  {t('NewsFeedAdminPage_Delete')}
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
        onClickRow={(row) => {
          const urlPath = getUrlPath(row.original);
          if (urlPath) {
            router.push(`/${urlPath}`);
          }
        }}
      />
      {deleteTarget && (
        <AlertDialogComponent
          isOpen={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(undefined)}
          AlertTitle={t('NewsFeedAdminPage_DeleteDialog_Title')}
          actionButtonText={t('NewsFeedAdminPage_DeleteDialog_Confirm')}
          variantName="destructive"
          onClickContinue={() => handleDelete(deleteTarget)}
          continueButtonDisabled={isDeleteInFlight}>
          {t('NewsFeedAdminPage_DeleteDialog_Text', {
            title: deleteTarget.title,
          })}
        </AlertDialogComponent>
      )}
    </>
  );
};

export default NewsFeedList;
