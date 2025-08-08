import { EditUser } from '@/components/admin/user/[slug]/user-edit';
import { useUserListLocalstorage } from '@/components/admin/user/pending-user-list-localstorage';
import { UserFragment } from '@/components/admin/user/user-list';
import { PortalContext } from '@/components/me/app-portal-context';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import {
  handleSortingChange,
  mapToSortingTableValue,
  transformSortingValueToParams,
} from '@/components/ui/handle-sorting.utils';
import { SearchInput } from '@/components/ui/search-input';
import { useExecuteAfterAnimation } from '@/hooks/useExecuteAfterAnimation';
import { DEBOUNCE_TIME } from '@/utils/constant';
import { i18nKey } from '@/utils/datatable';
import { pendingUserList_users$key } from '@generated/pendingUserList_users.graphql';
import {
  pendingUserListQuery,
  pendingUserListQuery$variables,
} from '@generated/pendingUserListQuery.graphql';
import { pendingUserListRemoveUserMutation } from '@generated/pendingUserListRemoveUserMutation.graphql';
import {
  userList_fragment$data,
  userList_fragment$key,
} from '@generated/userList_fragment.graphql';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { CheckIcon, CloseIcon } from 'filigran-icon';
import { DataTable, DataTableHeadBarOptions } from 'filigran-ui';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import {
  FunctionComponent,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  graphql,
  readInlineData,
  useLazyLoadQuery,
  useMutation,
  useRefetchableFragment,
  useSubscription,
} from 'react-relay';
import { useDebounceCallback } from 'usehooks-ts';

// Configuration or Preloader Query
export const PendingUserListQuery = graphql`
  query pendingUserListQuery(
    $count: Int!
    $cursor: ID
    $orderBy: UserOrdering!
    $orderMode: OrderingMode!
    $filters: [Filter!]
    $searchTerm: String
  ) {
    ...pendingUserList_users
  }
`;

export const pendingUserListFragment = graphql`
  fragment pendingUserList_users on Query
  @refetchable(queryName: "PendingUsersPaginationQuery") {
    pendingUsers(
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

const removePendingUser = graphql`
  mutation pendingUserListRemoveUserMutation(
    $user_id: ID!
    $organization_id: ID!
  ) {
    removePendingUserFromOrganization(
      user_id: $user_id
      organization_id: $organization_id
    ) {
      ...userList_fragment
    }
  }
`;

interface PendingUserListProps {
  organization?: string;
}

// Component
const PendingUserList: FunctionComponent<PendingUserListProps> = ({
  organization,
}) => {
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
    removeOrder,
  } = useUserListLocalstorage();

  const { me } = useContext(PortalContext);
  const [userEdit, setUserEdit] = useState<userList_fragment$data | undefined>(
    undefined
  );

  const [removeUserMutation] =
    useMutation<pendingUserListRemoveUserMutation>(removePendingUser);

  const [filter, setFilter] = useState<{
    search?: string;
    organization?: string;
  }>({
    search: undefined,
    organization,
  });

  const queryData = useLazyLoadQuery<pendingUserListQuery>(
    PendingUserListQuery,
    {
      count: pageSize,
      orderMode: orderMode,
      orderBy: orderBy,
      searchTerm: filter.search,
      filters: filter.organization
        ? [{ key: 'organization_id', value: [filter.organization] }]
        : undefined,
    }
  );

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const [data, refetch] = useRefetchableFragment<
    pendingUserListQuery,
    pendingUserList_users$key
  >(pendingUserListFragment, queryData);

  const pendingUserListSubscription = graphql`
    subscription pendingUserListSubscription($connections: [ID!]!) {
      UserPending {
        delete {
          id @deleteEdge(connections: $connections)
        }
      }
    }
  `;

  const connectionID = data?.pendingUsers?.__id;

  const pendingUserListSubscriptionConfig = useMemo(
    () => ({
      variables: { connections: [connectionID] },
      subscription: pendingUserListSubscription,
    }),
    [connectionID, pendingUserListSubscription]
  );
  useSubscription(pendingUserListSubscriptionConfig);

  function rejectUser(row: userList_fragment$data) {
    removeUserMutation({
      variables: {
        user_id: row.id,
        organization_id: me!.selected_organization_id,
      },
    });
    return undefined;
  }

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
      accessorKey: 'actions',
      id: 'actions',
      size: 40,
      enableHiding: false,
      enableSorting: false,
      enableResizing: false,
      header: undefined,
      cell: ({ row }) => {
        return (
          <>
            <AlertDialogComponent
              AlertTitle={t('PendingUserListPage.WarningUserRejection.Title')}
              // description={t('PendingUserListPage.WarningUserRejectionDescription')}
              actionButtonText={t(
                'PendingUserListPage.WarningUserRejection.Confirm'
              )}
              triggerElement={
                <Button
                  variant="ghost-destructive"
                  size="icon"
                  className="border m-1">
                  <CloseIcon className="h-4 w-4" />
                </Button>
              }
              onClickContinue={() => rejectUser!(row.original)}>
              {t('PendingUserListPage.WarningUserRejection.Description')}
            </AlertDialogComponent>
            <Button
              variant="ghost-primary"
              size="icon"
              className="border"
              onClick={() => setUserEdit(row.original)}>
              <CheckIcon className="h-4 w-4" />
            </Button>
          </>
        );
      },
    },
  ];

  useEffect(() => {
    if (columnOrder.length === 0) {
      const defaultColumnOrder = columns.map((c) => c.id!);
      setColumnOrder(defaultColumnOrder);
    }
  }, [columnOrder.length, columns, setColumnOrder]);

  const userData = data.pendingUsers.edges.map(({ node }) =>
    readInlineData<userList_fragment$key>(UserFragment, node)
  );

  const handleRefetchData = (
    args?: Partial<pendingUserListQuery$variables>
  ) => {
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
          rowCount: data.pendingUsers.totalCount,
          enableRowSelection: (row) => row.original.id !== me!.id,
        }}
        toolbar={
          <div className="flex flex-col-reverse items-center justify-between gap-s sm:flex-row">
            <SearchInput
              containerClass="w-full sm:w-1/3"
              placeholder={t('UserActions.SearchUser')}
              onChange={debounceHandleInput}
            />
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
          columnPinning: {
            right: ['actions'],
          },
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
export default PendingUserList;
