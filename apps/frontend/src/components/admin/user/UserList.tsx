import { EditUser } from '@/components/admin/user/forms/UserUpdate';
import { useUserListLocalstorage } from '@/components/admin/user/user-list-localstorage';
import { getUserListContext } from '@/components/admin/user/UserListPage';
import { UserOrganizationFilter } from '@/components/admin/user/UserOrganizationFilter';
import { PortalContext } from '@/components/me/AppPortalContext';
import BadgeOverflowCounter, {
  BadgeOverflow,
} from '@/components/ui/BadgeOverflowCounter';
import {
  handleSortingChange,
  mapToSortingTableValue,
  transformSortingValueToParams,
} from '@/components/ui/handle-sorting.utils';
import { SearchInput } from '@/components/ui/SearchInput';
import useAdminPath from '@/hooks/use-admin-path';
import { useExecuteAfterAnimation } from '@/hooks/use-execute-after-animation';
import { useUsersList } from '@/hooks/use-users-list';
import { DEBOUNCE_TIME } from '@/utils/constant';
import { i18nKey } from '@/utils/datatable';
import { formatDate } from '@/utils/date';
import { Badge, DataTable, DataTableHeadBarOptions } from '@filigran/ui';
import {
  UserList_fragment$data,
  UserList_fragment$key,
} from '@generated/UserList_fragment.graphql';
import { UserListQuery$variables } from '@generated/UserListQuery.graphql';
import { ColumnDef, PaginationState, Row } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useContext, useEffect, useMemo, useState } from 'react';
import { graphql, readInlineData, useSubscription } from 'react-relay';
import { useDebounceCallback } from 'usehooks-ts';

// Configuration or Preloader Query
export const UserListQuery = graphql`
  query UserListQuery(
    $count: Int!
    $cursor: ID
    $orderBy: UserOrdering!
    $orderMode: OrderingMode!
    $filters: [Filter!]
    $searchTerm: String
  ) {
    ...UserList_users
  }
`;

export const userListFragment = graphql`
  fragment UserList_users on Query
  @refetchable(queryName: "UsersPaginationQuery") {
    users(
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      searchTerm: $searchTerm
      filters: $filters
    ) {
      __id
      totalCount
      edges {
        node {
          ...UserList_fragment
        }
      }
    }
  }
`;

export const UserFragment = graphql`
  fragment UserList_fragment on User @inline {
    id
    email
    last_name
    first_name
    disabled
    last_login
    country
    organization_capabilities {
      id
      organization {
        id
        name
        personal_space
      }
      capabilities
    }
  }
`;

interface UserListProps {
  organization?: string;
}

// Component
const UserList = ({ organization }: UserListProps) => {
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
    organizationFilter,
    setOrganizationFilter,
    resetAll,
    removeOrder,
  } = useUserListLocalstorage();

  const isAdminPath = useAdminPath();
  const { me } = useContext(PortalContext);
  const [userEdit, setUserEdit] = useState<UserList_fragment$data | undefined>(
    undefined
  );

  const [filter, setFilter] = useState<{
    search?: string;
    organization?: string;
  }>({
    search: undefined,
    organization: isAdminPath ? organizationFilter : organization,
  });

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const { data, refetch } = useUsersList({
    pageSize,
    orderMode,
    orderBy,
    filter,
    fetchPolicy: 'store-and-network',
  });

  const connectionID = data?.users?.__id;
  const { setConnectionId } = getUserListContext();
  setConnectionId(connectionID);

  const userListSubscription = graphql`
    subscription UserListSubscription(
      $connections: [ID!]!
      $organizationId: ID
    ) {
      User(organizationId: $organizationId) {
        add @appendNode(connections: $connections, edgeTypeName: "UserEdge") {
          ...UserList_fragment
        }
      }
    }
  `;

  const userListSubscriptionConfig = useMemo(
    () => ({
      variables: {
        connections: [connectionID],
        organizationId: isAdminPath ? undefined : organization,
      },
      subscription: userListSubscription,
    }),
    [connectionID, isAdminPath, organization, userListSubscription]
  );
  useSubscription(userListSubscriptionConfig);

  const columns: ColumnDef<UserList_fragment$data>[] = useMemo(
    () => [
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
      ...(isAdminPath
        ? [
            {
              accessorKey: 'organizations',
              id: 'organizations',
              header: t('UserListPage.Organizations'),
              enableSorting: false,
              cell: ({ row }: { row: Row<UserList_fragment$data> }) => {
                return (
                  <div className="flex gap-xs">
                    {row.original.organization_capabilities?.map(
                      ({ id, organization: { name, personal_space } }) =>
                        !personal_space ? <Badge key={id}>{name}</Badge> : null
                    )}
                  </div>
                );
              },
            },
            {
              accessorKey: 'country',
              id: 'country',
              header: t('UserListPage.Country'),
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
                row: { original: UserList_fragment$data };
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
            {
              accessorKey: 'last_login',
              id: 'last_login',
              header: t('UserListPage.LastLogin'),
              cell: ({
                row,
              }: {
                row: { original: UserList_fragment$data };
              }) => {
                return (
                  <span className="truncate">
                    {row.original.last_login
                      ? formatDate(row.original.last_login, 'DATE_FULL')
                      : '-'}
                  </span>
                );
              },
            },
          ]
        : [
            {
              accessorKey: 'capability',
              id: 'capability',
              header: t('UserListPage.Capability'),
              cell: ({
                row,
              }: {
                row: { original: UserList_fragment$data };
              }) => {
                // As non-admin path, we should return only one organization
                if (row.original.organization_capabilities) {
                  const capabilities = (
                    row.original.organization_capabilities.find(
                      ({ organization }) =>
                        organization.id === me?.selected_organization_id
                    )?.capabilities ?? []
                  ).map(
                    (capability) =>
                      ({
                        id: capability,
                        name: capability,
                      }) as BadgeOverflow
                  );
                  return <BadgeOverflowCounter badges={capabilities} />;
                }
                return null;
              },
            },
          ]),
    ],
    [isAdminPath, me?.selected_organization_id, t]
  );

  useEffect(() => {
    if (columnOrder.length === 0) {
      const defaultColumnOrder = columns.map((c) => c.id!);
      setColumnOrder(defaultColumnOrder);
    }
  }, [columnOrder.length, columns, setColumnOrder]);

  const userData = data.users.edges.map(({ node }) =>
    readInlineData<UserList_fragment$key>(UserFragment, node)
  );

  const handleRefetchData = (args?: Partial<UserListQuery$variables>) => {
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
    handleSortingChange({
      updater,
      removeOrder,
      setOrderBy,
      setOrderMode,
      orderBy,
      orderMode,
      handleRefetchData,
    });
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
      refetch({ searchTerm: updatedFilter.search }); // Use the updated filter
      return updatedFilter;
    });
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleOrganizationChange = (organizationId: string | undefined) => {
    setOrganizationFilter(organizationId);
    setFilter((prevFilter) => {
      const updatedFilter = {
        ...prevFilter,
        organization: organizationId,
      };
      refetch({
        filters: updatedFilter.organization
          ? [{ key: 'organization_id', value: [updatedFilter.organization] }]
          : undefined,
      });
      return updatedFilter;
    });
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
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
            <div className="flex w-full items-center gap-s sm:w-auto">
              <SearchInput
                containerClass="w-full sm:w-auto"
                placeholder={t('UserActions.SearchUser')}
                onChange={debounceHandleInput}
              />
              {isAdminPath && (
                <UserOrganizationFilter
                  value={filter.organization}
                  onChange={handleOrganizationChange}
                />
              )}
            </div>
            <div className="flex w-full items-center justify-between gap-s sm:w-auto">
              <DataTableHeadBarOptions />
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
