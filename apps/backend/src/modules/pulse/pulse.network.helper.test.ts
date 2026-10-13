import { GraphQLError } from 'graphql';
import { describe, expect, it } from 'vitest';
import {
  OrderingMode,
  PulseContributionStatus,
  PulseNetworkOperation,
  PulseNetworkPlatform,
  PulseNetworkPlatformOrdering,
  PulseNetworkPlatformStatus,
  PulseNetworkRejectionCode,
  PulseRegionBucket,
  PulseSectorBucket,
} from '../../__generated__/resolvers-types';
import { PulseErrorCode } from './pulse.errors';
import {
  PULSE_NETWORK_MAX_PAGE_SIZE,
  PulseNetworkHelper,
  PulseNetworkPlatformActivity,
} from './pulse.network.helper';

const errorCodeOf = (call: () => unknown): unknown => {
  try {
    call();
  } catch (error) {
    return error instanceof GraphQLError ? error.extensions.code : error;
  }
  return undefined;
};

const makePlatform = (
  overrides: Partial<PulseNetworkPlatform> = {}
): PulseNetworkPlatform => ({
  id: 'instance',
  title: 'Platform',
  organization_name: 'Organization',
  sector_bucket: null,
  region_bucket: null,
  status: PulseNetworkPlatformStatus.PreviewOnly,
  first_contribution_day: null,
  last_contribution_day: null,
  last_batch_at: null,
  batches_last_30_days: 0,
  records_last_30_days: 0,
  purge_requests: 0,
  last_purge_day: null,
  ...overrides,
});

const makeActivity = (
  overrides: Partial<PulseNetworkPlatformActivity> = {}
): PulseNetworkPlatformActivity => ({
  pseudonym: 'aa',
  sectorBucket: PulseSectorBucket.Finance,
  regionBucket: PulseRegionBucket.Europe,
  firstContributionDay: '2026-09-01',
  lastContributionDay: '2026-10-03',
  lastBatchAt: null,
  batches: 0,
  records: 0,
  ...overrides,
});

describe('pulseNetworkHelper', () => {
  describe('platformStatus', () => {
    it.each([
      {
        status: PulseContributionStatus.Active,
        expected: PulseNetworkPlatformStatus.Contributing,
      },
      {
        status: PulseContributionStatus.Grace,
        expected: PulseNetworkPlatformStatus.Contributing,
      },
      {
        status: PulseContributionStatus.Lapsed,
        expected: PulseNetworkPlatformStatus.Lapsed,
      },
      {
        status: PulseContributionStatus.None,
        expected: PulseNetworkPlatformStatus.PreviewOnly,
      },
    ])('should show $status as $expected', ({ status, expected }) => {
      // When
      const result = PulseNetworkHelper.platformStatus(status);

      // Then
      expect(result).toBe(expected);
    });
  });

  describe('activitySeries', () => {
    it('should list every day of the window, the oldest first, a day without data at zero', () => {
      // When
      const result = PulseNetworkHelper.activitySeries({
        fromDay: '2026-09-29',
        toDay: '2026-10-01',
        ingestion: [{ day: '2026-09-30', batches: 2, records: 7 }],
        totals: [
          { day: '2026-09-30', events: 9, platforms: 2 },
          { day: '2026-10-01', events: 1, platforms: 1 },
        ],
      });

      // Then
      expect(result).toEqual([
        { day: '2026-09-29', batches: 0, records: 0, events: 0, platforms: 0 },
        { day: '2026-09-30', batches: 2, records: 7, events: 9, platforms: 2 },
        { day: '2026-10-01', batches: 0, records: 0, events: 1, platforms: 1 },
      ]);
    });
  });

  describe('rejections', () => {
    it('should rank the most frequent first and leave out what the enums cannot carry', () => {
      // When
      const result = PulseNetworkHelper.rejections([
        {
          operation: 'pulse_status',
          code: 'UNAUTHENTICATED',
          requests: 1,
          last_day: '2026-10-02',
        },
        {
          operation: 'push_pulse',
          code: 'PULSE_RATE_LIMITED',
          requests: 4,
          last_day: '2026-10-03',
        },
        {
          operation: 'pulse_retired',
          code: 'BAD_USER_INPUT',
          requests: 9,
          last_day: '2026-10-03',
        },
        {
          operation: 'pulse_lookup',
          code: 'SOMETHING_ELSE',
          requests: 9,
          last_day: '2026-10-03',
        },
      ]);

      // Then
      expect(result).toEqual([
        {
          operation: PulseNetworkOperation.PushPulse,
          code: PulseNetworkRejectionCode.PulseRateLimited,
          requests: 4,
          last_day: '2026-10-03',
        },
        {
          operation: PulseNetworkOperation.PulseStatus,
          code: PulseNetworkRejectionCode.Unauthenticated,
          requests: 1,
          last_day: '2026-10-02',
        },
      ]);
    });
  });

  describe('platforms', () => {
    it('should match each registration to its contribution and purges by pseudonym', () => {
      // When
      const result = PulseNetworkHelper.platforms({
        registrations: [
          {
            serviceInstanceId: 'one',
            pseudonym: 'aa',
            title: 'Contributor',
            organizationName: 'Org',
          },
          {
            serviceInstanceId: 'two',
            pseudonym: 'bb',
            title: 'Preview',
            organizationName: null,
          },
        ],
        activity: [
          makeActivity({ pseudonym: 'aa', batches: 3, records: 12 }),
          makeActivity({ pseudonym: 'cc' }),
        ],
        purges: [{ pseudonym: 'bb', requests: 2, lastDay: '2026-10-01' }],
        statusOf: (day) =>
          day ? PulseContributionStatus.Active : PulseContributionStatus.None,
      });

      // Then
      expect(result).toEqual([
        makePlatform({
          id: 'one',
          title: 'Contributor',
          organization_name: 'Org',
          sector_bucket: PulseSectorBucket.Finance,
          region_bucket: PulseRegionBucket.Europe,
          status: PulseNetworkPlatformStatus.Contributing,
          first_contribution_day: '2026-09-01',
          last_contribution_day: '2026-10-03',
          batches_last_30_days: 3,
          records_last_30_days: 12,
        }),
        makePlatform({
          id: 'two',
          title: 'Preview',
          organization_name: null,
          purge_requests: 2,
          last_purge_day: '2026-10-01',
        }),
      ]);
    });
  });

  describe('filterPlatforms', () => {
    const platforms = [
      makePlatform({ id: '1', title: 'Paris SOC', organization_name: 'Acme' }),
      makePlatform({
        id: '2',
        title: 'Lyon',
        organization_name: 'Paris Bank',
        status: PulseNetworkPlatformStatus.Lapsed,
      }),
      makePlatform({ id: '3', title: 'Nice', organization_name: null }),
    ];

    it.each([
      { searchTerm: '  paris ', status: null, expected: ['1', '2'] },
      {
        searchTerm: 'paris',
        status: PulseNetworkPlatformStatus.Lapsed,
        expected: ['2'],
      },
      { searchTerm: '', status: null, expected: ['1', '2', '3'] },
      { searchTerm: 'bank', status: null, expected: ['2'] },
    ])(
      'should keep $expected for "$searchTerm" and $status',
      ({ searchTerm, status, expected }) => {
        // When
        const result = PulseNetworkHelper.filterPlatforms(platforms, {
          searchTerm,
          status,
        });

        // Then
        expect(result.map((platform) => platform.id)).toEqual(expected);
      }
    );
  });

  describe('sortPlatforms', () => {
    const platforms = [
      makePlatform({
        id: 'c',
        title: 'charlie',
        organization_name: null,
        status: PulseNetworkPlatformStatus.Contributing,
        last_contribution_day: '2026-10-01',
        records_last_30_days: 5,
      }),
      makePlatform({
        id: 'a',
        title: 'Alpha',
        organization_name: 'Zeta',
        status: PulseNetworkPlatformStatus.Lapsed,
        last_contribution_day: '2026-09-01',
        records_last_30_days: 5,
        purge_requests: 1,
      }),
      makePlatform({
        id: 'b',
        title: 'bravo',
        organization_name: 'Acme',
        status: PulseNetworkPlatformStatus.PreviewOnly,
        records_last_30_days: 0,
      }),
    ];

    it.each([
      {
        orderBy: PulseNetworkPlatformOrdering.Title,
        orderMode: OrderingMode.Asc,
        expected: ['a', 'b', 'c'],
      },
      {
        orderBy: PulseNetworkPlatformOrdering.OrganizationName,
        orderMode: OrderingMode.Desc,
        expected: ['a', 'b', 'c'],
      },
      {
        orderBy: PulseNetworkPlatformOrdering.Status,
        orderMode: OrderingMode.Asc,
        expected: ['c', 'a', 'b'],
      },
      {
        orderBy: PulseNetworkPlatformOrdering.LastContributionDay,
        orderMode: OrderingMode.Asc,
        expected: ['a', 'c', 'b'],
      },
      {
        orderBy: PulseNetworkPlatformOrdering.LastContributionDay,
        orderMode: OrderingMode.Desc,
        expected: ['c', 'a', 'b'],
      },
      {
        orderBy: PulseNetworkPlatformOrdering.RecordsLast_30Days,
        orderMode: OrderingMode.Desc,
        expected: ['a', 'c', 'b'],
      },
      {
        orderBy: PulseNetworkPlatformOrdering.PurgeRequests,
        orderMode: OrderingMode.Desc,
        expected: ['a', 'b', 'c'],
      },
    ])(
      'should order by $orderBy $orderMode as $expected, missing values last',
      ({ orderBy, orderMode, expected }) => {
        // When
        const result = PulseNetworkHelper.sortPlatforms(
          platforms,
          orderBy,
          orderMode
        );

        // Then
        expect(result.map((platform) => platform.id)).toEqual(expected);
      }
    );
  });

  describe('pageOffset', () => {
    it.each([
      { first: 10, after: null, expected: 0 },
      { first: 10, after: btoa('20'), expected: 20 },
      { first: PULSE_NETWORK_MAX_PAGE_SIZE, after: undefined, expected: 0 },
    ])(
      'should start page $first after $after at $expected',
      ({ first, after, expected }) => {
        // When
        const result = PulseNetworkHelper.pageOffset({ first, after });

        // Then
        expect(result).toBe(expected);
      }
    );

    it.each([
      { first: 0, after: null },
      { first: PULSE_NETWORK_MAX_PAGE_SIZE + 1, after: null },
      { first: 1.5, after: null },
      { first: 10, after: 'not a cursor' },
      { first: 10, after: btoa('-1') },
      { first: 10, after: btoa('abc') },
    ])('should reject first $first after $after', ({ first, after }) => {
      // When
      const code = errorCodeOf(() =>
        PulseNetworkHelper.pageOffset({ first, after })
      );

      // Then
      expect(code).toBe(PulseErrorCode.BadUserInput);
    });
  });
});
