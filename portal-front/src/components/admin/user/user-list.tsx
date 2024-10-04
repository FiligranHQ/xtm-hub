import { CreateUser } from '@/components/admin/user/user-create';
import { useUserListLocalstorage } from '@/components/admin/user/user-list-localstorage';
import {
  UserListQuery,
  usersFragment,
} from '@/components/admin/user/user.graphql';
import {
  mapToSortingTableValue,
  transformSortingValueToParams,
} from '@/components/ui/handle-sorting.utils';
import { ColumnDef, PaginationState, Row } from '@tanstack/react-table';
import { DataTable, DataTableHeadBarOptions } from 'filigran-ui/clients';
import { Input } from 'filigran-ui/servers';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useState } from 'react';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';
import { userList_users$key } from '../../../../__generated__/userList_users.graphql';
import {
  OrderingMode,
  UserOrdering,
  userQuery,
  userQuery$variables,
} from '../../../../__generated__/userQuery.graphql';

// Component interface
interface ServiceProps {
  queryRef: PreloadedQuery<userQuery>;
  columns: ColumnDef<UserData>[];
}

export interface UserData {
  email?: string;
  first_name: string | null | undefined;
  id: string;
  last_name: string | null | undefined;
}

// Component
const UserList: React.FunctionComponent<ServiceProps> = ({
  queryRef,
  columns,
}) => {
  const router = useRouter();
  const queryData = usePreloadedQuery<userQuery>(UserListQuery, queryRef);
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
  } = useUserListLocalstorage(columns);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const [data, refetch] = useRefetchableFragment<userQuery, userList_users$key>(
    usersFragment,
    queryData
  );

  const userData = data.users.edges.map(({ node }) => ({
    ...node,
  })) as UserData[];

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

  const onClickRow = (row: Row<UserData>) => {
    router.push(`/admin/user/${row.original.id}`);
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
        <div className="flex-col-reverse sm:flex-row flex items-center justify-between gap-s">
          <Input
            className="w-full sm:w-1/3"
            placeholder={'Search with email...'}
            onChange={(e) => handleInputChange(e.target.value)}
          />

          <div className="justify-between flex w-full sm:w-auto items-center gap-s">
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
      onClickRow={onClickRow}
    />
  );
};

// Component export
export default UserList;
