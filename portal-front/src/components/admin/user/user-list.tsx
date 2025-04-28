import { EditUser } from '@/components/admin/user/[slug]/user-edit';
import { AddUser } from '@/components/admin/user/add-user';
import { AdminAddUser } from '@/components/admin/user/admin-add-user';
import { useUserListLocalstorage } from '@/components/admin/user/user-list-localstorage';
import { PortalContext } from '@/components/me/app-portal-context';
import {
  mapToSortingTableValue,
  transformSortingValueToParams,
} from '@/components/ui/handle-sorting.utils';
import { SearchInput } from '@/components/ui/search-input';
import useAdminPath from '@/hooks/useAdminPath';
import { useExecuteAfterAnimation } from '@/hooks/useExecuteAfterAnimation';
import { DEBOUNCE_TIME } from '@/utils/constant';
import { i18nKey } from '@/utils/datatable';
import { formatDate } from '@/utils/date';
import {
  userList_fragment$data,
  userList_fragment$key,
} from '@generated/userList_fragment.graphql';
import { userList_users$key } from '@generated/userList_users.graphql';
import {
  OrderingMode,
  userListQuery,
  userListQuery$variables,
  UserOrdering,
} from '@generated/userListQuery.graphql';
import { ColumnDef, PaginationState, Row } from '@tanstack/react-table';
import { Badge, DataTable, DataTableHeadBarOptions } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import {
  createContext,
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from 'react';
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
    $filters: [Filter!]
    $searchTerm: String
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
      searchTerm: $searchTerm
      filters: $filters
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

export const UserListContext = createContext<{ connectionID?: string }>({});

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
  const { me } = useContext(PortalContext);
  const [userEdit, setUserEdit] = useState<userList_fragment$data | undefined>(
    undefined
  );

  const [filter, setFilter] = useState<{
    search?: string;
    organization?: string;
  }>({
    search: undefined,
    organization,
  });

  const queryData = useLazyLoadQuery<userListQuery>(UserListQuery, {
    count: pageSize,
    orderMode: orderMode,
    orderBy: orderBy,
    searchTerm: filter.search,
    filters: filter.organization
      ? [{ key: 'organization_id', value: [filter.organization] }]
      : undefined,
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
    ...(isAdminPath
      ? [
          {
            accessorKey: 'organizations',
            id: 'organizations',
            header: t('UserListPage.Organizations'),
            enableSorting: false,
            cell: ({ row }: { row: Row<userList_fragment$data> }) => {
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
            enableSorting: true,
            cell: ({ row }: { row: Row<userList_fragment$data> }) => {
              return (
                <div className="flex gap-xs">
                  { row.original.country }
                </div>
              )
            }
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
          {
            accessorKey: 'last_login',
            id: 'last_login',
            header: t('UserListPage.LastLogin'),
            cell: ({ row }: { row: { original: userList_fragment$data } }) => {
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
      : []),
  ];

  useEffect(() => {
    if (columnOrder.length === 0) {
      const defaultColumnOrder = columns.map((c) => c.id!);
      setColumnOrder(defaultColumnOrder);
    }
  }, []);

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
      refetch({ searchTerm: updatedFilter.search }); // Use the updated filter
      return updatedFilter;
    });
  };

  const debounceHandleInput = useDebounceCallback(
    (e) => handleInputChange(e.target.value),
    DEBOUNCE_TIME
  );

  return (
    <UserListContext.Provider value={{ connectionID: data.users.__id }}>
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
            <SearchInput
              containerClass="w-full sm:w-1/3"
              placeholder={t('UserActions.SearchUserWithEmail')}
              onChange={debounceHandleInput}
            />
            <div className="flex w-full items-center justify-between gap-s sm:w-auto">
              <DataTableHeadBarOptions />
              {isAdminPath ? (
                <AdminAddUser connectionId={data?.users?.__id} />
              ) : (
                <AddUser connectionId={data?.users?.__id} />
              )}
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
    </UserListContext.Provider>
  );
};

// Component export
export default UserList;
