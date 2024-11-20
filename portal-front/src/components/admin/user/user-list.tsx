import GuardCapacityComponent from '@/components/admin-guard';
import { DeleteUserAction } from '@/components/admin/user/delete-user-action';
import { CreateUser } from '@/components/admin/user/user-create';
import { useUserListLocalstorage } from '@/components/admin/user/user-list-localstorage';
import {
  UserListQuery,
  userListFragment,
} from '@/components/admin/user/user.graphql';
import {
  mapToSortingTableValue,
  transformSortingValueToParams,
} from '@/components/ui/handle-sorting.utils';
import { IconActions, IconActionsButton } from '@/components/ui/icon-actions';
import { RESTRICTION } from '@/utils/constant';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { MoreVertIcon } from 'filigran-icon';
import { DataTable, DataTableHeadBarOptions } from 'filigran-ui/clients';
import { Input } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';
import { user_fragment$data } from '../../../../__generated__/user_fragment.graphql';
import { userList_users$key } from '../../../../__generated__/userList_users.graphql';
import {
  OrderingMode,
  UserOrdering,
  userQuery,
  userQuery$variables,
} from '../../../../__generated__/userQuery.graphql';

// Component
const UserList = () => {
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
  } = useUserListLocalstorage();

  const t = useTranslations();
  const router = useRouter();

  const queryData = useLazyLoadQuery<userQuery>(UserListQuery, {
    count: pageSize,
    orderMode: orderMode,
    orderBy: orderBy,
  });

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const [data, refetch] = useRefetchableFragment<userQuery, userList_users$key>(
    userListFragment,
    queryData
  );

  const columns: ColumnDef<user_fragment$data>[] = [
    {
      accessorKey: 'first_name',
      id: 'first_name',
      header: 'First name',
    },
    {
      accessorKey: 'last_name',
      id: 'last_name',
      header: 'Last name',
    },
    {
      accessorKey: 'email',
      id: 'email',
      header: 'Email',
      cell: ({ row }) => {
        return <span className="truncate">{row.original.email}</span>;
      },
    },
    {
      id: 'actions',
      size: 100,
      enableHiding: false,
      enableSorting: false,
      enableResizing: false,
      cell: ({ row }) => (
        <IconActions
          icon={
            <>
              <MoreVertIcon className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </>
          }>
          {/*<EditUser user={row.original}>*/}
          {/*  <IconActionsButton aria-label={t('updateUser')}>*/}
          {/*    {t('update')}*/}
          {/*  </IconActionsButton>*/}
          {/*</EditUser>*/}
          <GuardCapacityComponent
            capacityRestriction={[RESTRICTION.CAPABILITY_BYPASS]}
            displayError={false}>
            <IconActionsButton
              aria-label={t('detailsUser')}
              onClick={() => router.push(`/admin/user/${row.original.id}`)}>
              {t('details')}
            </IconActionsButton>
          </GuardCapacityComponent>
          <DeleteUserAction
            user={row.original}
            connectionID={data?.users?.__id}
          />
        </IconActions>
      ),
    },
  ];

  useEffect(() => {
    if (columnOrder.length === 0) {
      const defaultColumnOrder = columns.map((c) => c.id!);
      setColumnOrder(defaultColumnOrder);
    }
  }, []);

  const userData = data.users.edges.map(({ node }) => ({
    ...node,
  })) as user_fragment$data[];

  const handleRefetchData = (args?: Partial<userQuery$variables>) => {
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
      transformSortingValueToParams<UserOrdering, OrderingMode>(newSortingValue)
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
      data={userData}
      onResetTable={resetAll}
      tableOptions={{
        onSortingChange: onSortingChange,
        onPaginationChange: onPaginationChange,
        onColumnOrderChange: setColumnOrder,
        onColumnVisibilityChange: setColumnVisibility,
        manualSorting: true,
        manualPagination: true,
        rowCount: data.users.totalCount,
      }}
      toolbar={
        <div className="flex flex-col-reverse items-center justify-between gap-s sm:flex-row">
          <Input
            className="w-full sm:w-1/3"
            placeholder={'Search with email...'}
            onChange={(e) => handleInputChange(e.target.value)}
          />

          <div className="flex w-full items-center justify-between gap-s sm:w-auto">
            <DataTableHeadBarOptions />
            <CreateUser connectionId={data?.users?.__id} />
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

// Component export
export default UserList;
