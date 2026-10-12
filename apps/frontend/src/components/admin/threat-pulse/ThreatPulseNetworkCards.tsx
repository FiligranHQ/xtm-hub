import { useTranslate } from '@/hooks/use-translate';
import { Paper, Text } from '@filigran/design-system';
import { type ThreatPulseOverviewQuery } from '@graphql/generated';
import { useFormatter } from 'next-intl';
import { useState } from 'react';

type Overview = ThreatPulseOverviewQuery['pulseNetworkOverview'];

interface StatTileProps {
  label: string;
  value: string;
  details: string[];
}

const StatTile = ({ label, value, details }: StatTileProps) => (
  <Paper
    padding={16}
    className="flex min-w-0 flex-col gap-xs">
    <Text
      as="dt"
      variant="content-compact-medium"
      className="text-text-default-secondary">
      {label}
    </Text>
    <Text
      as="dd"
      variant="title-xl"
      className="truncate text-text-default-primary">
      {value}
    </Text>
    {details.map((detail) => (
      <Text
        key={detail}
        as="dd"
        variant="content-caption"
        className="text-text-default-secondary">
        {detail}
      </Text>
    ))}
  </Paper>
);

interface ThreatPulseNetworkCardsProps {
  overview: Overview;
}

export const ThreatPulseNetworkCards = ({
  overview,
}: ThreatPulseNetworkCardsProps) => {
  const t = useTranslate();
  const format = useFormatter();
  const [now] = useState(() => new Date());
  const { platforms, keys, ingestion, settings } = overview;

  const count = (value: number | null) =>
    value === null ? t('ThreatPulse.Cards.Unknown') : format.number(value);
  const age = (date: string | null) =>
    date
      ? format.relativeTime(new Date(date), now)
      : t('ThreatPulse.Cards.Never');
  const known = <T,>(value: T | null, render: (value: T) => string) =>
    value === null ? [] : [render(value)];

  const tiles: StatTileProps[] = [
    {
      label: t('ThreatPulse.Cards.Contributing'),
      value: count(platforms.contributing),
      details: [
        t('ThreatPulse.Cards.ContributingActive', {
          day: platforms.active_last_24_hours,
          week: platforms.active_last_7_days,
        }),
        t('ThreatPulse.Cards.Registered', { count: platforms.registered }),
      ],
    },
    {
      label: t('ThreatPulse.Cards.PreviewOnly'),
      value: count(platforms.preview_only),
      details: [
        t('ThreatPulse.Cards.PreviewOnlyDetail'),
        ...(platforms.unregistered
          ? [
              t('ThreatPulse.Cards.Unregistered', {
                count: platforms.unregistered,
              }),
            ]
          : []),
      ],
    },
    {
      label: t('ThreatPulse.Cards.Lapsed'),
      value: count(platforms.lapsed),
      details: known(settings.contribution_grace_days, (grace) =>
        t('ThreatPulse.Cards.LapsedDetail', { grace })
      ),
    },
    {
      label: t('ThreatPulse.Cards.Keys'),
      value: count(keys.tracked),
      details: [
        t('ThreatPulse.Cards.KeysDetail', {
          published: keys.published,
          suppressed: keys.suppressed,
        }),
      ],
    },
    {
      label: t('ThreatPulse.Cards.Today'),
      value: count(ingestion.batches_today),
      details: [
        t('ThreatPulse.Cards.Records', { count: ingestion.records_today }),
      ],
    },
    {
      label: t('ThreatPulse.Cards.LastMonth'),
      value: count(ingestion.batches_last_30_days),
      details: [
        t('ThreatPulse.Cards.Records', {
          count: ingestion.records_last_30_days,
        }),
      ],
    },
    {
      label: t('ThreatPulse.Cards.Privacy'),
      value:
        settings.k_threshold === null
          ? t('ThreatPulse.Cards.Unknown')
          : t('ThreatPulse.Cards.PrivacyValue', { k: settings.k_threshold }),
      details: [
        ...known(settings.retention_months, (months) =>
          t('ThreatPulse.Cards.Retention', {
            days: settings.retention_days ?? 0,
            months,
          })
        ),
        ...known(settings.digest_size, (size) =>
          t('ThreatPulse.Cards.DigestSize', { count: size })
        ),
      ],
    },
    {
      label: t('ThreatPulse.Cards.LastDigest'),
      value: age(overview.last_digest_at),
      details: [
        t('ThreatPulse.Cards.LastTrending', {
          age: age(overview.last_trending_at),
        }),
        t('ThreatPulse.Cards.DigestReaders', {
          count: platforms.digest_readers_last_24_hours,
        }),
      ],
    },
  ];

  return (
    <dl className="grid grid-cols-1 gap-l md:grid-cols-2 xl:grid-cols-4">
      {tiles.map((tile) => (
        <StatTile
          key={tile.label}
          {...tile}
        />
      ))}
    </dl>
  );
};
