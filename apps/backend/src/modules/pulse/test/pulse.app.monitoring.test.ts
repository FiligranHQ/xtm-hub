import { randomUUID } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dbRaw } from '../../../../knexfile';
import { TestHelper } from '../../../../tests/helper/test.helper';
import {
  OrderingMode,
  PlatformConfigurationStatus,
  PulseEventKind,
  PulseNetworkOperation,
  PulseNetworkOverview,
  PulseNetworkPlatformConnection,
  PulseNetworkPlatformOrdering,
  PulseNetworkPlatformStatus,
  PulseNetworkRejectionCode,
  PulseNetworkTrending,
  PulseObjectType,
  PulsePeriod,
  PulseRegionBucket,
  PulseSectorBucket,
} from '../../../__generated__/resolvers-types';
import { PulseApp } from '../pulse.app';
import { PulseConfig } from '../pulse.config';
import { PulseCrypto } from '../pulse.crypto.helper';
import { PulseDay } from '../pulse.day.helper';
import { PulseNetworkDomain } from '../pulse.network.domain';
import {
  cleanPulseState,
  errorCodes,
  executePulse,
  PULSE_INTEGRATION_SUITE,
  PULSE_TEST_NOW,
  PULSE_TEST_TODAY,
  PULSE_TEST_YESTERDAY,
  pulseAdminContext,
  pulseClient,
  PulseOperationResult,
  PulseTestClient,
  usePulseClock,
} from './pulse.test.utils';

const OVERVIEW_QUERY = `
  query PulseNetworkOverview {
    pulseNetworkOverview {
      day
      settings {
        enabled disabled_reason k_threshold retention_months retention_days digest_size
        contribution_window_days contribution_grace_days trending_cache_ttl_minutes
      }
      platforms {
        registered contributing active_last_24_hours active_last_7_days preview_only lapsed
        unregistered digest_readers_last_24_hours
      }
      keys { tracked published suppressed }
      ingestion { batches_today records_today batches_last_30_days records_last_30_days }
      activity { day batches records events platforms }
      sectors { sector_bucket platforms events }
      regions { region_bucket platforms events }
      kinds { object_type event_kind platforms events }
      rejections { operation code requests last_day }
      last_digest_at
      last_trending_at
    }
  }
`;

const TRENDING_QUERY = `
  query PulseNetworkTrending($period: PulsePeriod!, $first: Int) {
    pulseNetworkTrending(period: $period, first: $first) {
      day period computed_at
      items { key_id object_type platforms_bucket prevalence_bucket trend growth first_seen_network }
    }
  }
`;

const PLATFORMS_QUERY = `
  query PulseNetworkPlatforms(
    $first: Int!
    $after: ID
    $orderBy: PulseNetworkPlatformOrdering!
    $orderMode: OrderingMode!
    $searchTerm: String
    $status: PulseNetworkPlatformStatus
  ) {
    pulseNetworkPlatforms(
      first: $first
      after: $after
      orderBy: $orderBy
      orderMode: $orderMode
      searchTerm: $searchTerm
      status: $status
    ) {
      totalCount
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id title organization_name sector_bucket region_bucket status first_contribution_day
          last_contribution_day last_batch_at batches_last_30_days records_last_30_days
          purge_requests last_purge_day
        }
      }
    }
  }
`;

const TITLE_PREFIX = 'Pulse monitoring';
const LOCKBIT = 'lockbit';
const EMOTET = 'emotet';
const QAKBOT = 'qakbot';
const IP_VALUE = 'observable:ipv4-addr:value:198.51.100.7';

const malware = (value: string) => ({
  objectType: PulseObjectType.Malware,
  value,
});

const requireData = <T>(result: PulseOperationResult<T>): T => {
  if (result.errors?.length || !result.data) {
    throw new Error(
      `Monitoring query failed: ${JSON.stringify(result.errors)}`
    );
  }
  return result.data;
};

const overview = async (): Promise<PulseNetworkOverview> =>
  requireData(
    await executePulse<{ pulseNetworkOverview: PulseNetworkOverview }>({
      query: OVERVIEW_QUERY,
      context: pulseAdminContext,
    })
  ).pulseNetworkOverview;

const trending = async (
  period: PulsePeriod,
  first?: number
): Promise<PulseNetworkTrending> =>
  requireData(
    await executePulse<{ pulseNetworkTrending: PulseNetworkTrending }>({
      query: TRENDING_QUERY,
      variables: { period, first },
      context: pulseAdminContext,
    })
  ).pulseNetworkTrending;

const platforms = async (
  variables: Partial<{
    first: number;
    after: string | null;
    orderBy: PulseNetworkPlatformOrdering;
    orderMode: OrderingMode;
    status: PulseNetworkPlatformStatus | null;
    searchTerm: string;
  }> = {}
): Promise<PulseNetworkPlatformConnection> =>
  requireData(
    await executePulse<{
      pulseNetworkPlatforms: PulseNetworkPlatformConnection;
    }>({
      query: PLATFORMS_QUERY,
      variables: {
        first: 25,
        orderBy: PulseNetworkPlatformOrdering.Title,
        orderMode: OrderingMode.Asc,
        searchTerm: TITLE_PREFIX,
        ...variables,
      },
      context: pulseAdminContext,
    })
  ).pulseNetworkPlatforms;

const titles = (connection: PulseNetworkPlatformConnection): string[] =>
  connection.edges.map((edge) => edge.node.title);

const registerTitled = async (title: string): Promise<PulseTestClient> =>
  pulseClient(
    await TestHelper.pulse.registerPlatform({
      title: `${TITLE_PREFIX} ${title}`,
    })
  );

// Threat Pulse refuses a registration that is not active as UNAUTHENTICATED.
const refuseInactiveRegistration = async (): Promise<void> => {
  const client = pulseClient(
    await TestHelper.pulse.registerPlatform({
      status: PlatformConfigurationStatus.Inactive,
    })
  );
  await client.statusResult();
};

// Five platforms of finance in Europe report two malware today, one of
// energy in Asia-Pacific an indicator for yesterday, one reported 20 days ago
// (lapsed) and one never contributed (the preview only).
const seedNetwork = async (clock: ReturnType<typeof usePulseClock>) => {
  const contributors: PulseTestClient[] = [];
  for (const title of ['A', 'B', 'C', 'D', 'E']) {
    contributors.push(await registerTitled(title));
  }
  const yesterdayOnly = await registerTitled('F');
  const lapsed = await registerTitled('L');
  const previewOnly = await registerTitled('P');

  clock.addDays(-20);
  await lapsed.push({ day: clock.today(), records: [malware(QAKBOT)] });
  clock.setTime(PULSE_TEST_NOW);
  for (const client of contributors) {
    await client.push({
      day: PULSE_TEST_TODAY,
      records: [malware(LOCKBIT), malware(EMOTET)],
    });
  }
  await yesterdayOnly.push({
    day: PULSE_TEST_YESTERDAY,
    sector: PulseSectorBucket.EnergyUtilities,
    region: PulseRegionBucket.AsiaPacific,
    records: [{ objectType: PulseObjectType.Indicator, value: IP_VALUE }],
  });
  return { contributors, yesterdayOnly, lapsed, previewOnly };
};

describe('pulseApp network monitoring', PULSE_INTEGRATION_SUITE, () => {
  let clock: ReturnType<typeof usePulseClock>;

  beforeEach(() => {
    clock = usePulseClock();
  });

  afterEach(async () => {
    await PulseApp.flushRejectionCounts();
    await cleanPulseState();
  });

  it('should refuse every monitoring query to a user without the bypass capability', async () => {
    // When
    const results = [
      await executePulse({ query: OVERVIEW_QUERY }),
      await executePulse({
        query: TRENDING_QUERY,
        variables: { period: PulsePeriod.Last_7Days },
      }),
      await executePulse({
        query: PLATFORMS_QUERY,
        variables: {
          first: 10,
          orderBy: PulseNetworkPlatformOrdering.Title,
          orderMode: OrderingMode.Asc,
        },
      }),
    ];

    // Then
    expect(
      results.map((result) => ({
        data: result.data,
        messages: result.errors?.map((error) => error.message),
      }))
    ).toEqual(
      Array.from({ length: 3 }, () => ({
        data: null,
        messages: [expect.stringContaining('Not authorized')],
      }))
    );
  });

  it('should count the platforms, the keys and the ingestion of the network', async () => {
    // Given
    const before = await overview();
    const { previewOnly } = await seedNetwork(clock);
    await previewOnly.digest({ day: PULSE_TEST_TODAY });

    // When
    const result = await overview();

    // Then
    expect({
      day: result.day,
      settings: result.settings,
      platforms: result.platforms,
      keys: result.keys,
      ingestion: result.ingestion,
      lastDigestAt: new Date(result.last_digest_at).toISOString(),
    }).toEqual({
      day: PULSE_TEST_TODAY,
      settings: {
        enabled: true,
        disabled_reason: null,
        k_threshold: 5,
        retention_months: 13,
        retention_days: 396,
        digest_size: 5000,
        contribution_window_days: 7,
        contribution_grace_days: 14,
        trending_cache_ttl_minutes: 60,
      },
      platforms: {
        registered: before.platforms.registered + 8,
        contributing: 6,
        active_last_24_hours: 6,
        active_last_7_days: 6,
        preview_only: (before.platforms.preview_only ?? 0) + 1,
        lapsed: 1,
        unregistered: 0,
        digest_readers_last_24_hours: 1,
      },
      keys: { tracked: 4, published: 2, suppressed: 2 },
      ingestion: {
        batches_today: 5,
        records_today: 10,
        batches_last_30_days: 7,
        records_last_30_days: 12,
      },
      lastDigestAt: PULSE_TEST_NOW,
    });
  });

  it('should list every day of the activity and the coverage of the last 30 days', async () => {
    // Given
    await seedNetwork(clock);

    // When
    const result = await overview();

    // Then
    const firstDay = PulseDay.addDays(PULSE_TEST_TODAY, -29);
    expect({
      days: result.activity.length,
      first: result.activity[0]?.day,
      active: result.activity.filter((day) => day.batches > 0),
      sectors: result.sectors,
      regions: result.regions,
      kinds: result.kinds,
    }).toEqual({
      days: 30,
      first: firstDay,
      active: [
        {
          day: PulseDay.addDays(PULSE_TEST_TODAY, -20),
          batches: 1,
          records: 1,
          events: 1,
          platforms: 1,
        },
        {
          day: PULSE_TEST_YESTERDAY,
          batches: 1,
          records: 1,
          events: 1,
          platforms: 1,
        },
        {
          day: PULSE_TEST_TODAY,
          batches: 5,
          records: 10,
          events: 10,
          platforms: 5,
        },
      ],
      sectors: [
        { sector_bucket: PulseSectorBucket.Finance, platforms: 6, events: 11 },
        {
          sector_bucket: PulseSectorBucket.EnergyUtilities,
          platforms: 1,
          events: 1,
        },
      ],
      regions: [
        { region_bucket: PulseRegionBucket.Europe, platforms: 6, events: 11 },
        {
          region_bucket: PulseRegionBucket.AsiaPacific,
          platforms: 1,
          events: 1,
        },
      ],
      kinds: [
        {
          object_type: PulseObjectType.Malware,
          event_kind: PulseEventKind.Created,
          platforms: 6,
          events: 11,
        },
        {
          object_type: PulseObjectType.Indicator,
          event_kind: PulseEventKind.Created,
          platforms: 1,
          events: 1,
        },
      ],
    });
  });

  it('should count a batch once when it is retried', async () => {
    // Given
    const client = await registerTitled('R');
    const batchId = randomUUID();
    const batch = {
      day: PULSE_TEST_TODAY,
      batchId,
      records: [malware(LOCKBIT), malware(EMOTET)],
    };
    await client.push(batch);

    // When
    await client.push(batch);

    // Then
    expect((await overview()).ingestion).toEqual({
      batches_today: 1,
      records_today: 2,
      batches_last_30_days: 1,
      records_last_30_days: 2,
    });
  });

  it('should count the refused requests per operation and code once flushed', async () => {
    // Given
    const client = await registerTitled('Z');
    await client.lookupResult({
      day: PULSE_TEST_TODAY,
      objectType: PulseObjectType.Malware,
      values: [LOCKBIT],
    });
    await client.lookupResult({
      day: PULSE_TEST_TODAY,
      objectType: PulseObjectType.Malware,
      values: [EMOTET],
    });
    await refuseInactiveRegistration();
    const beforeFlush = (await overview()).rejections;

    // When
    await PulseApp.flushRejectionCounts();

    // Then
    expect({ beforeFlush, afterFlush: (await overview()).rejections }).toEqual({
      beforeFlush: [],
      afterFlush: [
        {
          operation: PulseNetworkOperation.PulseLookup,
          code: PulseNetworkRejectionCode.PulseContributionRequired,
          requests: 2,
          last_day: PULSE_TEST_TODAY,
        },
        {
          operation: PulseNetworkOperation.PulseStatus,
          code: PulseNetworkRejectionCode.Unauthenticated,
          requests: 1,
          last_day: PULSE_TEST_TODAY,
        },
      ],
    });
  });

  it('should keep the counts of a failed flush for the next one', async () => {
    // Given
    await refuseInactiveRegistration();
    vi.spyOn(PulseNetworkDomain, 'addRejections').mockRejectedValueOnce(
      new Error('connection lost')
    );
    await expect(PulseApp.flushRejectionCounts()).rejects.toThrow(
      'connection lost'
    );

    // When
    await PulseApp.flushRejectionCounts();

    // Then
    expect((await overview()).rejections).toEqual([
      {
        operation: PulseNetworkOperation.PulseStatus,
        code: PulseNetworkRejectionCode.Unauthenticated,
        requests: 1,
        last_day: PULSE_TEST_TODAY,
      },
    ]);
  });

  it('should list the registered platforms with their status and contribution', async () => {
    // Given
    const { contributors, previewOnly } = await seedNetwork(clock);
    await contributors[4]!.purge();

    // When
    const result = await platforms();

    // Then
    const byTitle = new Map(
      result.edges.map((edge) => [edge.node.title, edge.node])
    );
    expect({
      totalCount: result.totalCount,
      titles: titles(result),
      contributor: byTitle.get(`${TITLE_PREFIX} A`),
      purged: byTitle.get(`${TITLE_PREFIX} E`),
      yesterdayOnly: byTitle.get(`${TITLE_PREFIX} F`)?.status,
      lapsed: byTitle.get(`${TITLE_PREFIX} L`)?.status,
      previewOnly: byTitle.get(`${TITLE_PREFIX} P`),
    }).toEqual({
      totalCount: 8,
      titles: ['A', 'B', 'C', 'D', 'E', 'F', 'L', 'P'].map(
        (title) => `${TITLE_PREFIX} ${title}`
      ),
      contributor: {
        id: contributors[0]!.platform.serviceInstanceId,
        title: `${TITLE_PREFIX} A`,
        organization_name: 'SECOND ORGA',
        sector_bucket: PulseSectorBucket.Finance,
        region_bucket: PulseRegionBucket.Europe,
        status: PulseNetworkPlatformStatus.Contributing,
        first_contribution_day: PULSE_TEST_TODAY,
        last_contribution_day: PULSE_TEST_TODAY,
        last_batch_at: expect.anything(),
        batches_last_30_days: 1,
        records_last_30_days: 2,
        purge_requests: 0,
        last_purge_day: null,
      },
      purged: {
        id: contributors[4]!.platform.serviceInstanceId,
        title: `${TITLE_PREFIX} E`,
        organization_name: 'SECOND ORGA',
        sector_bucket: null,
        region_bucket: null,
        status: PulseNetworkPlatformStatus.PreviewOnly,
        first_contribution_day: null,
        last_contribution_day: null,
        last_batch_at: null,
        batches_last_30_days: 0,
        records_last_30_days: 0,
        purge_requests: 1,
        last_purge_day: PULSE_TEST_TODAY,
      },
      yesterdayOnly: PulseNetworkPlatformStatus.Contributing,
      lapsed: PulseNetworkPlatformStatus.Lapsed,
      previewOnly: expect.objectContaining({
        id: previewOnly.platform.serviceInstanceId,
        status: PulseNetworkPlatformStatus.PreviewOnly,
        purge_requests: 0,
      }),
    });
  });

  it('should filter, sort and page the platforms', async () => {
    // Given
    await seedNetwork(clock);

    // When
    const firstPage = await platforms({
      first: 3,
      orderBy: PulseNetworkPlatformOrdering.RecordsLast_30Days,
      orderMode: OrderingMode.Desc,
    });
    const nextPage = await platforms({
      first: 3,
      after: firstPage.pageInfo.endCursor ?? null,
      orderBy: PulseNetworkPlatformOrdering.RecordsLast_30Days,
      orderMode: OrderingMode.Desc,
    });
    const lastPage = await platforms({
      first: 3,
      after: nextPage.pageInfo.endCursor ?? null,
      orderBy: PulseNetworkPlatformOrdering.RecordsLast_30Days,
      orderMode: OrderingMode.Desc,
    });
    const lapsed = await platforms({
      status: PulseNetworkPlatformStatus.Lapsed,
    });
    const searched = await platforms({ searchTerm: `${TITLE_PREFIX} p` });
    const byStatus = await platforms({
      orderBy: PulseNetworkPlatformOrdering.Status,
      orderMode: OrderingMode.Desc,
    });

    // Then
    const short = (connection: PulseNetworkPlatformConnection) =>
      titles(connection).map((title) => title.slice(TITLE_PREFIX.length + 1));
    expect({
      pages: [firstPage, nextPage, lastPage].map(short),
      hasNextPage: [firstPage, nextPage].map(
        (page) => page.pageInfo.hasNextPage
      ),
      lapsed: short(lapsed),
      searched: short(searched),
      byStatus: short(byStatus),
    }).toEqual({
      pages: [
        ['A', 'B', 'C'],
        ['D', 'E', 'F'],
        ['L', 'P'],
      ],
      hasNextPage: [true, true],
      lapsed: ['L'],
      searched: ['P'],
      byStatus: ['P', 'L', 'A', 'B', 'C', 'D', 'E', 'F'],
    });
  });

  it('should reject a page size or a cursor out of range', async () => {
    // When
    const results = [
      await executePulse({
        query: PLATFORMS_QUERY,
        variables: {
          first: 0,
          orderBy: PulseNetworkPlatformOrdering.Title,
          orderMode: OrderingMode.Asc,
        },
        context: pulseAdminContext,
      }),
      await executePulse({
        query: PLATFORMS_QUERY,
        variables: {
          first: 10,
          after: 'not a cursor',
          orderBy: PulseNetworkPlatformOrdering.Title,
          orderMode: OrderingMode.Asc,
        },
        context: pulseAdminContext,
      }),
    ];

    // Then
    expect(results.map((result) => errorCodes(result))).toEqual([
      ['BAD_USER_INPUT'],
      ['BAD_USER_INPUT'],
    ]);
  });

  it('should show the network trending the platforms read, with a key identifier in place of the hash', async () => {
    // Given
    const { contributors } = await seedNetwork(clock);
    const platformView = await contributors[0]!.trending({
      day: PULSE_TEST_TODAY,
      period: PulsePeriod.Last_7Days,
    });

    // When
    const result = await trending(PulsePeriod.Last_7Days);

    // Then
    expect({
      day: result.day,
      period: result.period,
      computedAt: new Date(result.computed_at).toISOString(),
      keyIds: result.items.map((item) => /^[0-9a-f]{12}$/.test(item.key_id)),
      items: result.items.map(({ key_id: _keyId, ...item }) => item),
    }).toEqual({
      day: PULSE_TEST_TODAY,
      period: PulsePeriod.Last_7Days,
      computedAt: PULSE_TEST_NOW,
      keyIds: [true, true],
      items: platformView.items.map(({ hash: _hash, ...item }) => item),
    });
  });

  it('should never answer a value, a hash, an at-rest key or a pseudonym', async () => {
    // Given
    const { contributors } = await seedNetwork(clock);
    await contributors[1]!.purge();
    const hashes = await Promise.all(
      [LOCKBIT, EMOTET, QAKBOT].map((value) =>
        contributors[0]!.hash(PULSE_TEST_TODAY, PulseObjectType.Malware, value)
      )
    );
    const keys: { rows: { key: string }[] } = await dbRaw(
      `SELECT encode(at_rest_key, 'hex') AS key FROM "PulseKey"`
    );
    const config = PulseConfig.get();
    if (!config.enabled) {
      throw new Error('Threat Pulse must be enabled in tests');
    }
    const pseudonyms = contributors.map((client) =>
      PulseCrypto.platformPseudonym(
        client.platform.platformId,
        config.secrets.platformKey
      )
    );

    // When
    const answers = JSON.stringify([
      await overview(),
      await trending(PulsePeriod.Last_30Days),
      await platforms(),
    ]);

    // Then
    const secrets = [
      LOCKBIT,
      EMOTET,
      QAKBOT,
      IP_VALUE,
      ...hashes,
      ...keys.rows.map((row) => row.key),
      ...pseudonyms,
      ...contributors.map((client) => client.platform.platformId),
      ...contributors.map((client) => client.platform.token),
    ];
    expect(secrets.filter((secret) => answers.includes(secret))).toEqual([]);
  });

  it('should answer without matching the platforms while the service is disabled', async () => {
    // Given
    await seedNetwork(clock);
    const config = PulseConfig.get();
    if (!config.enabled) {
      throw new Error('Threat Pulse must be enabled in tests');
    }
    vi.spyOn(PulseConfig, 'get').mockReturnValue({
      enabled: false,
      reason: 'disabled by configuration (PULSE_ENABLED=false)',
      severity: 'info',
      settings: config.settings,
      retentionMonths: config.retentionMonths,
    });

    // When
    const result = await overview();
    const list = await platforms();
    const items = await trending(PulsePeriod.Last_7Days);

    // Then
    expect({
      enabled: result.settings.enabled,
      reason: result.settings.disabled_reason,
      contributing: result.platforms.contributing,
      previewOnly: result.platforms.preview_only,
      unregistered: result.platforms.unregistered,
      totalCount: list.totalCount,
      trending: items.items,
    }).toEqual({
      enabled: false,
      reason: 'disabled by configuration (PULSE_ENABLED=false)',
      contributing: 6,
      previewOnly: null,
      unregistered: null,
      totalCount: 0,
      trending: [],
    });
  });

  it('should delete the monitoring rows with the retention, the refused requests after 30 days', async () => {
    // Given
    const { contributors } = await seedNetwork(clock);
    await contributors[0]!.purge();
    await refuseInactiveRegistration();
    await PulseApp.flushRejectionCounts();
    const counts = async () => ({
      ingestion: await TestHelper.pulse.countRows(
        'PulsePlatformDailyIngestion'
      ),
      purges: await TestHelper.pulse.countRows('PulsePurgeRequest'),
      rejections: await TestHelper.pulse.countRows('PulseRejection'),
    });
    const before = await counts();

    // When
    await PulseApp.applyRetention(new Date('2026-11-03T10:00:00.000Z'));
    const afterOneMonth = await counts();
    await PulseApp.applyRetention(new Date('2027-12-03T10:00:00.000Z'));
    const afterRetention = await counts();

    // Then
    expect({ before, afterOneMonth, afterRetention }).toEqual({
      before: { ingestion: 6, purges: 1, rejections: 1 },
      afterOneMonth: { ingestion: 6, purges: 1, rejections: 0 },
      afterRetention: { ingestion: 0, purges: 0, rejections: 0 },
    });
  });
});
