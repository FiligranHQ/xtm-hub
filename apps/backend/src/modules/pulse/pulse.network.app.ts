import { dbConnections } from '../../../knexfile';
import {
  PlatformIdentifier,
  PulseContributionStatus,
  PulseNetworkOverview,
  PulseNetworkPlatformConnection,
  PulseNetworkPlatformCounts,
  PulseNetworkPlatformStatus,
  PulseNetworkSettings,
  QueryPulseNetworkPlatformsArgs,
} from '../../__generated__/resolvers-types';
import {
  ActivePlatformOwner,
  RegistrationDomain,
} from '../registration/registration.domain';
import {
  PulseConfig,
  PulseRuntimeConfig,
  PulseSecrets,
  PulseSettings,
} from './pulse.config';
import { PULSE_ACTIVITY_WINDOW_DAYS, PulseOperation } from './pulse.const';
import { PulseCrypto } from './pulse.crypto.helper';
import { PulseClock, PulseDay } from './pulse.day.helper';
import { PulseNetworkDomain } from './pulse.network.domain';
import {
  PULSE_NETWORK_RECENT_DAYS,
  PulseNetworkHelper,
  PulseNetworkPlatformActivity,
  PulseNetworkRegistration,
  PulseNetworkRejectionCount,
} from './pulse.network.helper';
import { PulseStats } from './pulse.stats.helper';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Refused requests are counted in memory and written once a minute: a flood
// of refused calls never turns into as many writes on one row.
const pendingRejections = new Map<string, PulseNetworkRejectionCount>();

const addPendingRejections = (count: PulseNetworkRejectionCount): void => {
  const id = `${count.day}|${count.operation}|${count.code}`;
  const pending = pendingRejections.get(id);
  pendingRejections.set(id, {
    ...count,
    count: (pending?.count ?? 0) + count.count,
  });
};

const settingsOf = (
  config: PulseRuntimeConfig,
  today: string
): PulseNetworkSettings => {
  const { settings, retentionMonths } = config;
  return {
    enabled: config.enabled,
    disabled_reason: config.enabled ? null : config.reason,
    k_threshold: settings?.kThreshold ?? null,
    retention_months: retentionMonths,
    retention_days:
      retentionMonths === null
        ? null
        : PulseDay.daysBetween(
            PulseDay.retentionStart(today, retentionMonths),
            today
          ) + 1,
    digest_size: settings?.digestSize ?? null,
    contribution_window_days: settings?.contributionWindowDays ?? null,
    contribution_grace_days: settings?.contributionGraceDays ?? null,
    trending_cache_ttl_minutes: settings?.trendingCacheTtlMinutes ?? null,
  };
};

const statusResolver =
  (settings: PulseSettings, today: string) =>
  (lastContributionDay: string | null): PulseContributionStatus =>
    PulseStats.contributionState({
      lastContributionDay,
      today,
      windowDays: settings.contributionWindowDays,
      graceDays: settings.contributionGraceDays,
    }).status;

const loadOwners = () =>
  RegistrationDomain.loadActivePlatformOwners(PlatformIdentifier.Opencti);

// Matching a registration to its contributions needs the platform key.
const toRegistrations = (
  owners: readonly ActivePlatformOwner[],
  secrets: PulseSecrets
): PulseNetworkRegistration[] =>
  owners.map((owner) => ({
    serviceInstanceId: owner.service_instance_id,
    pseudonym: PulseCrypto.platformPseudonym(
      owner.platform_id,
      secrets.platformKey
    ),
    title: owner.title,
    organizationName: owner.organization_name,
  }));

const countStatus = (
  statuses: readonly PulseNetworkPlatformStatus[] | null,
  status: PulseNetworkPlatformStatus
): number | null =>
  statuses ? statuses.filter((current) => current === status).length : null;

const countPlatforms = ({
  config,
  now,
  today,
  owners,
  activity,
  digestReaders,
}: {
  config: PulseRuntimeConfig;
  now: Date;
  today: string;
  owners: readonly ActivePlatformOwner[];
  activity: readonly PulseNetworkPlatformActivity[];
  digestReaders: number;
}): PulseNetworkPlatformCounts => {
  const statusOf = config.settings
    ? statusResolver(config.settings, today)
    : null;
  const statuses = statusOf
    ? activity.map((platform) =>
        PulseNetworkHelper.platformStatus(
          statusOf(platform.lastContributionDay)
        )
      )
    : null;
  const registeredPseudonyms = config.enabled
    ? new Set(
        toRegistrations(owners, config.secrets).map(
          (registration) => registration.pseudonym
        )
      )
    : null;
  const contributorPseudonyms = new Set(
    activity.map((platform) => platform.pseudonym)
  );
  const recentStart = PulseDay.addDays(today, -(PULSE_NETWORK_RECENT_DAYS - 1));
  const dayAgo = now.getTime() - ONE_DAY_MS;
  return {
    registered: owners.length,
    contributing: countStatus(
      statuses,
      PulseNetworkPlatformStatus.Contributing
    ),
    lapsed: countStatus(statuses, PulseNetworkPlatformStatus.Lapsed),
    active_last_24_hours: activity.filter(
      (platform) =>
        platform.lastBatchAt !== null && platform.lastBatchAt.getTime() > dayAgo
    ).length,
    active_last_7_days: activity.filter(
      (platform) => platform.lastContributionDay >= recentStart
    ).length,
    preview_only: registeredPseudonyms
      ? [...registeredPseudonyms].filter(
          (pseudonym) => !contributorPseudonyms.has(pseudonym)
        ).length
      : null,
    unregistered: registeredPseudonyms
      ? activity.filter(
          (platform) => !registeredPseudonyms.has(platform.pseudonym)
        ).length
      : null,
    digest_readers_last_24_hours: digestReaders,
  };
};

export const PulseNetworkApp = {
  overview: async (): Promise<PulseNetworkOverview> => {
    const config = PulseConfig.get();
    const now = PulseClock.now();
    const today = PulseDay.today(now);
    const fromDay = PulseDay.addDays(today, -(PULSE_ACTIVITY_WINDOW_DAYS - 1));
    const window = { fromDay, toDay: today };
    const kThreshold = config.settings?.kThreshold ?? null;

    const [
      owners,
      activity,
      ingestion,
      coverage,
      keys,
      snapshots,
      rejections,
      digestReaders,
    ] = await Promise.all([
      loadOwners(),
      PulseNetworkDomain.loadPlatformActivity(window),
      PulseNetworkDomain.loadDailyIngestion(window),
      PulseNetworkDomain.loadCoverage(window),
      // Nothing is published while the settings are invalid.
      PulseNetworkDomain.countKeys(kThreshold ?? Number.MAX_SAFE_INTEGER),
      PulseNetworkDomain.loadLastSnapshotTimes(),
      PulseNetworkDomain.loadRejections(
        PulseDay.addDays(today, -(PULSE_NETWORK_RECENT_DAYS - 1))
      ),
      PulseNetworkDomain.countCallersSince({
        operation: PulseOperation.PulseDigest,
        sinceSeconds: Math.floor((now.getTime() - ONE_DAY_MS) / 1000),
      }),
    ]);

    const ingestionToday = ingestion.find((row) => row.day === today);
    return {
      day: today,
      settings: settingsOf(config, today),
      platforms: countPlatforms({
        config,
        now,
        today,
        owners,
        activity,
        digestReaders,
      }),
      keys: {
        tracked: keys.tracked,
        published: keys.published,
        suppressed: keys.tracked - keys.published,
      },
      ingestion: {
        batches_today: ingestionToday?.batches ?? 0,
        records_today: ingestionToday?.records ?? 0,
        batches_last_30_days: ingestion.reduce(
          (total, row) => total + row.batches,
          0
        ),
        records_last_30_days: ingestion.reduce(
          (total, row) => total + row.records,
          0
        ),
      },
      activity: PulseNetworkHelper.activitySeries({
        ...window,
        ingestion,
        totals: coverage.days,
      }),
      sectors: PulseNetworkHelper.byEvents(coverage.sectors),
      regions: PulseNetworkHelper.byEvents(coverage.regions),
      kinds: PulseNetworkHelper.byEvents(coverage.kinds),
      rejections: PulseNetworkHelper.rejections(rejections),
      last_digest_at: snapshots.lastDigestAt,
      last_trending_at: snapshots.lastTrendingAt,
    };
  },

  platforms: async ({
    first,
    after,
    orderBy,
    orderMode,
    searchTerm,
    status,
  }: QueryPulseNetworkPlatformsArgs): Promise<PulseNetworkPlatformConnection> => {
    const offset = PulseNetworkHelper.pageOffset({ first, after });
    const config = PulseConfig.get();
    if (!config.enabled) {
      return dbConnections([], after ?? undefined, first, 0);
    }
    const today = PulseDay.today(PulseClock.now());
    const fromDay = PulseDay.addDays(today, -(PULSE_ACTIVITY_WINDOW_DAYS - 1));
    const [owners, activity, purges] = await Promise.all([
      loadOwners(),
      PulseNetworkDomain.loadPlatformActivity({ fromDay, toDay: today }),
      PulseNetworkDomain.loadPurgeSummaries(
        PulseDay.retentionStart(today, config.retentionMonths)
      ),
    ]);
    const platforms = PulseNetworkHelper.sortPlatforms(
      PulseNetworkHelper.filterPlatforms(
        PulseNetworkHelper.platforms({
          registrations: toRegistrations(owners, config.secrets),
          activity,
          purges,
          statusOf: statusResolver(config.settings, today),
        }),
        { searchTerm, status }
      ),
      orderBy,
      orderMode
    );
    return dbConnections(
      platforms.slice(offset, offset + first),
      after ?? undefined,
      first,
      platforms.length
    );
  },

  // Never throws: counting a refused request must not change its answer.
  countRejection: (operation: PulseOperation, code: string): void => {
    addPendingRejections({
      day: PulseDay.today(PulseClock.now()),
      operation,
      code,
      count: 1,
    });
  },

  // Counts that could not be written are kept for the next flush.
  flushRejections: async (): Promise<number> => {
    if (pendingRejections.size === 0) {
      return 0;
    }
    const counts = [...pendingRejections.values()];
    pendingRejections.clear();
    try {
      await PulseNetworkDomain.addRejections(counts);
    } catch (error) {
      counts.forEach(addPendingRejections);
      throw error;
    }
    return counts.length;
  },
};
