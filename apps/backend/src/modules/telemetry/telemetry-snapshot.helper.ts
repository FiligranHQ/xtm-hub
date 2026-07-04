/**
 * Pure helpers for the gauge (snapshot) telemetry - kept free of config, DB
 * and OpenTelemetry imports so they stay trivially unit-testable.
 */

const PRODUCTION_ENDPOINT = 'https://telemetry.hub.filigran.io/v1/metrics';
const STAGING_ENDPOINT = 'https://telemetry.hub.staging.filigran.io/v1/metrics';

const HOUR_MS = 60 * 60 * 1000;
// Fixed cadence for EVERY environment: DB counts hourly, export every 6h
// (the shared Filigran contract). The debug cadence below exists only for
// explicitly opted-in pipeline testing.
const REFRESH_INTERVAL_MS = HOUR_MS;
const EXPORT_INTERVAL_MS = 6 * HOUR_MS;
const DEBUG_REFRESH_INTERVAL_MS = 60 * 1000;
const DEBUG_EXPORT_INTERVAL_MS = 2 * 60 * 1000;

export interface SnapshotTelemetrySettings {
  enabled: boolean;
  endpoint: string;
  refreshIntervalMillis: number;
  exportIntervalMillis: number;
}

/**
 * Resolve whether and how gauge telemetry runs for a given environment.
 *
 * Gauge telemetry only starts in `production` and `staging`. Unlike the
 * sibling products where "dev mode" means a developer laptop, the hub's
 * infrastructure deploys long-lived environments with NODE_ENV=development
 * (per-PR feature envs, dev, prerelease): letting those export - especially
 * at a tighter dev cadence - flooded the staging collector with one upload
 * every 2 minutes per environment and minted a fresh instance identity for
 * every CI run. Hence: disabled everywhere else, fixed 1h-refresh /
 * 6h-export cadence for everyone.
 *
 * `TELEMETRY_GAUGE_DEBUG=true` is the explicit opt-in for exercising the
 * pipeline end-to-end (any environment, tight cadence, staging collector
 * unless production).
 */
export const resolveSnapshotTelemetrySettings = (
  environment: string,
  debugFlag: string | undefined
): SnapshotTelemetrySettings => {
  const debug = debugFlag === 'true';
  return {
    enabled: debug || environment === 'production' || environment === 'staging',
    endpoint:
      environment === 'production' ? PRODUCTION_ENDPOINT : STAGING_ENDPOINT,
    refreshIntervalMillis: debug
      ? DEBUG_REFRESH_INTERVAL_MS
      : REFRESH_INTERVAL_MS,
    exportIntervalMillis: debug ? DEBUG_EXPORT_INTERVAL_MS : EXPORT_INTERVAL_MS,
  };
};

/** One gauge observation: a value plus optional low-cardinality dimensions. */
export interface GaugeObservation {
  value: number;
  attributes?: Record<string, string>;
}

/**
 * Shared Filigran TELEMETRY_TAGS normalization contract (same behavior as
 * OpenCTI, OpenAEV, XTM One and OpenGRC): split on commas, trim, lowercase,
 * drop empties, dedupe, sort. The normalized tags are exported as the
 * `filigran.telemetry.tags` resource attribute.
 */
export const normalizeTelemetryTags = (
  raw: string | null | undefined
): string[] => {
  if (!raw) {
    return [];
  }
  const tags = new Set<string>();
  for (const part of raw.split(',')) {
    const tag = part.trim().toLowerCase();
    if (tag) {
      tags.add(tag);
    }
  }
  return [...tags].sort();
};

/**
 * In-memory snapshot store. Each gauge refresh is individually guarded by the
 * caller: a failed read keeps the previous observations instead of zeroing
 * the gauge (the contract shared with the sibling products).
 */
const snapshot = new Map<string, GaugeObservation[]>();

export const setSnapshotObservations = (
  name: string,
  observations: GaugeObservation[]
): void => {
  snapshot.set(name, observations);
};

export const getSnapshotObservations = (name: string): GaugeObservation[] =>
  snapshot.get(name) ?? [];

export const clearSnapshot = (): void => {
  snapshot.clear();
};

const PROBE_TIMEOUT_MS = 10_000;

/**
 * Startup connectivity probe (OpenCTI model): POST an empty OTLP payload to
 * the collector and require an HTTP 200. When the collector is unreachable
 * (egress blocked, collector down), gauge telemetry self-disables for the
 * lifetime of the process instead of retrying and logging export errors
 * every cycle.
 *
 * The JSON body is intentional: `@opentelemetry/exporter-metrics-otlp-http`
 * speaks OTLP/HTTP JSON (protobuf is the separate `-proto` exporter), so the
 * probe payload matches exactly what the exporter will send.
 */
export const probeTelemetryEndpoint = async (
  url: string,
  fetchFn: typeof fetch = fetch
): Promise<boolean> => {
  try {
    const response = await fetchFn(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    return response.status === 200;
  } catch {
    return false;
  }
};
