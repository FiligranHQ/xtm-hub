import { useTrialsListLocalstorage } from '@/components/trials/trial-list-localstorage';
import { TrialsTabType } from '@/components/trials/trials.const';
import {
  trialsFragment,
  trialsListFragment,
  TrialsListQuery,
  TrialsReorderRequestInQueueMutation,
} from '@/components/trials/trials.graphql';
import {
  handleSortingChange,
  mapToSortingTableValue,
  transformSortingValueToParams,
} from '@/components/ui/handle-sorting.utils';
import { SearchInput } from '@/components/ui/search-input';
import { DEBOUNCE_TIME } from '@/utils/constant';
import { i18nKey } from '@/utils/datatable';
import { daysUntil, formatDate } from '@/utils/date';
import { TrialsListPaginationQuery$variables } from '@generated/TrialsListPaginationQuery.graphql';
import { DeploymentRequestHubStatusEnum } from '@generated/models/DeploymentRequestHubStatus.enum';
import { DeploymentRequestOrderingEnum } from '@generated/models/DeploymentRequestOrdering.enum';
import { OrderingModeEnum } from '@generated/models/OrderingMode.enum';
import { ReorderDeploymentRequestInQueueDirectionEnum } from '@generated/models/ReorderDeploymentRequestInQueueDirection.enum';
import { trialsList$key } from '@generated/trialsList.graphql';
import { trialsListQuery } from '@generated/trialsListQuery.graphql';
import { trialsReorderRequestInQueueMutation } from '@generated/trialsReorderRequestInQueueMutation.graphql';
import {
  trials_fragment$data,
  trials_fragment$key,
} from '@generated/trials_fragment.graphql';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import {
  ArrowShapeUpIcon,
  ArrowShapeUpStackIcon,
  CheckIndeterminateIcon,
  CloseIcon,
} from 'filigran-icon';
import {
  DataTable,
  DataTableHeadBarOptions,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'filigran-ui';
import { toast } from 'filigran-ui/clients';
import { Button } from 'filigran-ui/servers';
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

interface TrialsTabProps {
  type: TrialsTabType;
}

const trialsTabConfig: Record<
  TrialsTabType,
  {
    statuses: DeploymentRequestHubStatusEnum[];
    defaultOrder?: DeploymentRequestOrderingEnum;
    defaultOrderingMode?: OrderingModeEnum;
  }
> = {
  [TrialsTabType.Cancelled]: {
    statuses: [DeploymentRequestHubStatusEnum.CANCELLED],
  },
  [TrialsTabType.Expired]: {
    statuses: [DeploymentRequestHubStatusEnum.EXPIRED],
  },
  [TrialsTabType.Running]: {
    statuses: [
      DeploymentRequestHubStatusEnum.ACTIVE,
      DeploymentRequestHubStatusEnum.PENDING,
    ],
  },
  [TrialsTabType.Waiting]: {
    statuses: [DeploymentRequestHubStatusEnum.QUEUED],
    defaultOrder: DeploymentRequestOrderingEnum.ORDERING,
    defaultOrderingMode: OrderingModeEnum.ASC,
  },
};

const TrialsTab: FunctionComponent<TrialsTabProps> = ({ type }) => {
  const t = useTranslations();

  const statuses = trialsTabConfig[type].statuses;
  const defaultOrder =
    trialsTabConfig[type].defaultOrder ??
    DeploymentRequestOrderingEnum.REQUEST_DATE;
  const defaultOrderingMode =
    trialsTabConfig[type].defaultOrderingMode ?? OrderingModeEnum.DESC;
  const [shouldRefreshAfterReorder, setShouldRefreshAfterReorder] =
    useState(false);

  const [commitReorderRequestInQueue] =
    useMutation<trialsReorderRequestInQueueMutation>(
      TrialsReorderRequestInQueueMutation
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
          setShouldRefreshAfterReorder(true);
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

  const columns: ColumnDef<trials_fragment$data>[] = useMemo(
    () => [
      ...(type === TrialsTabType.Waiting
        ? [
            {
              accessorKey: 'ordering',
              id: 'ordering',
              header: t('TrialsDashboard.Columns.Priority'),
            },
          ]
        : []),
      {
        accessorKey: 'requester_email',
        id: 'requester_email',
        header: t('TrialsDashboard.Columns.Email'),
      },
      {
        accessorKey: 'organization_name',
        id: 'organization_name',
        header: t('TrialsDashboard.Columns.Organization'),
      },
      ...(type === TrialsTabType.Waiting
        ? [
            {
              accessorKey: 'request_date',
              id: 'request_date',
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
        header: t('TrialsDashboard.Columns.Status'),
      },
      {
        accessorKey: 'region',
        id: 'region',
        header: t('TrialsDashboard.Columns.Region'),
      },
      ...(type === TrialsTabType.Cancelled
        ? [
            {
              header: t('TrialsDashboard.Columns.CancellationDate'),
            },
            {
              header: t('TrialsDashboard.Columns.CancellationOwner'),
            },
          ]
        : []),
      ...(type === TrialsTabType.Running || type === TrialsTabType.Waiting
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
                      <Button
                        variant="ghost-destructive"
                        size="icon"
                        className="border m-1">
                        <CloseIcon className="h-4 w-4" />
                      </Button>
                    )}
                    {type === TrialsTabType.Waiting && (
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
                  </>
                );
              },
            },
          ]
        : []),
    ],
    [t, type, onReorderClick]
  );

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
  } = useTrialsListLocalstorage(columns);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const queryData = useLazyLoadQuery<trialsListQuery>(TrialsListQuery, {
    count: pageSize,
    orderMode: defaultOrderingMode,
    orderBy: defaultOrder,
    filters: [
      { key: 'type', value: ['trial'] },
      { key: 'hub_status', value: statuses },
    ],
  });

  const [data, refetch] = useRefetchableFragment<
    trialsListQuery,
    trialsList$key
  >(trialsListFragment, queryData);

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
    if (!shouldRefreshAfterReorder) {
      return;
    }

    setShouldRefreshAfterReorder(false);
    handleRefetchData();
  }, [shouldRefreshAfterReorder, handleRefetchData]);

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
        columns={columns}
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
