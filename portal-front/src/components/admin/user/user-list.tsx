import * as React from 'react';
import { useState } from 'react';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';
import { userList_users$key } from '../../../../__generated__/userList_users.graphql';
import { Button } from 'filigran-ui/servers';
import Link from 'next/link';
import { ColumnDef, ColumnSort, PaginationState } from '@tanstack/react-table';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { DataTable } from 'filigran-ui/clients';
import { transformSortingValueToParams } from '@/components/ui/handle-sorting.utils';
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
  {
    id: 'actions',
    size: 100,
    enableHiding: false,
    enableSorting: false,
    enableResizing: false,
    cell: ({ row }) => {
      return (
        <Button
          asChild
          variant="ghost">
          <Link href={`/admin/user/${row.original.id}`}>Details</Link>
        </Button>
      );
    },
  },
];
// Component
const UserList: React.FunctionComponent<ServiceProps> = ({ queryRef }) => {
  const queryData = usePreloadedQuery<userQuery>(UserListQuery, queryRef);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: Number(localStorage.getItem('countUserList')),
  });

  const [data, refetch] = useRefetchableFragment<userQuery, userList_users$key>(
    usersFragment,
    queryData
  );

  const userData = data.users.edges.map(({ node }) => ({
    ...node,
  })) as UserData[];

  const handleRefetchData = (args?: Partial<userQuery$variables>) => {
    const sorting = [
      {
        id: localStorage.getItem('orderByUserList'),
        desc: localStorage.getItem('orderModeUserList') === 'desc',
      } as unknown as ColumnSort,
    ];
    refetch({
      count: pagination.pageSize,
      cursor: btoa(String(pagination.pageSize * pagination.pageIndex)),
      orderBy: localStorage.getItem('orderByUserList') as UserOrdering,
      orderMode: localStorage.getItem('orderModeUserList') as OrderingMode,
      ...transformSortingValueToParams(sorting),
      ...args,
    });
  };
  const onSortingChange = (updater: unknown) => {
    const sorting = [
      {
        id: localStorage.getItem('orderByUserList'),
        desc: localStorage.getItem('orderModeUserList') === 'desc',
      },
    ];
    const newSortingValue =
      updater instanceof Function ? updater(sorting) : updater;

    localStorage.setItem('orderByUserList', newSortingValue[0].id);
    localStorage.setItem(
      'orderModeUserList',
      newSortingValue[0].desc ? 'desc' : 'asc'
    );
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
  };

  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />

      <div className="container mx-auto py-10">
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
            sorting: [
              {
                id: localStorage.getItem('orderByUserList') ?? '',
                desc: localStorage.getItem('orderModeUserList') === 'desc',
              },
            ],
            pagination,
          }}
        />
      </div>
      <CreateUser connectionId={data?.users?.__id}></CreateUser>
    </>
  );
};

// Component export
export default UserList;
