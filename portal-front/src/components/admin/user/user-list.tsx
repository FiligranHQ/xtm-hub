import * as React from 'react';
import { useState } from 'react';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';
import { userList_users$key } from '../../../../__generated__/userList_users.graphql';
import Link from 'next/link';
import {
  ColumnDef,
  ColumnSort,
  PaginationState,
  Row,
} from '@tanstack/react-table';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { DataTable } from 'filigran-ui/clients';
import {
  mapToSortingTableValue,
  transformSortingValueToParams,
} from '@/components/ui/handle-sorting.utils';
import { CreateUser } from '@/components/admin/user/user-create';
import {
  UserListQuery,
  usersFragment,
} from '@/components/admin/user/user.graphql';
import {
  OrderingMode,
  UserOrdering,
  userQuery,
  userQuery$variables,
} from '../../../../__generated__/userQuery.graphql';
import { useLocalStorage } from 'usehooks-ts';
import { useRouter } from 'next/navigation';

// Component interface
interface ServiceProps {
  queryRef: PreloadedQuery<userQuery>;
}

export interface UserData {
  email?: string;
  first_name: string | null | undefined;
  id: string;
  last_name: string | null | undefined;
}

const breadcrumbValue = [
  {
    href: '/',
    label: 'Home',
  },
  {
    label: 'Users',
  },
];

const columns: ColumnDef<UserData>[] = [
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
  },
];
// Component
const UserList: React.FunctionComponent<ServiceProps> = ({ queryRef }) => {
  const router = useRouter();
  const queryData = usePreloadedQuery<userQuery>(UserListQuery, queryRef);
  const [pageSize, setPageSize] = useLocalStorage('countUserList', 50);
  const [orderMode, setOrderMode] = useLocalStorage<OrderingMode>(
    'orderModeUserList',
    'asc'
  );
  const [orderBy, setOrderBy] = useLocalStorage<UserOrdering>(
    'orderByUserList',
    'email'
  );
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
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <div className="flex justify-end pb-s">
        <CreateUser connectionId={data?.users?.__id} />
      </div>
      <DataTable
        columns={columns}
        data={userData}
        tableOptions={{
          onSortingChange: onSortingChange,
          onPaginationChange: onPaginationChange,
          manualSorting: true,
          manualPagination: true,
          rowCount: data.users.totalCount,
        }}
        tableState={{
          sorting: mapToSortingTableValue(orderBy, orderMode),
          pagination,
        }}
        onClickRow={onClickRow}
      />
    </>
  );
};

// Component export
export default UserList;
