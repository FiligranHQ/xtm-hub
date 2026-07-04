import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearSnapshot,
  getSnapshotObservations,
  normalizeTelemetryTags,
  probeTelemetryEndpoint,
  resolveSnapshotTelemetrySettings,
  setSnapshotObservations,
} from './telemetry-snapshot.helper';

const HOUR_MS = 60 * 60 * 1000;
const PROD_URL = 'https://telemetry.hub.filigran.io/v1/metrics';
const STAGING_URL = 'https://telemetry.hub.staging.filigran.io/v1/metrics';

describe('resolveSnapshotTelemetrySettings', () => {
  it.each([
    { environment: 'production', enabled: true, endpoint: PROD_URL },
    { environment: 'staging', enabled: true, endpoint: STAGING_URL },
    { environment: 'development', enabled: false, endpoint: STAGING_URL },
    { environment: 'test', enabled: false, endpoint: STAGING_URL },
    { environment: '', enabled: false, endpoint: STAGING_URL },
  ])(
    'is enabled=$enabled towards $endpoint in $environment',
    ({ environment, enabled, endpoint }) => {
      const settings = resolveSnapshotTelemetrySettings(environment, undefined);
      expect(settings.enabled).toBe(enabled);
      expect(settings.endpoint).toBe(endpoint);
    }
  );

  it('always uses the fixed 1h refresh / 6h export cadence outside debug', () => {
    for (const environment of ['production', 'staging', 'development']) {
      const settings = resolveSnapshotTelemetrySettings(environment, undefined);
      expect(settings.refreshIntervalMillis).toBe(HOUR_MS);
      expect(settings.exportIntervalMillis).toBe(6 * HOUR_MS);
    }
  });

  it('enables telemetry with the tight cadence only on explicit debug opt-in', () => {
    const settings = resolveSnapshotTelemetrySettings('development', 'true');
    expect(settings.enabled).toBe(true);
    expect(settings.endpoint).toBe(STAGING_URL);
    expect(settings.refreshIntervalMillis).toBe(60 * 1000);
    expect(settings.exportIntervalMillis).toBe(2 * 60 * 1000);
  });

  it('ignores non-"true" debug flag values', () => {
    for (const flag of ['1', 'TRUE', 'yes', '']) {
      expect(
        resolveSnapshotTelemetrySettings('development', flag).enabled
      ).toBe(false);
    }
  });
});

describe('normalizeTelemetryTags', () => {
  it.each([
    { raw: undefined, expected: [] },
    { raw: null, expected: [] },
    { raw: '', expected: [] },
    { raw: '   ', expected: [] },
    { raw: ',,,', expected: [] },
    { raw: 'saas', expected: ['saas'] },
    { raw: 'saas,eu-west', expected: ['eu-west', 'saas'] },
    { raw: ' SaaS , EU-West ', expected: ['eu-west', 'saas'] },
    { raw: 'saas,saas,SAAS', expected: ['saas'] },
    { raw: 'b,a,c,a', expected: ['a', 'b', 'c'] },
    { raw: 'saas,, eu-west ,', expected: ['eu-west', 'saas'] },
  ])('normalizes $raw to $expected', ({ raw, expected }) => {
    expect(normalizeTelemetryTags(raw)).toEqual(expected);
  });
});

describe('snapshot store', () => {
  beforeEach(() => {
    clearSnapshot();
  });

  it('returns an empty list for a gauge that was never refreshed', () => {
    expect(getSnapshotObservations('xtm_hub_unknown')).toEqual([]);
  });

  it('stores and returns observations with attributes', () => {
    setSnapshotObservations('xtm_hub_registered_platforms_by_identity', [
      {
        value: 3,
        attributes: { product: 'open-cti', contract: 'EE', status: 'active' },
      },
      {
        value: 1,
        attributes: {
          product: 'open-aev',
          contract: 'CE',
          status: 'inactive',
        },
      },
    ]);
    const observations = getSnapshotObservations(
      'xtm_hub_registered_platforms_by_identity'
    );
    expect(observations).toHaveLength(2);
    expect(observations[0].value).toBe(3);
    expect(observations[0].attributes?.product).toBe('open-cti');
  });

  it('keeps the previous observations until a new refresh replaces them', () => {
    setSnapshotObservations('xtm_hub_total_users_count', [{ value: 42 }]);
    // A failed refresh does not call setSnapshotObservations - the previous
    // value stays visible to the exporter.
    expect(getSnapshotObservations('xtm_hub_total_users_count')).toEqual([
      { value: 42 },
    ]);
    setSnapshotObservations('xtm_hub_total_users_count', [{ value: 45 }]);
    expect(getSnapshotObservations('xtm_hub_total_users_count')).toEqual([
      { value: 45 },
    ]);
  });
});

describe('probeTelemetryEndpoint', () => {
  it('returns true when the collector answers 200', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ status: 200 });
    await expect(
      probeTelemetryEndpoint(
        'https://telemetry.example/v1/metrics',
        fetchFn as unknown as typeof fetch
      )
    ).resolves.toBe(true);
    // The probe intentionally speaks OTLP/HTTP JSON - the exact protocol of
    // @opentelemetry/exporter-metrics-otlp-http (protobuf is the separate
    // -proto exporter package).
    expect(fetchFn).toHaveBeenCalledWith(
      'https://telemetry.example/v1/metrics',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
    );
  });

  it('returns false on a non-200 response (self-disable)', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ status: 404 });
    await expect(
      probeTelemetryEndpoint(
        'https://telemetry.example/v1/metrics',
        fetchFn as unknown as typeof fetch
      )
    ).resolves.toBe(false);
  });

  it('returns false when the endpoint is unreachable (self-disable)', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));
    await expect(
      probeTelemetryEndpoint(
        'https://telemetry.example/v1/metrics',
        fetchFn as unknown as typeof fetch
      )
    ).resolves.toBe(false);
  });
});
