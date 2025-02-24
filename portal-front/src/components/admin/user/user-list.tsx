import { EditUser } from '@/components/admin/user/[slug]/user-edit';
import { AddUser } from '@/components/admin/user/user-create';
import { useUserListLocalstorage } from '@/components/admin/user/user-list-localstorage';
import { Portal, portalContext } from '@/components/me/portal-context';
import {
  mapToSortingTableValue,
  transformSortingValueToParams,
} from '@/components/ui/handle-sorting.utils';
import useAdminPath from '@/hooks/useAdminPath';
import { useExecuteAfterAnimation } from '@/hooks/useExecuteAfterAnimation';
import { DEBOUNCE_TIME } from '@/utils/constant';
import { i18nKey } from '@/utils/datatable';
import {
  userList_fragment$data,
  userList_fragment$key,
} from '@generated/userList_fragment.graphql';
import { userList_users$key } from '@generated/userList_users.graphql';
import {
  OrderingMode,
  UserFilter,
  userListQuery,
  userListQuery$variables,
  UserOrdering,
} from '@generated/userListQuery.graphql';
import { ColumnDef, PaginationState, Row } from '@tanstack/react-table';
import { Badge, DataTable, DataTableHeadBarOptions, Input } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useContext, useState } from 'react';
import {
  graphql,
  readInlineData,
  useLazyLoadQuery,
  useRefetchableFragment,
} from 'react-relay';
import { useDebounceCallback } from 'usehooks-ts';

// Configuration or Preloader Query
export const UserListQuery = graphql`
  query userListQuery(
    $count: Int!
    $cursor: ID
    $orderBy: UserOrdering!
    $orderMode: OrderingMode!
    $filter: UserFilter
  ) {
    ...userList_users
  }
`;

export const userListFragment = graphql`
  fragment userList_users on Query
  @refetchable(queryName: "UsersPaginationQuery") {
    users(
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      filter: $filter
    ) {
      __id
      totalCount
      edges {
        node {
          ...userList_fragment
        }
      }
    }
  }
`;

export const UserFragment = graphql`
  fragment userList_fragment on User @inline {
    id
    email
    last_name
    first_name
    disabled
    roles_portal {
      id
      name
    }
    organizations {
      id
      name
      personal_space
    }
  }
`;

interface UserListProps {
  organization?: string;
}

// Component
const UserList: FunctionComponent<UserListProps> = ({ organization }) => {
  const t = useTranslations();
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

  const isAdminPath = useAdminPath();
  const { me } = useContext<Portal>(portalContext);
  const [userEdit, setUserEdit] = useState<userList_fragment$data | undefined>(
    undefined
  );

  const [filter, setFilter] = useState<UserFilter>({
    search: undefined,
    organization,
  });

  const queryData = useLazyLoadQuery<userListQuery>(UserListQuery, {
    count: pageSize,
    orderMode: orderMode,
    orderBy: orderBy,
    filter,
  });

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const [data, refetch] = useRefetchableFragment<
    userListQuery,
    userList_users$key
  >(userListFragment, queryData);

  const columns: ColumnDef<userList_fragment$data>[] = [
    {
      accessorKey: 'email',
      id: 'email',
      header: t('UserListPage.Email'),
      cell: ({ row }) => {
        return <span className="truncate">{row.original.email}</span>;
      },
    },
    {
      accessorKey: 'first_name',
      id: 'first_name',
      header: t('UserListPage.FirstName'),
      cell: ({ row }) => {
        return <span className="truncate">{row.original.first_name}</span>;
      },
    },
    {
      accessorKey: 'last_name',
      id: 'last_name',
      header: t('UserListPage.LastName'),
      cell: ({ row }) => {
        return <span className="truncate">{row.original.last_name}</span>;
      },
    },
    {
      accessorKey: 'roles_portal',
      id: 'roles_portal',
      header: t('UserListPage.Roles'),
      cell: ({ row }) => {
        return (
          <div className="flex gap-xs">
            {row.original.roles_portal?.map(({ id, name }) => (
              <Badge key={id}>{name}</Badge>
            ))}
          </div>
        );
      },
    },
    ...(isAdminPath
      ? [
          {
            accessorKey: 'organizations',
            id: 'organizations',
            header: t('UserListPage.Organizations'),
            cell: ({ row }: { row: Row<userList_fragment$data> }) => {
              return (
                <div className="flex gap-xs">
                  {row.original.organizations.map(
                    ({ id, name, personal_space }) =>
                      !personal_space ? <Badge key={id}>{name}</Badge> : null
                  )}
                </div>
              );
            },
          },
          {
            accessorKey: 'disabled',
            id: 'disabled',
            header: t('UserListPage.Status'),
            cell: ({
              row: {
                original: { disabled },
              },
            }: {
              row: { original: userList_fragment$data };
            }) => {
              return (
                <div className="flex gap-xs">
                  <Badge variant={disabled ? 'destructive' : 'secondary'}>
                    {t(disabled ? 'Badge.Disabled' : 'Badge.Enabled')}
                  </Badge>
                </div>
              );
            },
          },
        ]
      : []),
  ];

  if (columnOrder.length === 0) {
    const defaultColumnOrder = columns.map((c) => c.id!);
    setColumnOrder(defaultColumnOrder);
  }

  const userData = data.users.edges.map(({ node }) =>
    readInlineData<userList_fragment$key>(UserFragment, node)
  );

  const handleRefetchData = (args?: Partial<userListQuery$variables>) => {
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
    setFilter((prevFilter) => {
      const updatedFilter = {
        ...prevFilter,
        search: inputValue,
      };
      refetch({ filter: updatedFilter }); // Use the updated filter
      return updatedFilter;
    });
  };

  const debounceHandleInput = useDebounceCallback(
    (e) => handleInputChange(e.target.value),
    DEBOUNCE_TIME
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={userData}
        i18nKey={i18nKey(t)}
        onResetTable={resetAll}
        tableOptions={{
          onSortingChange: onSortingChange,
          onPaginationChange: onPaginationChange,
          onColumnOrderChange: setColumnOrder,
          onColumnVisibilityChange: setColumnVisibility,
          manualSorting: true,
          manualPagination: true,
          rowCount: data.users.totalCount,
          enableRowSelection: (row) => row.original.id !== me!.id,
        }}
        onClickRow={(row) => setUserEdit(row.original)}
        toolbar={
          <div className="flex flex-col-reverse items-center justify-between gap-s sm:flex-row">
            <Input
              className="w-full sm:w-1/3"
              placeholder={t('UserActions.SearchUserWithEmail')}
              onChange={debounceHandleInput}
            />
            <div className="flex w-full items-center justify-between gap-s sm:w-auto">
              <DataTableHeadBarOptions />
              <AddUser connectionId={data?.users?.__id} />
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
      {userEdit && (
        <EditUser
          user={userEdit}
          key={userEdit?.id}
          defaultStateOpen={!!userEdit}
          onCloseSheet={() =>
            useExecuteAfterAnimation(() => setUserEdit(undefined))
          }
        />
      )}
    </>
  );
};

// Component export
export default UserList;
