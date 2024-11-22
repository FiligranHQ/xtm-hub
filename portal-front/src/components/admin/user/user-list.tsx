import GuardCapacityComponent from '@/components/admin-guard';
import { EditUser } from '@/components/admin/user/[slug]/user-edit';
import { DeleteUserAction } from '@/components/admin/user/delete-user-action';
import { CreateUser } from '@/components/admin/user/user-create';
import { useUserListLocalstorage } from '@/components/admin/user/user-list-localstorage';
import {
  mapToSortingTableValue,
  transformSortingValueToParams,
} from '@/components/ui/handle-sorting.utils';
import { IconActions, IconActionsButton } from '@/components/ui/icon-actions';
import useGranted from '@/hooks/useGranted';
import { RESTRICTION } from '@/utils/constant';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { MoreVertIcon } from 'filigran-icon';
import { DataTable, DataTableHeadBarOptions } from 'filigran-ui/clients';
import { Badge, Input } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { graphql, useLazyLoadQuery, useRefetchableFragment } from 'react-relay';
import { userList_fragment$data } from '../../../../__generated__/userList_fragment.graphql';
import { userList_users$key } from '../../../../__generated__/userList_users.graphql';
import {
  OrderingMode,
  UserOrdering,
  userListQuery,
  userListQuery$variables,
} from '../../../../__generated__/userListQuery.graphql';

// Configuration or Preloader Query
const UserListQuery = graphql`
  query userListQuery(
    $count: Int!
    $cursor: ID
    $orderBy: UserOrdering!
    $orderMode: OrderingMode!
    $filter: String
  ) {
    ...userList_users
  }
`;

const userListFragment = graphql`
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
          ...userList_fragment @relay(mask: false)
        }
      }
    }
  }
`;

export const UserFragment = graphql`
  fragment userList_fragment on User {
    id
    email
    last_name
    first_name
    roles_portal @required(action: THROW) {
      id
      name
    }
    organizations @required(action: THROW) {
      id
      name
      personal_space
    }
  }
`;

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

  const queryData = useLazyLoadQuery<userListQuery>(UserListQuery, {
    count: pageSize,
    orderMode: orderMode,
    orderBy: orderBy,
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
      accessorKey: 'roles_portal',
      id: 'roles_portal',
      header: 'Roles',
      cell: ({ row }) => {
        return (
          <div className="flex gap-xs">
            {row.original.roles_portal.map(({ id, name }) => (
              <Badge key={id}>{name}</Badge>
            ))}
          </div>
        );
      },
    },
    {
      id: 'actions',
      size: 100,
      enableHiding: false,
      enableSorting: false,
      enableResizing: false,
      cell: ({ row }) => {
        const userIsAdmin = row.original.roles_portal.some(
          ({ name }) => name === 'ADMIN'
        );
        // An admin orga should not able to modify an Admin PLTFM
        if (userIsAdmin && !useGranted(RESTRICTION.CAPABILITY_BYPASS)) {
          return null;
        }

        return (
          <IconActions
            icon={
              <>
                <MoreVertIcon className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </>
            }>
            <EditUser
              user={row.original}
              trigger={
                <IconActionsButton aria-label={t('UserActions.updateUser')}>
                  {t('MenuActions.update')}
                </IconActionsButton>
              }
            />

            <GuardCapacityComponent
              capacityRestriction={[RESTRICTION.CAPABILITY_BYPASS]}>
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
        );
      },
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
  })) as userList_fragment$data[];

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
        columnPinning: { right: ['actions'] },
      }}
    />
  );
};

// Component export
export default UserList;
