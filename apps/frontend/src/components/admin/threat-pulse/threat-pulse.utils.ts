import type { ChipSeverity, IconName } from '@filigran/design-system';
import {
  PulseNetworkPlatformStatus,
  PulseTrendDirection,
  type ThreatPulseOverviewQuery,
  type ThreatPulseTrendingQuery,
} from '@graphql/generated';

type Overview = ThreatPulseOverviewQuery['pulseNetworkOverview'];
export type ThreatPulseActivityDay = Overview['activity'][number];
export type ThreatPulseRejection = Overview['rejections'][number];
export type ThreatPulseTrendingItem =
  ThreatPulseTrendingQuery['pulseNetworkTrending']['items'][number];

export const THREAT_PULSE_ACTIVITY_METRICS = [
  'records',
  'batches',
  'platforms',
] as const;
export type ThreatPulseActivityMetric =
  (typeof THREAT_PULSE_ACTIVITY_METRICS)[number];

const STATUS_SEVERITY: Record<PulseNetworkPlatformStatus, ChipSeverity> = {
  [PulseNetworkPlatformStatus.Contributing]: 'low',
  [PulseNetworkPlatformStatus.Lapsed]: 'medium',
  [PulseNetworkPlatformStatus.PreviewOnly]: 'neutral',
};

const TREND_ICON: Record<PulseTrendDirection, IconName> = {
  [PulseTrendDirection.Rising]: 'arrow-up-right',
  [PulseTrendDirection.Stable]: 'minus',
  [PulseTrendDirection.Falling]: 'arrow-down',
};

export const platformStatusSeverity = (
  status: PulseNetworkPlatformStatus
): ChipSeverity => STATUS_SEVERITY[status];

export const trendIcon = (trend: PulseTrendDirection): IconName =>
  TREND_ICON[trend];

// A Threat Pulse day is a UTC calendar day.
export const pulseDayToDate = (day: string): Date =>
  new Date(`${day}T00:00:00.000Z`);

export const publishedShare = ({
  tracked,
  published,
}: {
  tracked: number;
  published: number;
}): number => (tracked > 0 ? Math.round((published / tracked) * 100) : 0);

export const activityValue = (
  day: ThreatPulseActivityDay,
  metric: ThreatPulseActivityMetric
): number => day[metric];

export const toSearchTerm = (value: string): string | null =>
  value.trim() || null;

export const trendingItemId = (item: ThreatPulseTrendingItem): string =>
  `${item.object_type}-${item.key_id}`;

export const rejectionId = (rejection: ThreatPulseRejection): string =>
  `${rejection.operation}-${rejection.code}`;
