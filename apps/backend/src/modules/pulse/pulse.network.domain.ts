import {
  PulseEventKind,
  PulseObjectType,
  PulseRegionBucket,
  PulseSectorBucket,
} from '../../__generated__/resolvers-types';
import { pulseQuery as query } from './pulse.domain';
import {
  PulseNetworkCoverage,
  PulseNetworkDailyIngestion,
  PulseNetworkPlatformActivity,
  PulseNetworkPurgeSummary,
  PulseNetworkRejectionCount,
  PulseNetworkRejectionRow,
} from './pulse.network.helper';

// The monitoring read models of the Hub administrators: counts per day only.
// Pseudonyms are read to match the registrations and never leave the service.
export const PulseNetworkDomain = {
  // region Writes
  // In the transaction of the batch, under the platform lock.
  recordIngestion: async ({
    platformId,
    day,
    records,
    receivedAt,
  }: {
    platformId: number;
    day: string;
    records: number;
    receivedAt: Date;
  }): Promise<void> => {
    await query(
      `INSERT INTO "PulsePlatformDailyIngestion" AS i
         (pulse_platform_id, day, batch_count, record_count, last_batch_at)
       VALUES (?, ?::date, 1, ?, ?)
       ON CONFLICT (pulse_platform_id, day) DO UPDATE SET
         batch_count = i.batch_count + 1,
         record_count = i.record_count + EXCLUDED.record_count,
         last_batch_at = GREATEST(i.last_batch_at, EXCLUDED.last_batch_at)`,
      [platformId, day, records, receivedAt]
    );
  },

  addRejections: async (
    counts: readonly PulseNetworkRejectionCount[]
  ): Promise<void> => {
    if (counts.length === 0) {
      return;
    }
    await query(
      `INSERT INTO "PulseRejection" AS r (day, operation, code, request_count)
       SELECT x.day::date, x.operation, x.code, x.count
       FROM jsonb_to_recordset(?::jsonb) AS x(day text, operation text, code text, count int)
       ORDER BY x.day, x.operation, x.code
       ON CONFLICT (day, operation, code)
       DO UPDATE SET request_count = r.request_count + EXCLUDED.request_count`,
      [JSON.stringify(counts)]
    );
  },

  recordPurgeRequest: async ({
    pseudonym,
    day,
  }: {
    pseudonym: string;
    day: string;
  }): Promise<void> => {
    await query(
      `INSERT INTO "PulsePurgeRequest" AS p (pseudonym, day, request_count)
       VALUES (decode(?, 'hex'), ?::date, 1)
       ON CONFLICT (pseudonym, day)
       DO UPDATE SET request_count = p.request_count + 1`,
      [pseudonym, day]
    );
  },
  // endregion

  // region Reads
  // Every platform record with its ingestion over the window.
  loadPlatformActivity: async ({
    fromDay,
    toDay,
  }: {
    fromDay: string;
    toDay: string;
  }): Promise<PulseNetworkPlatformActivity[]> => {
    const rows = await query<{
      pseudonym: string;
      sector_bucket: PulseSectorBucket;
      region_bucket: PulseRegionBucket;
      first_contribution_day: string;
      last_contribution_day: string;
      last_batch_at: Date | null;
      batches: number;
      records: number;
    }>(
      `SELECT encode(p.pseudonym, 'hex') AS pseudonym, p.sector_bucket, p.region_bucket,
              p.first_contribution_day::text AS first_contribution_day,
              p.last_contribution_day::text AS last_contribution_day,
              i.last_batch_at,
              COALESCE(i.batches, 0)::int AS batches,
              COALESCE(i.records, 0)::float8 AS records
       FROM "PulsePlatform" p
       LEFT JOIN (
         SELECT pulse_platform_id, MAX(last_batch_at) AS last_batch_at,
                SUM(batch_count) FILTER (WHERE day >= ?::date AND day <= ?::date) AS batches,
                SUM(record_count) FILTER (WHERE day >= ?::date AND day <= ?::date) AS records
         FROM "PulsePlatformDailyIngestion"
         GROUP BY pulse_platform_id
       ) i ON i.pulse_platform_id = p.id`,
      [fromDay, toDay, fromDay, toDay]
    );
    return rows.map((row) => ({
      pseudonym: row.pseudonym,
      sectorBucket: row.sector_bucket,
      regionBucket: row.region_bucket,
      firstContributionDay: row.first_contribution_day,
      lastContributionDay: row.last_contribution_day,
      lastBatchAt: row.last_batch_at,
      batches: row.batches,
      records: row.records,
    }));
  },

  loadPurgeSummaries: async (
    sinceDay: string
  ): Promise<PulseNetworkPurgeSummary[]> => {
    const rows = await query<{
      pseudonym: string;
      requests: number;
      last_day: string;
    }>(
      `SELECT encode(pseudonym, 'hex') AS pseudonym, SUM(request_count)::int AS requests,
              MAX(day)::text AS last_day
       FROM "PulsePurgeRequest" WHERE day >= ?::date
       GROUP BY pseudonym`,
      [sinceDay]
    );
    return rows.map((row) => ({
      pseudonym: row.pseudonym,
      requests: row.requests,
      lastDay: row.last_day,
    }));
  },

  loadDailyIngestion: async ({
    fromDay,
    toDay,
  }: {
    fromDay: string;
    toDay: string;
  }): Promise<PulseNetworkDailyIngestion[]> =>
    query<PulseNetworkDailyIngestion>(
      `SELECT day::text AS day, SUM(batch_count)::int AS batches,
              SUM(record_count)::float8 AS records
       FROM "PulsePlatformDailyIngestion"
       WHERE day >= ?::date AND day <= ?::date
       GROUP BY day`,
      [fromDay, toDay]
    ),

  // One pass over the daily totals of the window: per day, per object type
  // and event kind, per sector and per region bucket.
  loadCoverage: async ({
    fromDay,
    toDay,
  }: {
    fromDay: string;
    toDay: string;
  }): Promise<PulseNetworkCoverage> => {
    const rows = await query<{
      day: string | null;
      object_type: PulseObjectType | null;
      event_kind: PulseEventKind | null;
      sector_bucket: PulseSectorBucket | null;
      region_bucket: PulseRegionBucket | null;
      events: number;
      platforms: number;
    }>(
      `SELECT day::text AS day, object_type, event_kind, sector_bucket, region_bucket,
              SUM(event_count)::float8 AS events,
              COUNT(DISTINCT pulse_platform_id)::int AS platforms
       FROM "PulsePlatformDailyTotal"
       WHERE day >= ?::date AND day <= ?::date
       GROUP BY GROUPING SETS ((day), (object_type, event_kind), (sector_bucket), (region_bucket))`,
      [fromDay, toDay]
    );
    const coverage: PulseNetworkCoverage = {
      days: [],
      kinds: [],
      sectors: [],
      regions: [],
    };
    for (const { events, platforms, ...row } of rows) {
      if (row.day !== null) {
        coverage.days.push({ day: row.day, events, platforms });
      } else if (row.object_type !== null && row.event_kind !== null) {
        coverage.kinds.push({
          object_type: row.object_type,
          event_kind: row.event_kind,
          events,
          platforms,
        });
      } else if (row.sector_bucket !== null) {
        coverage.sectors.push({
          sector_bucket: row.sector_bucket,
          events,
          platforms,
        });
      } else if (row.region_bucket !== null) {
        coverage.regions.push({
          region_bucket: row.region_bucket,
          events,
          platforms,
        });
      }
    }
    return coverage;
  },

  countKeys: async (
    kThreshold: number
  ): Promise<{ tracked: number; published: number }> => {
    const [row] = await query<{ tracked: number; published: number }>(
      `SELECT COUNT(*)::float8 AS tracked,
              COUNT(*) FILTER (WHERE platform_count >= ?)::float8 AS published
       FROM "PulseKey"`,
      [kThreshold]
    );
    return { tracked: row?.tracked ?? 0, published: row?.published ?? 0 };
  },

  loadLastSnapshotTimes: async (): Promise<{
    lastDigestAt: Date | null;
    lastTrendingAt: Date | null;
  }> => {
    const [row] = await query<{
      last_digest_at: Date | null;
      last_trending_at: Date | null;
    }>(
      `SELECT (SELECT MAX(computed_at) FROM "PulseDigestSnapshot") AS last_digest_at,
              (SELECT MAX(computed_at) FROM "PulseTrendingSnapshot") AS last_trending_at`
    );
    return {
      lastDigestAt: row?.last_digest_at ?? null,
      lastTrendingAt: row?.last_trending_at ?? null,
    };
  },

  loadRejections: async (
    sinceDay: string
  ): Promise<PulseNetworkRejectionRow[]> =>
    query<PulseNetworkRejectionRow>(
      `SELECT operation, code, SUM(request_count)::int AS requests, MAX(day)::text AS last_day
       FROM "PulseRejection" WHERE day >= ?::date
       GROUP BY operation, code`,
      [sinceDay]
    ),

  // Distinct callers of an operation since then, from the rate limit buckets.
  countCallersSince: async ({
    operation,
    sinceSeconds,
  }: {
    operation: string;
    sinceSeconds: number;
  }): Promise<number> => {
    const [row] = await query<{ callers: number }>(
      `SELECT COUNT(DISTINCT pseudonym)::int AS callers
       FROM "PulseRateLimit" WHERE operation = ? AND bucket_start >= to_timestamp(?)`,
      [operation, sinceSeconds]
    );
    return row?.callers ?? 0;
  },
  // endregion
};
