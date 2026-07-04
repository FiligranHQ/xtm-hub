/**
 * Pure helpers for the gauge (snapshot) telemetry - kept free of config, DB
 * and OpenTelemetry imports so they stay trivially unit-testable.
 */

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
