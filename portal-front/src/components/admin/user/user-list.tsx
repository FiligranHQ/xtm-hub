import GuardCapacityComponent from '@/components/admin-guard';
import { EditUser } from '@/components/admin/user/[slug]/user-edit';
import { RemoveUserFromOrga } from '@/components/admin/user/remove-user-from-orga';
import { AddUser } from '@/components/admin/user/user-create';
import { useUserListLocalstorage } from '@/components/admin/user/user-list-localstorage';
import { Portal, portalContext } from '@/components/portal-context';
import {
  mapToSortingTableValue,
  transformSortingValueToParams,
} from '@/components/ui/handle-sorting.utils';
import { IconActions, IconActionsButton } from '@/components/ui/icon-actions';
import useAdminPath from '@/hooks/useAdminPath';
import useGranted from '@/hooks/useGranted';
import { RESTRICTION } from '@/utils/constant';
import { i18nKey } from '@/utils/datatable';
import { ColumnDef, PaginationState, Row } from '@tanstack/react-table';
import { MoreVertIcon } from 'filigran-icon';
import { Badge, DataTable, DataTableHeadBarOptions, Input } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { FunctionComponent, useContext, useEffect, useState } from 'react';
import { graphql, useLazyLoadQuery, useRefetchableFragment } from 'react-relay';
import { userList_fragment$data } from '../../../../__generated__/userList_fragment.graphql';
import { userList_users$key } from '../../../../__generated__/userList_users.graphql';
import {
  OrderingMode,
  UserFilter,
  UserOrdering,
  userListQuery,
  userListQuery$variables,
} from '../../../../__generated__/userListQuery.graphql';

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
  const router = useRouter();
  const { me } = useContext<Portal>(portalContext);

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
        ]
      : []),
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

        // The user should not be able to modify itself
        if (row.original.id === me?.id) {
          return null;
        }

        return (
          <div className="flex items-center justify-end">
            <IconActions
              icon={
                <>
                  <MoreVertIcon className="h-4 w-4 text-primary" />
                  <span className="sr-only">{t('Utils.OpenMenu')}</span>
                </>
              }>
              <EditUser
                user={row.original}
                trigger={
                  <IconActionsButton
                    className="normal-case"
                    aria-label={t('UserActions.UpdateUser')}>
                    {t('MenuActions.Update')}
                  </IconActionsButton>
                }
              />
              {organization && (
                <RemoveUserFromOrga
                  organization_id={organization}
                  user={row.original}
                  connectionID={data?.users?.__id}
                />
              )}
              <GuardCapacityComponent
                capacityRestriction={[RESTRICTION.CAPABILITY_BYPASS]}>
                <IconActionsButton
                  className="normal-case"
                  aria-label={t('UserActions.DetailsUser')}
                  onClick={() => router.push(`/admin/user/${row.original.id}`)}>
                  {t('MenuActions.Details')}
                </IconActionsButton>
              </GuardCapacityComponent>
            </IconActions>
          </div>
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
    setFilter((prevFilter) => {
      const updatedFilter = {
        ...prevFilter,
        search: inputValue,
      };
      refetch({ filter: updatedFilter }); // Use the updated filter
      return updatedFilter;
    });
  };

  return (
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
      }}
      toolbar={
        <div className="flex flex-col-reverse items-center justify-between gap-s sm:flex-row">
          <Input
            className="w-full sm:w-1/3"
            placeholder={t('UserActions.SearchUserWithEmail')}
            onChange={(e) => handleInputChange(e.target.value)}
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
        columnPinning: { right: ['actions'] },
      }}
    />
  );
};

// Component export
export default UserList;
