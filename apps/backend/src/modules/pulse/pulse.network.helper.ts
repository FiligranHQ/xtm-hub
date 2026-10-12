import {
  OrderingMode,
  PulseContributionStatus,
  PulseNetworkActivityDay,
  PulseNetworkKindCoverage,
  PulseNetworkOperation,
  PulseNetworkPlatform,
  PulseNetworkPlatformOrdering,
  PulseNetworkPlatformStatus,
  PulseNetworkRegionCoverage,
  PulseNetworkRejection,
  PulseNetworkRejectionCode,
  PulseNetworkSectorCoverage,
  PulseRegionBucket,
  PulseSectorBucket,
} from '../../__generated__/resolvers-types';
import { PulseDay } from './pulse.day.helper';
import { PulseErrors } from './pulse.errors';

// The largest page the Hub's shared table page-size control offers.
export const PULSE_NETWORK_MAX_PAGE_SIZE = 500;
export const PULSE_NETWORK_RECENT_DAYS = 7;
export const PULSE_NETWORK_KEY_ID_LENGTH = 12;

export interface PulseNetworkPlatformActivity {
  pseudonym: string;
  sectorBucket: PulseSectorBucket;
  regionBucket: PulseRegionBucket;
  firstContributionDay: string;
  lastContributionDay: string;
  lastBatchAt: Date | null;
  batches: number;
  records: number;
}

export interface PulseNetworkPurgeSummary {
  pseudonym: string;
  requests: number;
  lastDay: string;
}

export interface PulseNetworkRegistration {
  serviceInstanceId: string;
  pseudonym: string;
  title: string;
  organizationName: string | null;
}

export interface PulseNetworkDailyIngestion {
  day: string;
  batches: number;
  records: number;
}

export interface PulseNetworkCoverage {
  days: { day: string; events: number; platforms: number }[];
  kinds: PulseNetworkKindCoverage[];
  sectors: PulseNetworkSectorCoverage[];
  regions: PulseNetworkRegionCoverage[];
}

export interface PulseNetworkRejectionCount {
  day: string;
  operation: string;
  code: string;
  count: number;
}

export interface PulseNetworkRejectionRow {
  operation: string;
  code: string;
  requests: number;
  last_day: string;
}

const OPERATIONS: ReadonlySet<string> = new Set(
  Object.values(PulseNetworkOperation)
);
const REJECTION_CODES: ReadonlySet<string> = new Set(
  Object.values(PulseNetworkRejectionCode)
);

const STATUS_ORDER: Record<PulseNetworkPlatformStatus, number> = {
  [PulseNetworkPlatformStatus.Contributing]: 0,
  [PulseNetworkPlatformStatus.Lapsed]: 1,
  [PulseNetworkPlatformStatus.PreviewOnly]: 2,
};

const compareText = (left: string, right: string): number =>
  left.localeCompare(right, 'en', { sensitivity: 'base' });

// Missing values come last whatever the direction.
const compareNullable = <T>(
  left: T | null,
  right: T | null,
  compare: (a: T, b: T) => number,
  direction: number
): number => {
  if (left === null || right === null) {
    return Number(left === null) - Number(right === null);
  }
  return direction * compare(left, right);
};

const compareNumbers = (left: number, right: number): number => left - right;

const comparePlatforms = (
  orderBy: PulseNetworkPlatformOrdering,
  direction: number
): ((left: PulseNetworkPlatform, right: PulseNetworkPlatform) => number) => {
  switch (orderBy) {
    case PulseNetworkPlatformOrdering.OrganizationName:
      return (left, right) =>
        compareNullable(
          left.organization_name ?? null,
          right.organization_name ?? null,
          compareText,
          direction
        );
    case PulseNetworkPlatformOrdering.Status:
      return (left, right) =>
        direction * (STATUS_ORDER[left.status] - STATUS_ORDER[right.status]);
    case PulseNetworkPlatformOrdering.LastContributionDay:
      return (left, right) =>
        compareNullable(
          left.last_contribution_day ?? null,
          right.last_contribution_day ?? null,
          compareText,
          direction
        );
    case PulseNetworkPlatformOrdering.RecordsLast_30Days:
      return (left, right) =>
        direction *
        compareNumbers(left.records_last_30_days, right.records_last_30_days);
    case PulseNetworkPlatformOrdering.PurgeRequests:
      return (left, right) =>
        direction * compareNumbers(left.purge_requests, right.purge_requests);
    case PulseNetworkPlatformOrdering.Title:
    default:
      return (left, right) => direction * compareText(left.title, right.title);
  }
};

export const PulseNetworkHelper = {
  // A platform that reads lookups, trending and benchmarks is contributing.
  platformStatus: (
    status: PulseContributionStatus
  ): PulseNetworkPlatformStatus => {
    switch (status) {
      case PulseContributionStatus.Active:
      case PulseContributionStatus.Grace:
        return PulseNetworkPlatformStatus.Contributing;
      case PulseContributionStatus.Lapsed:
        return PulseNetworkPlatformStatus.Lapsed;
      default:
        return PulseNetworkPlatformStatus.PreviewOnly;
    }
  },

  // Every day from `fromDay` to `toDay`, the oldest first, a day without data
  // at zero.
  activitySeries: ({
    fromDay,
    toDay,
    ingestion,
    totals,
  }: {
    fromDay: string;
    toDay: string;
    ingestion: readonly PulseNetworkDailyIngestion[];
    totals: PulseNetworkCoverage['days'];
  }): PulseNetworkActivityDay[] => {
    const ingestionByDay = new Map(ingestion.map((row) => [row.day, row]));
    const totalsByDay = new Map(totals.map((row) => [row.day, row]));
    const series: PulseNetworkActivityDay[] = [];
    for (let day = fromDay; day <= toDay; day = PulseDay.addDays(day, 1)) {
      series.push({
        day,
        batches: ingestionByDay.get(day)?.batches ?? 0,
        records: ingestionByDay.get(day)?.records ?? 0,
        events: totalsByDay.get(day)?.events ?? 0,
        platforms: totalsByDay.get(day)?.platforms ?? 0,
      });
    }
    return series;
  },

  // A row the enums of this version cannot carry is left out.
  rejections: (
    rows: readonly PulseNetworkRejectionRow[]
  ): PulseNetworkRejection[] =>
    rows
      .filter(
        (row) => OPERATIONS.has(row.operation) && REJECTION_CODES.has(row.code)
      )
      .map((row) => ({
        operation: row.operation as PulseNetworkOperation,
        code: row.code as PulseNetworkRejectionCode,
        requests: row.requests,
        last_day: row.last_day,
      }))
      .sort(
        (left, right) =>
          right.requests - left.requests ||
          compareText(left.operation, right.operation) ||
          compareText(left.code, right.code)
      ),

  // The largest first.
  byEvents: <T extends { events: number; platforms: number }>(
    rows: readonly T[]
  ): T[] =>
    [...rows].sort(
      (left, right) =>
        right.events - left.events || right.platforms - left.platforms
    ),

  platforms: ({
    registrations,
    activity,
    purges,
    statusOf,
  }: {
    registrations: readonly PulseNetworkRegistration[];
    activity: readonly PulseNetworkPlatformActivity[];
    purges: readonly PulseNetworkPurgeSummary[];
    statusOf: (lastContributionDay: string | null) => PulseContributionStatus;
  }): PulseNetworkPlatform[] => {
    const activityByPseudonym = new Map(
      activity.map((row) => [row.pseudonym, row])
    );
    const purgesByPseudonym = new Map(
      purges.map((row) => [row.pseudonym, row])
    );
    return registrations.map((registration) => {
      const platform = activityByPseudonym.get(registration.pseudonym);
      const purge = purgesByPseudonym.get(registration.pseudonym);
      return {
        id: registration.serviceInstanceId,
        title: registration.title,
        organization_name: registration.organizationName,
        sector_bucket: platform?.sectorBucket ?? null,
        region_bucket: platform?.regionBucket ?? null,
        status: PulseNetworkHelper.platformStatus(
          statusOf(platform?.lastContributionDay ?? null)
        ),
        first_contribution_day: platform?.firstContributionDay ?? null,
        last_contribution_day: platform?.lastContributionDay ?? null,
        last_batch_at: platform?.lastBatchAt ?? null,
        batches_last_30_days: platform?.batches ?? 0,
        records_last_30_days: platform?.records ?? 0,
        purge_requests: purge?.requests ?? 0,
        last_purge_day: purge?.lastDay ?? null,
      };
    });
  },

  filterPlatforms: (
    platforms: readonly PulseNetworkPlatform[],
    {
      searchTerm,
      status,
    }: {
      searchTerm?: string | null;
      status?: PulseNetworkPlatformStatus | null;
    }
  ): PulseNetworkPlatform[] => {
    const term = searchTerm?.trim().toLocaleLowerCase('en') ?? '';
    return platforms.filter(
      (platform) =>
        (!status || platform.status === status) &&
        (term === '' ||
          platform.title.toLocaleLowerCase('en').includes(term) ||
          (platform.organization_name ?? '')
            .toLocaleLowerCase('en')
            .includes(term))
    );
  },

  // The title, then the id, break ties: a page never depends on the order the
  // database returned the rows in.
  sortPlatforms: (
    platforms: readonly PulseNetworkPlatform[],
    orderBy: PulseNetworkPlatformOrdering,
    orderMode: OrderingMode
  ): PulseNetworkPlatform[] => {
    const direction = orderMode === OrderingMode.Desc ? -1 : 1;
    const compare = comparePlatforms(orderBy, direction);
    return [...platforms].sort(
      (left, right) =>
        compare(left, right) ||
        compareText(left.title, right.title) ||
        compareText(left.id, right.id)
    );
  },

  pageOffset: ({
    first,
    after,
  }: {
    first: number;
    after?: string | null;
  }): number => {
    if (
      !Number.isInteger(first) ||
      first < 1 ||
      first > PULSE_NETWORK_MAX_PAGE_SIZE
    ) {
      throw PulseErrors.badUserInput(
        `first must be an integer between 1 and ${PULSE_NETWORK_MAX_PAGE_SIZE}`
      );
    }
    if (!after) {
      return 0;
    }
    let offset: number;
    try {
      offset = Number(atob(after));
    } catch {
      offset = Number.NaN;
    }
    if (!Number.isInteger(offset) || offset < 0) {
      throw PulseErrors.badUserInput('after is not a cursor of this list');
    }
    return offset;
  },
};
