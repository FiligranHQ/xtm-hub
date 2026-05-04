import { useUserListLocalstorage } from '@/components/admin/user/pending-user-list-localstorage';
import {
  UserPendingListFragment,
  UserPendingListQuery,
  UserPendingListSubscription,
} from '@/components/admin/user/user.graphql';
import {
  handleSortingChange,
  mapToSortingTableValue,
  transformSortingValueToParams,
} from '@/components/ui/handle-sorting.utils';
import { DEBOUNCE_TIME } from '@/utils/constant';
import { i18nKey } from '@/utils/datatable';
import { CheckIcon, CloseIcon } from '@filigran/icon';
import {
  DataTable,
  DataTableHeadBarOptions,
  SelectionState,
  useRowSelection,
} from '@filigran/ui';
import { Button } from '@filigran/ui/servers';
import { PendingUserListAcceptUserBulkMutation } from '@generated/PendingUserListAcceptUserBulkMutation.graphql';
import { PendingUserListRemoveUserBulkMutation } from '@generated/PendingUserListRemoveUserBulkMutation.graphql';
import { PendingUserListRemoveUserMutation } from '@generated/PendingUserListRemoveUserMutation.graphql';
import {
  UserList_fragment$data,
  UserList_fragment$key,
} from '@generated/UserList_fragment.graphql';
import { FilterKeyEnum } from '@generated/models/FilterKey.enum';
import {
  userPendingListQuery,
  userPendingListQuery$variables,
} from '@generated/userPendingListQuery.graphql';
import { userPendingList_users$key } from '@generated/userPendingList_users.graphql';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import {
  FunctionComponent,
  useCallback,
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
import { useExecuteAfterAnimation } from '@/hooks/use-execute-after-animation';
import { PortalContext } from '@/components/me/AppPortalContext';
import { AlertDialogComponent } from '@/components/ui/AlertDialog';
import { SearchInput } from '@/components/ui/SearchInput';
import { UserFragment } from '@/components/admin/user/UserList';
import { EditUser } from '@/components/admin/user/forms/UserUpdate';

// Configuration or Preloader Query
const removePendingUser = graphql`
  mutation PendingUserListRemoveUserMutation(
    $user_id: UserId!
    $organization_id: OrganizationId!
  ) {
    removePendingUserFromOrganization(
      user_id: $user_id
      organization_id: $organization_id
    ) {
      ...UserList_fragment
    }
  }
`;

const removePendingUserBulk = graphql`
  mutation PendingUserListRemoveUserBulkMutation(
    $ids: [UserId!]
    $searchTerm: String
    $filters: [Filter!]
    $excludedIds: [UserId!]
  ) {
    bulkRemovePendingUserFromOrganization(
      input: {
        ids: $ids
        searchTerm: $searchTerm
        filters: $filters
        excludedIds: $excludedIds
      }
    ) {
      success
    }
  }
`;

const acceptPendingUserBulk = graphql`
  mutation PendingUserListAcceptUserBulkMutation(
    $ids: [UserId!]
    $searchTerm: String
    $filters: [Filter!]
    $excludedIds: [UserId!]
  ) {
    bulkAcceptPendingUserInOrganization(
      input: {
        ids: $ids
        searchTerm: $searchTerm
        filters: $filters
        excludedIds: $excludedIds
      }
    ) {
      success
    }
  }
`;

interface PendingUserListProps {
  organization: string;
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
  const [userEdit, setUserEdit] = useState<UserList_fragment$data | undefined>(
    undefined
  );

  const [removeUserMutation] =
    useMutation<PendingUserListRemoveUserMutation>(removePendingUser);
  const [removeUserBulkMutation] =
    useMutation<PendingUserListRemoveUserBulkMutation>(removePendingUserBulk);
  const [acceptUserBulkMutation] =
    useMutation<PendingUserListAcceptUserBulkMutation>(acceptPendingUserBulk);

  const [filter, setFilter] = useState<{
    search?: string;
    organization?: string;
  }>({
    search: undefined,
    organization,
  });

  const queryData = useLazyLoadQuery<userPendingListQuery>(
    UserPendingListQuery,
    {
      count: pageSize,
      orderMode: orderMode,
      orderBy: orderBy,
      searchTerm: filter.search,
      filters: filter.organization
        ? [{ key: FilterKeyEnum.ORGANIZATION_ID, value: [filter.organization] }]
        : undefined,
    }
  );

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const [data, refetch] = useRefetchableFragment<
    userPendingListQuery,
    userPendingList_users$key
  >(UserPendingListFragment, queryData);

  const userData = data.pendingUsers.edges.map(({ node }) =>
    readInlineData<UserList_fragment$key>(UserFragment, node)
  );

  const connectionID = data?.pendingUsers?.__id;
  const pendingUserListSubscriptionConfig = useMemo(
    () => ({
      variables: {
        connections: [connectionID],
        organizationId: organization,
      },
      subscription: UserPendingListSubscription,
    }),
    [connectionID, organization]
  );
  useSubscription(pendingUserListSubscriptionConfig);

  const rejectUser = useCallback(
    (row: UserList_fragment$data) => {
      removeUserMutation({
        variables: {
          user_id: row.id,
          organization_id: me!.selected_organization_id,
        },
      });
    },
    [removeUserMutation, me]
  );

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
      {
        accessorKey: 'actions',
        id: 'actions',
        minSize: 40,
        enableHiding: false,
        enableSorting: false,
        enableResizing: false,
        header: undefined,
        cell: ({ row }) => {
          return (
            <div className="flex items-center justify-end gap-1">
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
                    className="border">
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
            </div>
          );
        },
      },
    ],
    [t, rejectUser]
  );

  useEffect(() => {
    if (columnOrder.length === 0) {
      const defaultColumnOrder = columns.map((c) => c.id!);
      setColumnOrder(defaultColumnOrder);
    }
  }, [columnOrder.length, columns, setColumnOrder]);

  const handleRefetchData = (
    args?: Partial<userPendingListQuery$variables>
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

  const [selection, setSelection] = useState<SelectionState>({
    selectAll: false,
    selectedIds: new Set<string>(),
    excludedIds: new Set<string>(),
  });
  const { clearSelection } = useRowSelection(selection, setSelection);

  const buildBulkQueryVariables = (selectionState: SelectionState) => {
    return selectionState.selectAll
      ? {
          ids: [],
          searchTerm: filter.search,
          filters: [
            {
              key: FilterKeyEnum.ORGANIZATION_ID,
              value: [organization],
            },
          ],
          excludedIds: Array.from(selectionState.excludedIds) ?? [],
        }
      : {
          ids: Array.from(selectionState.selectedIds) ?? [],
          searchTerm: undefined,
          filters: [],
          excludedIds: [],
        };
  };

  const handleBulkAction = (
    selectionState: SelectionState,
    mutation: typeof acceptUserBulkMutation | typeof removeUserBulkMutation
  ) => {
    const params = buildBulkQueryVariables(selectionState);
    mutation({
      variables: params,
      onCompleted: () => {
        clearSelection();
        refetch({}, { fetchPolicy: 'network-only' });
      },
    });
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={userData}
        i18nKey={i18nKey(t)}
        onResetTable={resetAll}
        selectionOptions={{
          selectionState: {
            state: selection,
            onSelectionChange: setSelection,
          },
          selectionHeader: {
            actions: ({ selectionState }) => (
              <>
                <AlertDialogComponent
                  AlertTitle={t(
                    'PendingUserListPage.WarningUsersRejection.Title'
                  )}
                  actionButtonText={t(
                    'PendingUserListPage.WarningUsersRejection.Confirm'
                  )}
                  triggerElement={
                    <Button
                      variant="ghost-destructive"
                      size="icon"
                      className="border">
                      <CloseIcon className="h-4 w-4" />
                    </Button>
                  }
                  onClickContinue={() =>
                    handleBulkAction(selectionState, removeUserBulkMutation)
                  }>
                  {t('PendingUserListPage.WarningUsersRejection.Description')}
                </AlertDialogComponent>
                <AlertDialogComponent
                  AlertTitle={t('PendingUserListPage.WarningUsersAccept.Title')}
                  actionButtonText={t(
                    'PendingUserListPage.WarningUsersAccept.Confirm'
                  )}
                  triggerElement={
                    <Button
                      variant="ghost-primary"
                      size="icon"
                      className="border">
                      <CheckIcon className="h-4 w-4" />
                    </Button>
                  }
                  onClickContinue={() =>
                    handleBulkAction(selectionState, acceptUserBulkMutation)
                  }>
                  {t('PendingUserListPage.WarningUsersAccept.Description')}
                </AlertDialogComponent>
              </>
            ),
          },
        }}
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
