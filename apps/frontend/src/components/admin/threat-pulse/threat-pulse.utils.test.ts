import {
  activityValue,
  platformStatusSeverity,
  publishedShare,
  pulseDayToDate,
  rejectionId,
  toSearchTerm,
  trendIcon,
  trendingItemId,
} from '@/components/admin/threat-pulse/threat-pulse.utils';
import {
  PulseNetworkOperation,
  PulseNetworkPlatformStatus,
  PulseNetworkRejectionCode,
  PulseObjectType,
  PulsePrevalenceBucket,
  PulseTrendDirection,
} from '@graphql/generated';

describe('threat-pulse.utils', () => {
  describe('platformStatusSeverity', () => {
    it.each([
      { status: PulseNetworkPlatformStatus.Contributing, expected: 'low' },
      { status: PulseNetworkPlatformStatus.Lapsed, expected: 'medium' },
      { status: PulseNetworkPlatformStatus.PreviewOnly, expected: 'neutral' },
    ])('should paint $status as $expected', ({ status, expected }) => {
      // When
      const severity = platformStatusSeverity(status);

      // Then
      expect(severity).toBe(expected);
    });
  });

  describe('trendIcon', () => {
    it.each([
      { trend: PulseTrendDirection.Rising, expected: 'arrow-up-right' },
      { trend: PulseTrendDirection.Stable, expected: 'minus' },
      { trend: PulseTrendDirection.Falling, expected: 'arrow-down' },
    ])('should draw $trend with $expected', ({ trend, expected }) => {
      // When
      const icon = trendIcon(trend);

      // Then
      expect(icon).toBe(expected);
    });
  });

  describe('pulseDayToDate', () => {
    it('should read a day as the start of that UTC day', () => {
      // When
      const date = pulseDayToDate('2026-10-12');

      // Then
      expect(date.toISOString()).toBe('2026-10-12T00:00:00.000Z');
    });
  });

  describe('publishedShare', () => {
    it.each([
      { tracked: 0, published: 0, expected: 0 },
      { tracked: 3, published: 1, expected: 33 },
      { tracked: 8, published: 8, expected: 100 },
    ])(
      'should publish $expected% of $tracked keys when $published reach k',
      ({ tracked, published, expected }) => {
        // When
        const share = publishedShare({ tracked, published });

        // Then
        expect(share).toBe(expected);
      }
    );
  });

  describe('activityValue', () => {
    it.each([
      { metric: 'records' as const, expected: 40 },
      { metric: 'batches' as const, expected: 4 },
      { metric: 'platforms' as const, expected: 2 },
    ])('should read the $metric of a day', ({ metric, expected }) => {
      // Given
      const day = {
        day: '2026-10-12',
        records: 40,
        batches: 4,
        platforms: 2,
        events: 90,
      };

      // When
      const value = activityValue(day, metric);

      // Then
      expect(value).toBe(expected);
    });
  });

  describe('toSearchTerm', () => {
    it.each([
      { value: '', expected: null },
      { value: '   ', expected: null },
      { value: ' soc ', expected: 'soc' },
    ])('should turn "$value" into $expected', ({ value, expected }) => {
      // When
      const searchTerm = toSearchTerm(value);

      // Then
      expect(searchTerm).toBe(expected);
    });
  });

  describe('row identifiers', () => {
    it('should identify a trending item by its type and key', () => {
      // When
      const id = trendingItemId({
        key_id: 'a1b2c3d4e5f6',
        object_type: PulseObjectType.Malware,
        platforms_bucket: '5-9',
        prevalence_bucket: PulsePrevalenceBucket.Common,
        trend: PulseTrendDirection.Rising,
        growth: 2,
        first_seen_network: null,
      });

      // Then
      expect(id).toBe('malware-a1b2c3d4e5f6');
    });

    it('should identify a rejection by its operation and code', () => {
      // When
      const id = rejectionId({
        operation: PulseNetworkOperation.PulseLookup,
        code: PulseNetworkRejectionCode.PulseRateLimited,
        requests: 3,
        last_day: '2026-10-12',
      });

      // Then
      expect(id).toBe('pulse_lookup-PULSE_RATE_LIMITED');
    });
  });
});
