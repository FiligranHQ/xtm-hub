import express from 'express';
import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  GRAPHQL_RESOLVE_INFO,
} from '../../../tests/tests.const';
import {
  OrderingMode,
  PulseNetworkPlatformOrdering,
  PulseNetworkPlatformStatus,
  PulsePeriod,
  PulseRegionBucket,
  PulseSectorBucket,
} from '../../__generated__/resolvers-types';
import { PortalContext } from '../../model/portal-context';
import { REDACTED_PULSE_ERROR_MESSAGE } from '../../server/apollo-plugins/log';
import { appLogger } from '../../utils/app-logger.util';
import { UnknownErrorCode } from '../../utils/error/error.code';
import { PulseApp } from './pulse.app';
import { PulseErrorCode, PulseErrors } from './pulse.errors';
import { PulseNetworkApp } from './pulse.network.app';
import pulseResolver, { sanitizePulseFailure } from './pulse.resolver';

const PLATFORM_ID = 'platform-abc';
const PLATFORM_TOKEN = 'token-xyz';
const DAY = '2026-10-03';

const makeContext = (
  platformId: string | null = PLATFORM_ID,
  token: string | null = PLATFORM_TOKEN
): PortalContext => ({
  ...contextSimpleUserFiligran2,
  req: {
    headers: {
      'xtm-hub-platform-id': platformId ?? undefined,
      'xtm-hub-platform-token': token ?? undefined,
    },
  } as unknown as express.Request,
  res: {} as express.Response,
});

describe('pulse resolver', () => {
  it('should pass the platform headers to the app', async () => {
    // Given
    const salt = { day: DAY, salt: '000102030405060708090a0b0c0d0e0f' };
    vi.spyOn(PulseApp, 'pulseSalt').mockResolvedValue(salt);

    // When
    const result = await pulseResolver.Query!.pulseSalt!(
      {},
      { day: DAY },
      makeContext(),
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect({
      result,
      calls: vi.mocked(PulseApp.pulseSalt).mock.calls,
    }).toEqual({
      result: salt,
      calls: [[{ platformId: PLATFORM_ID, token: PLATFORM_TOKEN }, DAY]],
    });
  });

  it('should pass missing headers as null', async () => {
    // Given
    vi.spyOn(PulseApp, 'pulseStatus').mockRejectedValue(
      PulseErrors.unauthenticated()
    );

    // When
    const call = pulseResolver.Query!.pulseStatus!(
      {},
      {},
      makeContext(null, null),
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    await expect(call).rejects.toMatchObject({
      extensions: { code: PulseErrorCode.Unauthenticated },
    });
    expect(PulseApp.pulseStatus).toHaveBeenCalledWith({
      platformId: null,
      token: null,
    });
  });

  it('should keep the contract error code of a Threat Pulse error', async () => {
    // Given
    vi.spyOn(PulseApp, 'pulseTrending').mockRejectedValue(
      PulseErrors.rateLimited(42)
    );

    // When
    const call = pulseResolver.Query!.pulseTrending!(
      {},
      { input: { day: DAY, period: PulsePeriod.Last_7Days } },
      makeContext(),
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    await expect(call).rejects.toMatchObject({
      extensions: {
        code: PulseErrorCode.RateLimited,
        retry_after_seconds: 42,
      },
    });
  });

  it('should map an unexpected failure to UNKNOWN_ERROR', async () => {
    // Given
    vi.spyOn(PulseApp, 'pushPulse').mockRejectedValue(
      new Error('connection reset')
    );

    // When
    const call = pulseResolver.Mutation!.pushPulse!(
      {},
      {
        input: {
          day: DAY,
          sector_bucket: PulseSectorBucket.Finance,
          region_bucket: PulseRegionBucket.Europe,
          records: [],
        },
      },
      makeContext(),
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    await expect(call).rejects.toThrow(UnknownErrorCode.UnknownError);
  });

  it('should never log the text of an unexpected failure', async () => {
    // Given
    const failure = Object.assign(
      new Error(
        `duplicate key value violates unique constraint: insert into "PulseKeyContributor" values (decode('a1b2c3d4', 'hex'), 'pseudonym-9f8e')`
      ),
      { code: '23505' }
    );
    vi.spyOn(PulseApp, 'pushPulse').mockRejectedValue(failure);
    const logged = vi
      .spyOn(appLogger, 'log')
      .mockImplementation(() => appLogger);

    // When
    const call = pulseResolver.Mutation!.pushPulse!(
      {},
      {
        input: {
          day: DAY,
          sector_bucket: PulseSectorBucket.Finance,
          region_bucket: PulseRegionBucket.Europe,
          records: [],
        },
      },
      makeContext(),
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    await expect(call).rejects.toThrow(UnknownErrorCode.UnknownError);
    expect(logged).toHaveBeenCalled();
    const serialized = JSON.stringify(logged.mock.calls, (_, value) =>
      value instanceof Error
        ? { ...value, message: value.message, stack: value.stack }
        : value
    );
    expect(serialized).not.toContain('a1b2c3d4');
    expect(serialized).not.toContain('pseudonym-9f8e');
    expect(serialized).not.toContain('PulseKeyContributor');
    expect(serialized).toContain(REDACTED_PULSE_ERROR_MESSAGE);
    expect(serialized).toContain('"code":"23505"');
  });

  it('should keep a code-only message so the shared error mapping still applies', () => {
    // Given
    const failure = new TypeError('FORBIDDEN_ACCESS');

    // When
    const sanitized = sanitizePulseFailure(failure);

    // Then
    expect(sanitized.message).toBe('FORBIDDEN_ACCESS');
    expect(sanitized.name).toBe('TypeError');
    expect(sanitized.stack).toBe('TypeError: FORBIDDEN_ACCESS');
    expect(sanitizePulseFailure('raw string failure').message).toBe(
      REDACTED_PULSE_ERROR_MESSAGE
    );
  });

  it('should pass the purge platform id argument to the app', async () => {
    // Given
    vi.spyOn(PulseApp, 'pulsePurge').mockResolvedValue({
      success: true,
      deleted_records: 12,
    });

    // When
    const result = await pulseResolver.Mutation!.pulsePurge!(
      {},
      { platformId: PLATFORM_ID },
      makeContext(),
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect({
      result,
      calls: vi.mocked(PulseApp.pulsePurge).mock.calls,
    }).toEqual({
      result: { success: true, deleted_records: 12 },
      calls: [
        [{ platformId: PLATFORM_ID, token: PLATFORM_TOKEN }, PLATFORM_ID],
      ],
    });
  });

  it('should pass the monitoring arguments to the apps', async () => {
    // Given
    const trending = {
      day: DAY,
      period: PulsePeriod.Last_30Days,
      computed_at: null,
      items: [],
    };
    const connection = {
      totalCount: 0,
      edges: [],
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
    };
    vi.spyOn(PulseApp, 'networkTrending').mockResolvedValue(trending);
    vi.spyOn(PulseNetworkApp, 'platforms').mockResolvedValue(connection);
    const platformsArgs = {
      first: 25,
      after: btoa('25'),
      orderBy: PulseNetworkPlatformOrdering.Status,
      orderMode: OrderingMode.Desc,
      searchTerm: 'soc',
      status: PulseNetworkPlatformStatus.Lapsed,
    };

    // When
    const results = [
      await pulseResolver.Query!.pulseNetworkTrending!(
        {},
        { period: PulsePeriod.Last_30Days, first: 10 },
        makeContext(),
        GRAPHQL_RESOLVE_INFO
      ),
      await pulseResolver.Query!.pulseNetworkPlatforms!(
        {},
        platformsArgs,
        makeContext(),
        GRAPHQL_RESOLVE_INFO
      ),
    ];

    // Then
    expect({
      results,
      trendingCalls: vi.mocked(PulseApp.networkTrending).mock.calls,
      platformsCalls: vi.mocked(PulseNetworkApp.platforms).mock.calls,
    }).toEqual({
      results: [trending, connection],
      trendingCalls: [[{ period: PulsePeriod.Last_30Days, first: 10 }]],
      platformsCalls: [[platformsArgs]],
    });
  });

  it('should map an unexpected monitoring failure without its text', async () => {
    // Given
    vi.spyOn(PulseNetworkApp, 'overview').mockRejectedValue(
      new Error(`select from "PulsePurgeRequest" where pseudonym = 'beef'`)
    );

    // When
    const call = pulseResolver.Query!.pulseNetworkOverview!(
      {},
      {},
      makeContext(),
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    await expect(call).rejects.toThrow(UnknownErrorCode.UnknownError);
  });
});
