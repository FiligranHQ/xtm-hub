import { useThreatPulsePlatformsLocalstorage } from '@/components/admin/threat-pulse/threat-pulse-platforms-localstorage';
import {
  platformStatusSeverity,
  pulseDayToDate,
  toSearchTerm,
} from '@/components/admin/threat-pulse/threat-pulse.utils';
import { ThreatPulseSection } from '@/components/admin/threat-pulse/ThreatPulseSection';
import {
  handleSortingChange,
  mapToSortingTableValue,
  OrderingMode as SortingOrderingMode,
} from '@/components/ui/handle-sorting.utils';
import { useTablePagination } from '@/hooks/use-table-pagination';
import { useTranslate } from '@/hooks/use-translate';
import { portalGraphqlClient } from '@/lib/graphql-client';
import { DEBOUNCE_TIME } from '@/utils/constant';
import { i18nKey } from '@/utils/datatable';
import {
  Alert,
  Chip,
  SearchField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
} from '@filigran/design-system';
import { DataTable, DataTableHeadBarOptions } from '@filigran/ui';
import {
  OrderingMode,
  PulseNetworkPlatformOrdering,
  PulseNetworkPlatformStatus,
  type ThreatPulsePlatformRowFragment,
  type ThreatPulsePlatformsQueryVariables,
  useThreatPulsePlatformsQuery,
} from '@graphql/generated';
import { threatPulseKeys } from '@graphql/threat-pulse/threat-pulse.keys';
import { ColumnDef } from '@tanstack/react-table';
import { useFormatter } from 'next-intl';
import { ChangeEvent, useMemo, useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';

const ALL_STATUSES = 'all';
const STATUSES = Object.values(PulseNetworkPlatformStatus);

export const ThreatPulsePlatforms = () => {
  const t = useTranslate();
  const format = useFormatter();
  const {
    pageSize,
    setPageSize,
    orderBy,
    setOrderBy,
    orderMode,
    setOrderMode,
    resetAll,
    removeOrder,
  } = useThreatPulsePlatformsLocalstorage();
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const [status, setStatus] = useState<PulseNetworkPlatformStatus | null>(null);
  const { pagination, setPagination, cursor, onPaginationChange } =
    useTablePagination({ pageSize, setPageSize });

  const variables = useMemo<ThreatPulsePlatformsQueryVariables>(
    () => ({
      count: pagination.pageSize,
      cursor,
      orderBy,
      orderMode,
      searchTerm,
      status,
    }),
    [pagination.pageSize, cursor, orderBy, orderMode, searchTerm, status]
  );
  const { data, isLoading, isError } = useThreatPulsePlatformsQuery(
    portalGraphqlClient,
    variables,
    { queryKey: threatPulseKeys.platforms(variables) }
  );

  const day = (value: string | null) =>
    value
      ? format.dateTime(pulseDayToDate(value), {
          dateStyle: 'medium',
          timeZone: 'UTC',
        })
      : '-';

  const columns: ColumnDef<ThreatPulsePlatformRowFragment>[] = [
    {
      accessorKey: 'title',
      id: PulseNetworkPlatformOrdering.Title,
      sortDescFirst: false,
      header: t('ThreatPulse.Platforms.Title'),
      cell: ({ row }) => <span className="truncate">{row.original.title}</span>,
    },
    {
      accessorKey: 'organization_name',
      id: PulseNetworkPlatformOrdering.OrganizationName,
      sortDescFirst: false,
      header: t('ThreatPulse.Platforms.Organization'),
      cell: ({ row }) => (
        <span className="truncate">
          {row.original.organization_name ?? '-'}
        </span>
      ),
    },
    {
      id: 'buckets',
      header: t('ThreatPulse.Platforms.Buckets'),
      enableSorting: false,
      cell: ({ row }) => {
        const { sector_bucket, region_bucket } = row.original;
        if (!sector_bucket || !region_bucket) {
          return '-';
        }
        return (
          <span className="truncate">
            {t('ThreatPulse.Platforms.BucketPair', {
              sector: t(`ThreatPulse.Sector.${sector_bucket}`),
              region: t(`ThreatPulse.Region.${region_bucket}`),
            })}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      id: PulseNetworkPlatformOrdering.Status,
      header: t('ThreatPulse.Platforms.Status'),
      cell: ({ row }) => (
        <Chip
          label={t(`ThreatPulse.PlatformStatus.${row.original.status}`)}
          severity={platformStatusSeverity(row.original.status)}
        />
      ),
    },
    {
      accessorKey: 'last_contribution_day',
      id: PulseNetworkPlatformOrdering.LastContributionDay,
      header: t('ThreatPulse.Platforms.LastContribution'),
      cell: ({ row }) => day(row.original.last_contribution_day),
    },
    {
      accessorKey: 'records_last_30_days',
      id: PulseNetworkPlatformOrdering.RecordsLast_30Days,
      header: t('ThreatPulse.Platforms.Records'),
      cell: ({ row }) =>
        t('ThreatPulse.Platforms.RecordsValue', {
          records: row.original.records_last_30_days,
          batches: row.original.batches_last_30_days,
        }),
    },
    {
      accessorKey: 'purge_requests',
      id: PulseNetworkPlatformOrdering.PurgeRequests,
      header: t('ThreatPulse.Platforms.PurgeRequests'),
      cell: ({ row }) =>
        row.original.purge_requests > 0
          ? t('ThreatPulse.Platforms.PurgeValue', {
              count: row.original.purge_requests,
              day: day(row.original.last_purge_day),
            })
          : '0',
    },
  ];

  const platforms = useMemo(
    () => (data?.pulseNetworkPlatforms.edges ?? []).map(({ node }) => node),
    [data]
  );
  const totalCount = data?.pulseNetworkPlatforms.totalCount ?? 0;

  const resetToFirstPage = () =>
    setPagination((previousPagination) => ({
      ...previousPagination,
      pageIndex: 0,
    }));

  const onSortingChange = (updater: unknown) => {
    handleSortingChange<PulseNetworkPlatformOrdering>({
      updater,
      orderBy,
      orderMode: orderMode as unknown as SortingOrderingMode,
      setOrderBy,
      setOrderMode: (nextOrderMode) =>
        setOrderMode(nextOrderMode as OrderingMode),
      removeOrder,
      handleRefetchData: resetToFirstPage,
    });
  };

  const updateSearchTerm = (value: string) => {
    setSearchTerm(toSearchTerm(value));
    resetToFirstPage();
  };
  const onSearchChange = useDebounceCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      updateSearchTerm(event.target.value),
    DEBOUNCE_TIME
  );
  const onSearchClear = () => {
    onSearchChange.cancel();
    updateSearchTerm('');
  };

  const onStatusChange = (value: string) => {
    setStatus(
      value === ALL_STATUSES ? null : (value as PulseNetworkPlatformStatus)
    );
    resetToFirstPage();
  };

  return (
    <ThreatPulseSection
      title={t('ThreatPulse.Platforms.SectionTitle')}
      description={t('ThreatPulse.Platforms.Description')}>
      {isError && (
        <Alert
          severity="error"
          title={t('ThreatPulse.LoadError')}
        />
      )}
      <DataTable
        columns={columns}
        data={platforms}
        isLoading={isLoading}
        i18nKey={i18nKey(t)}
        onResetTable={resetAll}
        tableOptions={{
          onSortingChange,
          onPaginationChange,
          manualSorting: true,
          manualPagination: true,
          rowCount: totalCount,
        }}
        tableState={{
          sorting: mapToSortingTableValue(orderBy, orderMode),
          pagination,
        }}
        toolbar={
          <div className="flex flex-col-reverse items-center justify-between gap-s sm:flex-row">
            <div className="flex w-full items-center gap-s sm:w-auto">
              <SearchField
                aria-label={t('ThreatPulse.Platforms.Search')}
                placeholder={t('ThreatPulse.Platforms.Search')}
                clearLabel={t('ThreatPulse.Platforms.ClearSearch')}
                onChange={onSearchChange}
                onClear={onSearchClear}
              />
              <Select
                value={status ?? ALL_STATUSES}
                onValueChange={onStatusChange}>
                <SelectTrigger
                  aria-label={t('ThreatPulse.Platforms.StatusFilter')}
                  className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_STATUSES}>
                    {t('ThreatPulse.Platforms.AllStatuses')}
                  </SelectItem>
                  {STATUSES.map((value) => (
                    <SelectItem
                      key={value}
                      value={value}>
                      {t(`ThreatPulse.PlatformStatus.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-full items-center justify-end gap-s sm:w-auto">
              <DataTableHeadBarOptions />
            </div>
          </div>
        }
      />
      {!isLoading && totalCount === 0 && (
        <Text
          variant="content-compact"
          className="text-center text-text-default-secondary">
          {t('ThreatPulse.Platforms.Empty')}
        </Text>
      )}
    </ThreatPulseSection>
  );
};
