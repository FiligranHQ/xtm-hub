import { ThreatPulseSection } from '@/components/admin/threat-pulse/ThreatPulseSection';
import {
  publishedShare,
  pulseDayToDate,
  ThreatPulseTrendingItem,
  trendIcon,
  trendingItemId,
} from '@/components/admin/threat-pulse/threat-pulse.utils';
import { useTranslate } from '@/hooks/use-translate';
import { portalGraphqlClient } from '@/lib/graphql-client';
import { i18nKey } from '@/utils/datatable';
import {
  Alert,
  Chip,
  Icon,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from '@filigran/design-system';
import { DataTable } from '@filigran/ui';
import {
  PulsePeriod,
  type ThreatPulseOverviewQuery,
  useThreatPulseTrendingQuery,
} from '@graphql/generated';
import { threatPulseKeys } from '@graphql/threat-pulse/threat-pulse.keys';
import { ColumnDef } from '@tanstack/react-table';
import { useFormatter } from 'next-intl';
import { useMemo, useState } from 'react';

const THREAT_PULSE_TRENDING_PERIODS = [
  PulsePeriod.Last_7Days,
  PulsePeriod.Last_30Days,
] as const;
const THREAT_PULSE_TRENDING_SIZE = 50;

type TrendingRow = ThreatPulseTrendingItem & { id: string };

const ThreatPulseTrendingPanel = ({ period }: { period: PulsePeriod }) => {
  const t = useTranslate();
  const format = useFormatter();
  const [now] = useState(() => new Date());
  const variables = useMemo(
    () => ({ period, first: THREAT_PULSE_TRENDING_SIZE }),
    [period]
  );
  const { data, isLoading, isError } = useThreatPulseTrendingQuery(
    portalGraphqlClient,
    variables,
    { queryKey: threatPulseKeys.trending(variables) }
  );

  const rows = useMemo<TrendingRow[]>(
    () =>
      (data?.pulseNetworkTrending.items ?? []).map((item) => ({
        ...item,
        id: trendingItemId(item),
      })),
    [data]
  );

  const columns: ColumnDef<TrendingRow>[] = [
    {
      accessorKey: 'object_type',
      id: 'object_type',
      header: t('ThreatPulse.Trending.Type'),
      cell: ({ row }) => (
        <span className="truncate">
          {t(`ThreatPulse.ObjectType.${row.original.object_type}`)}
        </span>
      ),
    },
    {
      accessorKey: 'key_id',
      id: 'key_id',
      header: t('ThreatPulse.Trending.Key'),
      enableSorting: false,
      cell: ({ row }) => (
        <Text
          variant="content-code"
          className="truncate">
          {row.original.key_id}
        </Text>
      ),
    },
    {
      accessorKey: 'platforms_bucket',
      id: 'platforms_bucket',
      header: t('ThreatPulse.Trending.Platforms'),
      enableSorting: false,
    },
    {
      accessorKey: 'prevalence_bucket',
      id: 'prevalence_bucket',
      header: t('ThreatPulse.Trending.Prevalence'),
      enableSorting: false,
      cell: ({ row }) => (
        <Chip
          label={t(`ThreatPulse.Prevalence.${row.original.prevalence_bucket}`)}
        />
      ),
    },
    {
      accessorKey: 'growth',
      id: 'growth',
      header: t('ThreatPulse.Trending.Trend'),
      cell: ({ row }) => (
        <span className="flex items-center gap-xs">
          <Icon
            name={trendIcon(row.original.trend)}
            size={16}
          />
          {t('ThreatPulse.Trending.Growth', {
            trend: t(`ThreatPulse.Trend.${row.original.trend}`),
            growth: format.number(row.original.growth, {
              maximumFractionDigits: 1,
            }),
          })}
        </span>
      ),
    },
    {
      accessorKey: 'first_seen_network',
      id: 'first_seen_network',
      header: t('ThreatPulse.Trending.FirstSeen'),
      cell: ({ row }) =>
        row.original.first_seen_network
          ? format.dateTime(pulseDayToDate(row.original.first_seen_network), {
              dateStyle: 'medium',
              timeZone: 'UTC',
            })
          : '-',
    },
  ];

  if (isError) {
    return (
      <Alert
        severity="error"
        title={t('ThreatPulse.LoadError')}
      />
    );
  }

  const computedAt = data?.pulseNetworkTrending.computed_at;
  return (
    <div className="flex min-w-0 flex-col gap-m">
      <Text
        variant="content-caption"
        className="text-text-default-secondary">
        {computedAt
          ? t('ThreatPulse.Trending.ComputedAt', {
              age: format.relativeTime(new Date(computedAt), now),
            })
          : t('ThreatPulse.Trending.NotComputed')}
      </Text>
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        i18nKey={i18nKey(t)}
      />
      {!isLoading && rows.length === 0 && (
        <Text
          variant="content-compact"
          className="text-center text-text-default-secondary">
          {t('ThreatPulse.Trending.Empty')}
        </Text>
      )}
    </div>
  );
};

interface ThreatPulseTrendingProps {
  overview: ThreatPulseOverviewQuery['pulseNetworkOverview'];
}

export const ThreatPulseTrending = ({ overview }: ThreatPulseTrendingProps) => {
  const t = useTranslate();
  const [period, setPeriod] = useState<PulsePeriod>(PulsePeriod.Last_7Days);
  const { keys, settings } = overview;

  return (
    <ThreatPulseSection
      title={t('ThreatPulse.Trending.Title')}
      description={
        settings.k_threshold === null
          ? t('ThreatPulse.Trending.Description')
          : t('ThreatPulse.Trending.Ratio', {
              published: keys.published,
              tracked: keys.tracked,
              suppressed: keys.suppressed,
              share: publishedShare(keys),
              k: settings.k_threshold,
            })
      }>
      <Tabs
        value={period}
        onValueChange={(value) => setPeriod(value as PulsePeriod)}
        activationMode="automatic">
        <TabsList>
          {THREAT_PULSE_TRENDING_PERIODS.map((value) => (
            <TabsTrigger
              key={value}
              value={value}>
              {t(`ThreatPulse.Period.${value}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        {THREAT_PULSE_TRENDING_PERIODS.map((value) => (
          <TabsContent
            key={value}
            value={value}
            className="pt-l">
            <ThreatPulseTrendingPanel period={value} />
          </TabsContent>
        ))}
      </Tabs>
    </ThreatPulseSection>
  );
};
