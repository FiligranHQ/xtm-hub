import { TrialsManageUsersDialog } from '@/components/service/trial-instances/manage-users/trials-manage-users-dialog';
import { useTrialsListLocalstorage } from '@/components/trials/trial-list-localstorage';
import { TrialsTabType } from '@/components/trials/trials.const';
import {
  TrialsAdminCancelDeploymentRequestMutation,
  trialsFragment,
  trialsListFragment,
  TrialsListQuery,
  TrialsReorderRequestInQueueMutation,
} from '@/components/trials/trials.graphql';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import {
  handleSortingChange,
  mapToSortingTableValue,
  transformSortingValueToParams,
} from '@/components/ui/handle-sorting.utils';
import { SearchInput } from '@/components/ui/search-input';
import {
  useAdminByPass,
  useUserHasPortalCapability,
} from '@/hooks/usePortalCapability';
import { DEBOUNCE_TIME } from '@/utils/constant';
import { i18nKey } from '@/utils/datatable';
import { daysUntil, formatDate } from '@/utils/date';
import {
  ArrowShapeUpIcon,
  ArrowShapeUpStackIcon,
  CheckIndeterminateIcon,
  CloseIcon,
  GroupIcon,
} from '@filigran/icon';
import {
  DataTable,
  DataTableHeadBarOptions,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@filigran/ui';
import { toast } from '@filigran/ui/clients';
import { Button } from '@filigran/ui/servers';
import { TrialsListPaginationQuery$variables } from '@generated/TrialsListPaginationQuery.graphql';
import { DeploymentRequestFilterKeyEnum } from '@generated/models/DeploymentRequestFilterKey.enum';
import { DeploymentRequestHubStatusEnum } from '@generated/models/DeploymentRequestHubStatus.enum';
import { DeploymentRequestOrderingEnum } from '@generated/models/DeploymentRequestOrdering.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { PortalCapabilityEnum } from '@generated/models/PortalCapability.enum';
import { ReorderDeploymentRequestInQueueDirectionEnum } from '@generated/models/ReorderDeploymentRequestInQueueDirection.enum';
import { trialsAdminCancelDeploymentRequestMutation } from '@generated/trialsAdminCancelDeploymentRequestMutation.graphql';
import { trialsList$key } from '@generated/trialsList.graphql';
import { trialsListQuery } from '@generated/trialsListQuery.graphql';
import { trialsReorderRequestInQueueMutation } from '@generated/trialsReorderRequestInQueueMutation.graphql';
import {
  trials_fragment$data,
  trials_fragment$key,
} from '@generated/trials_fragment.graphql';
import { OrderingMode } from '@generated/userListQuery.graphql';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import {
  FunctionComponent,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  readInlineData,
  useLazyLoadQuery,
  useMutation,
  useRefetchableFragment,
} from 'react-relay';
import { useDebounceCallback } from 'usehooks-ts';

interface Props {
  type: TrialsTabType;
  platformIdentifier: PlatformIdentifierEnum;
}

const trialsTabConfig: Record<
  TrialsTabType,
  {
    statuses: DeploymentRequestHubStatusEnum[];
    defaultOrder: DeploymentRequestOrderingEnum;
    defaultOrderingMode?: OrderingMode;
  }
> = {
  [TrialsTabType.Cancelled]: {
    statuses: [DeploymentRequestHubStatusEnum.CANCELLED],
    defaultOrder: DeploymentRequestOrderingEnum.REQUEST_DATE,
  },
  [TrialsTabType.Expired]: {
    statuses: [DeploymentRequestHubStatusEnum.EXPIRED],
    defaultOrder: DeploymentRequestOrderingEnum.REQUEST_DATE,
  },
  [TrialsTabType.Running]: {
    statuses: [
      DeploymentRequestHubStatusEnum.ACTIVE,
      DeploymentRequestHubStatusEnum.PENDING,
      DeploymentRequestHubStatusEnum.PROVISIONING,
    ],
    defaultOrder: DeploymentRequestOrderingEnum.REQUEST_DATE,
  },
  [TrialsTabType.Waiting]: {
    statuses: [DeploymentRequestHubStatusEnum.QUEUED],
    defaultOrder: DeploymentRequestOrderingEnum.ORDERING,
    defaultOrderingMode: 'asc',
  },
};

const connectionIDs = new Map<TrialsTabType, string>();

const TrialsTab: FunctionComponent<Props> = ({ type, platformIdentifier }) => {
  const t = useTranslations();
  const isAdminByPass = useAdminByPass();
  const userHasModifyTrialCapa = useUserHasPortalCapability([
    PortalCapabilityEnum.MODIFY_TRIALS,
  ]);

  const canModifyTrial = isAdminByPass || userHasModifyTrialCapa;
  const isReorderTrialsAllowed =
    type === TrialsTabType.Waiting && canModifyTrial;
  const statuses = trialsTabConfig[type].statuses;
  const defaultOrder = trialsTabConfig[type].defaultOrder;
  const defaultOrderingMode =
    trialsTabConfig[type].defaultOrderingMode ?? 'desc';

  const [reorderTrigger, setReorderTrigger] = useState(0);

  const [commitReorderRequestInQueue] =
    useMutation<trialsReorderRequestInQueueMutation>(
      TrialsReorderRequestInQueueMutation
    );
  const [cancelDeploymentRequestMutation] =
    useMutation<trialsAdminCancelDeploymentRequestMutation>(
      TrialsAdminCancelDeploymentRequestMutation
    );

  const onReorderClick = useCallback(
    (id: string, direction: ReorderDeploymentRequestInQueueDirectionEnum) => {
      commitReorderRequestInQueue({
        variables: {
          input: {
            id,
            direction,
          },
        },
        onCompleted: () => {
          toast({
            title: t('Utils.Success'),
            description: t('TrialsDashboard.Toast.TrialsReordered'),
          });
          setReorderTrigger((prev) => prev + 1);
        },
        onError: (error) => {
          toast({
            variant: 'destructive',
            title: t('Utils.Error'),
            description: <>{t(`Error.Server.${error.message}`)}</>,
          });
        },
      });
    },
    [commitReorderRequestInQueue, t]
  );

  const onCancelClick = useCallback(
    (deploymentRequestId: string, currentConnectionID: string) => {
      cancelDeploymentRequestMutation({
        variables: {
          deploymentRequestId: deploymentRequestId,
          removeConnections: [currentConnectionID],
        },
        updater: (store) => {
          const cancelledConnectionID = connectionIDs.get(
            TrialsTabType.Cancelled
          );
          if (cancelledConnectionID) {
            const cancelledConnection = store.get(cancelledConnectionID);
            if (cancelledConnection) {
              cancelledConnection.invalidateRecord();
            }
          }
        },
        onCompleted: () => {
          toast({
            title: t('Utils.Success'),
            description: t('Service.Trials.Cancellation.Toast.Admin'),
          });
        },
        onError: (error) => {
          toast({
            variant: 'destructive',
            title: t('Utils.Error'),
            description: t(`Error.Server.${error.message}`),
          });
        },
      });
    },
    [cancelDeploymentRequestMutation, t]
  );

  const columns: ColumnDef<trials_fragment$data>[] = useMemo(
    () => [
      ...(type === TrialsTabType.Waiting
        ? [
            {
              accessorKey: 'ordering',
              id: 'ordering',
              enableSorting: !isReorderTrialsAllowed,
              header: t('TrialsDashboard.Columns.Priority'),
            },
          ]
        : []),
      {
        accessorKey: 'requester_email',
        id: 'requester_email',
        enableSorting: !isReorderTrialsAllowed,
        header: t('TrialsDashboard.Columns.Email'),
      },
      {
        accessorKey: 'organization_name',
        id: 'organization_name',
        enableSorting: !isReorderTrialsAllowed,
        header: t('TrialsDashboard.Columns.Organization'),
      },
      ...(type === TrialsTabType.Waiting
        ? [
            {
              accessorKey: 'request_date',
              id: 'request_date',
              enableSorting: !isReorderTrialsAllowed,
              header: t('TrialsDashboard.Columns.RequestDate'),
              cell: ({ row }: { row: { original: trials_fragment$data } }) => {
                return (
                  <span className="truncate">
                    {row.original.request_date
                      ? formatDate(row.original.request_date, 'DATE_FULL')
                      : '-'}
                  </span>
                );
              },
            },
          ]
        : [
            {
              accessorKey: 'start_date',
              id: 'start_date',
              enableSorting: !isReorderTrialsAllowed,
              header: t('TrialsDashboard.Columns.StartDate'),
              cell: ({ row }: { row: { original: trials_fragment$data } }) => {
                return (
                  <span className="truncate">
                    {row.original.start_date
                      ? formatDate(row.original.start_date, 'DATE_FULL')
                      : '-'}
                  </span>
                );
              },
            },
            {
              accessorKey: 'end_date',
              id: 'end_date',
              enableSorting: !isReorderTrialsAllowed,
              header: t('TrialsDashboard.Columns.EndDate'),
              cell: ({ row }: { row: { original: trials_fragment$data } }) => {
                return (
                  <span className="truncate">
                    {row.original.end_date
                      ? formatDate(row.original.end_date, 'DATE_FULL')
                      : '-'}
                  </span>
                );
              },
            },
          ]),
      ...(type === TrialsTabType.Running
        ? [
            {
              accessorKey: 'remainingDays',
              id: 'remainingDays',
              header: t('TrialsDashboard.Columns.RemainingDays'),
              enableSorting: false,
              cell: ({ row }: { row: { original: trials_fragment$data } }) => {
                if (!row.original?.end_date) return <>-</>;
                const target = new Date(row.original.end_date);
                const diffInDays = daysUntil(target);
                return <span className="truncate">{diffInDays}</span>;
              },
            },
          ]
        : []),
      {
        accessorKey: 'hub_status',
        id: 'hub_status',
        enableSorting: !isReorderTrialsAllowed,
        header: t('TrialsDashboard.Columns.Status'),
      },
      {
        accessorKey: 'region',
        id: 'region',
        enableSorting: !isReorderTrialsAllowed,
        header: t('TrialsDashboard.Columns.Region'),
      },
      {
        accessorKey: 'platform_id',
        id: 'platform_id',
        header: t('TrialsDashboard.Columns.PlatformId'),
        enableSorting: false,
        cell: ({ row }: { row: { original: trials_fragment$data } }) => {
          return (
            <span className="truncate">{row.original.platform_id || '-'}</span>
          );
        },
      },
      {
        accessorKey: 'platform_url',
        id: 'platform_url',
        header: t('TrialsDashboard.Columns.PlatformUrl'),
        enableSorting: false,
        cell: ({ row }: { row: { original: trials_fragment$data } }) => {
          return (
            <span className="truncate">{row.original.platform_url || '-'}</span>
          );
        },
      },
      {
        accessorKey: 'registration_status',
        id: 'registration_status',
        header: t('TrialsDashboard.Columns.RegistrationStatus'),
        enableSorting: false,
        cell: ({ row }: { row: { original: trials_fragment$data } }) => {
          const isRegistered = !!row.original.platform_id;
          return (
            <span className="truncate">
              {isRegistered
                ? t('TrialsDashboard.Registered')
                : t('TrialsDashboard.NotRegistered')}
            </span>
          );
        },
      },
      ...(type === TrialsTabType.Cancelled
        ? [
            {
              header: t('TrialsDashboard.Columns.CancellationDate'),
              accessorKey: 'cancellation_date',
              id: 'cancellation_date',
              cell: ({ row }: { row: { original: trials_fragment$data } }) => {
                return (
                  <span className="truncate">
                    {row.original.cancellation_date
                      ? formatDate(row.original.cancellation_date, 'DATE_FULL')
                      : '-'}
                  </span>
                );
              },
            },
            {
              header: t('TrialsDashboard.Columns.CancellationOwner'),
              accessorKey: 'cancellation_user_email',
              id: 'cancellation_user_email',
            },
            {
              header: t('TrialsDashboard.Columns.CancellationReason'),
              accessorKey: 'cancellation_reason',
              id: 'cancellation_reason',
              cell: ({ row }: { row: { original: trials_fragment$data } }) => {
                const reason = row.original.cancellation_reason;
                if (!reason) return <span>-</span>;
                const otherLabel = t(
                  'Service.Trials.Cancellation.ConfirmationForm.CancellationReasonOther'
                );
                let displayReason: string;
                if (reason.startsWith('Other:')) {
                  const freeText = reason.slice('Other:'.length).trim();
                  displayReason = freeText
                    ? `${otherLabel}: ${freeText}`
                    : otherLabel;
                } else if (reason.toLowerCase() === 'other') {
                  displayReason = otherLabel;
                } else {
                  displayReason = t(
                    `Service.Trials.CancellationReason.${reason}`
                  );
                }
                return (
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="truncate block cursor-help">
                          {displayReason}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-50 max-w-md">
                        {displayReason}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              },
            },
          ]
        : []),
    ],
    [type, t, isReorderTrialsAllowed]
  );

  const actionColumns: ColumnDef<trials_fragment$data>[] =
    (type === TrialsTabType.Running || type === TrialsTabType.Waiting) &&
    canModifyTrial
      ? [
          {
            accessorKey: 'actions',
            id: 'actions',
            enableHiding: false,
            enableSorting: false,
            enableResizing: false,
            header: undefined,
            cell: ({ row }: { row: { original: trials_fragment$data } }) => {
              return (
                <>
                  {(type === TrialsTabType.Running ||
                    type === TrialsTabType.Waiting) && (
                    <AlertDialogComponent
                      AlertTitle={t(
                        'Service.Trials.Cancellation.Confirmation.Title'
                      )}
                      actionButtonText={t('MenuActions.Delete')}
                      triggerElement={
                        <Button
                          variant="ghost-destructive"
                          size="icon"
                          className="border m-1">
                          <CloseIcon className="h-4 w-4" />
                        </Button>
                      }
                      onClickContinue={() =>
                        onCancelClick(
                          row.original.id,
                          currentConnectionID ?? ''
                        )
                      }>
                      {t('Service.Trials.Cancellation.Confirmation.Admin', {
                        organizationName: row.original.organization_name ?? '',
                      })}
                    </AlertDialogComponent>
                  )}
                  {isReorderTrialsAllowed && (
                    <>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost-primary"
                              size="icon"
                              className="border m-1"
                              onClick={() =>
                                onReorderClick(
                                  row.original.id,
                                  ReorderDeploymentRequestInQueueDirectionEnum.TOP
                                )
                              }>
                              <ArrowShapeUpStackIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-50">
                            {t('TrialsDashboard.Actions.MoveToTop')}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost-primary"
                              size="icon"
                              className="border m-1"
                              onClick={() =>
                                onReorderClick(
                                  row.original.id,
                                  ReorderDeploymentRequestInQueueDirectionEnum.UP
                                )
                              }>
                              <ArrowShapeUpIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-50">
                            {t('TrialsDashboard.Actions.MoveUp')}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </>
                  )}
                  {type === TrialsTabType.Running &&
                    isAdminByPass &&
                    row.original.hub_status ===
                      DeploymentRequestHubStatusEnum.ACTIVE && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <TrialsManageUsersDialog
                              serviceInstanceId={
                                row.original.service_instance_id
                              }
                              organizationId={
                                row.original.organization_requester_id
                              }
                              trigger={
                                <Button
                                  variant="ghost-primary"
                                  size="icon"
                                  className="border m-1">
                                  <GroupIcon className="h-4 w-4" />
                                </Button>
                              }
                            />
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-50">
                            {t('Service.Trials.ManageUsers.Title')}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                </>
              );
            },
          },
        ]
      : [];

  const finalColumns = [...columns, ...actionColumns];
  const {
    pageSize,
    setPageSize,
    orderMode,
    setOrderMode,
    orderBy,
    setOrderBy,
    removeOrder,
    columnOrder,
    setColumnOrder,
    columnVisibility,
    setColumnVisibility,
    resetAll,
  } = useTrialsListLocalstorage(
    columns,
    type,
    defaultOrder,
    defaultOrderingMode
  );

  const queryData = useLazyLoadQuery<trialsListQuery>(
    TrialsListQuery,
    {
      count: pageSize,
      orderMode: defaultOrderingMode,
      orderBy: defaultOrder,
      filters: [
        { key: DeploymentRequestFilterKeyEnum.TYPE, value: ['trial'] },
        { key: DeploymentRequestFilterKeyEnum.HUB_STATUS, value: statuses },
        {
          key: DeploymentRequestFilterKeyEnum.PLATFORM_IDENTIFIER,
          value: [platformIdentifier],
        },
      ],
    },
    { fetchPolicy: 'store-and-network' }
  );

  const [data, refetch] = useRefetchableFragment<
    trialsListQuery,
    trialsList$key
  >(trialsListFragment, queryData);

  const currentConnectionID = data?.deploymentRequestsList?.__id;

  useEffect(() => {
    if (currentConnectionID) {
      connectionIDs.set(type, currentConnectionID);
    }
  }, [currentConnectionID, type]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const trialsDataTable = useMemo<trials_fragment$data[]>(
    () =>
      data.deploymentRequestsList.edges?.map?.(({ node }) =>
        readInlineData<trials_fragment$key>(trialsFragment, node)
      ) as trials_fragment$data[],
    [data]
  );

  const handleRefetchData = useCallback(
    (args?: Partial<TrialsListPaginationQuery$variables>) => {
      const sorting = mapToSortingTableValue(orderBy, orderMode);
      refetch(
        {
          count: pagination.pageSize,
          cursor: btoa(String(pagination.pageSize * pagination.pageIndex)),
          orderBy,
          orderMode,
          searchTerm: undefined,
          ...transformSortingValueToParams(sorting),
          ...args,
        },
        { fetchPolicy: 'store-and-network' }
      );
    },
    [orderBy, orderMode, pagination.pageIndex, pagination.pageSize, refetch]
  );

  useEffect(() => {
    if (reorderTrigger > 0) {
      handleRefetchData();
    }
  }, [reorderTrigger, handleRefetchData]);

  const onSortingChange = (updater: unknown) => {
    handleSortingChange<DeploymentRequestOrderingEnum>({
      updater,
      orderBy,
      orderMode,
      setOrderMode,
      setOrderBy,
      removeOrder,
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
    handleRefetchData({ searchTerm: inputValue });
  };

  const debounceHandleInput = useDebounceCallback(
    (e) => handleInputChange(e.target.value),
    DEBOUNCE_TIME
  );

  return (
    <Suspense fallback={null}>
      <DataTable
        columns={finalColumns}
        data={trialsDataTable}
        toolbar={
          <div>
            <div className="flex flex-col-reverse items-center justify-between gap-s sm:flex-row">
              <label
                htmlFor="requester_email"
                className="sr-only">
                {t('TrialsDashboard.Actions.SearchTrials')}
              </label>
              <SearchInput
                id="requester_email"
                containerClass="w-full sm:w-1/3"
                placeholder={t('TrialsDashboard.Actions.SearchTrials')}
                onChange={debounceHandleInput}
              />
              <div className="flex w-full items-center justify-between gap-s sm:w-auto">
                <DataTableHeadBarOptions />
              </div>
            </div>
            <div className="border border-solid border-orange rounded text-orange flex items-center gap-xs p-s text-sm mt-4">
              <CheckIndeterminateIcon className="shrink-0 h-4 w-4 mr-xs" />
              {t('TrialsDashboard.WarningCancellation')}
            </div>
          </div>
        }
        onResetTable={resetAll}
        tableOptions={{
          onSortingChange: onSortingChange,
          onPaginationChange: onPaginationChange,
          manualSorting: true,
          manualPagination: true,
          onColumnOrderChange: setColumnOrder,
          onColumnVisibilityChange: setColumnVisibility,
        }}
        i18nKey={i18nKey(t)}
        tableState={{
          sorting: mapToSortingTableValue(orderBy, orderMode),
          pagination,
          columnOrder,
          columnVisibility,
        }}
      />
    </Suspense>
  );
};
export default TrialsTab;
