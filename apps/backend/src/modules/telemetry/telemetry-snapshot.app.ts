import {
  AggregationTemporalityPreference,
  OTLPMetricExporter,
} from '@opentelemetry/exporter-metrics-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { ATTR_SERVICE_INSTANCE_ID } from '@opentelemetry/semantic-conventions/incubating';
import config from 'config';
import portalConfig from '../../config';
import { logApp } from '../../utils/app-logger.util';
import { GAUGES, loadInstanceIdentity } from './telemetry-snapshot.domain';
import {
  getSnapshotObservations,
  normalizeTelemetryTags,
  probeTelemetryEndpoint,
  setSnapshotObservations,
} from './telemetry-snapshot.helper';

/**
 * Anonymous usage GAUGE telemetry (snapshots), complementing the existing
 * event-based telemetry (Elasticsearch): periodic SQL aggregates exported as
 * OTLP/HTTP observable gauges to the dedicated Filigran collector, exactly
 * like OpenCTI / OpenAEV / XTM One / OpenGRC. Events answer "what happened";
 * these gauges answer "what is the current state" (registered platforms,
 * users, organizations, ongoing trials, ...), which the event stream
 * fundamentally cannot (e.g. a platform that unregisters and re-registers
 * inflates event counts forever).
 *
 * Mirrors the OpenCTI model: DELTA temporality, hardcoded collector
 * endpoints, and a startup connectivity probe that self-disables gauge
 * telemetry when the collector is unreachable.
 */

const PRODUCTION_ENDPOINT = 'https://telemetry.hub.filigran.io/v1/metrics';
const STAGING_ENDPOINT = 'https://telemetry.hub.staging.filigran.io/v1/metrics';

const HOUR_MS = 60 * 60 * 1000;
// Snapshot refresh (DB counts) and export cadences. Tighter outside
// production so the pipeline can be exercised without waiting hours.
const PROD_REFRESH_INTERVAL_MS = HOUR_MS;
const PROD_EXPORT_INTERVAL_MS = 6 * HOUR_MS;
const DEV_REFRESH_INTERVAL_MS = 60 * 1000;
const DEV_EXPORT_INTERVAL_MS = 2 * 60 * 1000;

type Meter = ReturnType<MeterProvider['getMeter']>;

let meterProvider: MeterProvider | undefined;
let refreshTimer: NodeJS.Timeout | undefined;

const refreshSnapshot = async (): Promise<void> => {
  for (const { name, collect } of GAUGES) {
    try {
      setSnapshotObservations(name, await collect());
    } catch (error) {
      // A failed read keeps the previous observations instead of zeroing
      // the gauge (shared contract with the sibling products).
      logApp.error('Telemetry gauge refresh failed, keeping previous value', {
        gauge: name,
        error,
      });
    }
  }
};

const registerGauges = (meter: Meter): void => {
  for (const { name, description } of GAUGES) {
    const gauge = meter.createObservableGauge(name, { description });
    gauge.addCallback((result) => {
      for (const observation of getSnapshotObservations(name)) {
        result.observe(observation.value, observation.attributes);
      }
    });
  }
};

const startSnapshotTelemetry = async (): Promise<void> => {
  const isProduction = portalConfig.environment === 'production';
  const endpoint = isProduction ? PRODUCTION_ENDPOINT : STAGING_ENDPOINT;

  const reachable = await probeTelemetryEndpoint(endpoint);
  if (!reachable) {
    logApp.info(
      'Telemetry collector is not reachable, gauge telemetry is disabled',
      { endpoint }
    );
    return;
  }

  const { instanceId, instanceCreation } = await loadInstanceIdentity();

  const attributes: Record<string, string> = {
    [ATTR_SERVICE_NAME]: 'xtm-hub-telemetry',
    [ATTR_SERVICE_VERSION]:
      process.env.APP_VERSION ?? process.env.npm_package_version ?? '0.0.0-dev',
    [ATTR_SERVICE_INSTANCE_ID]: instanceId,
    'service.instance.creation': instanceCreation,
  };
  const tags = normalizeTelemetryTags(config.get<string>('telemetry_tags'));
  if (tags.length > 0) {
    // Shared Filigran contract: ONE comma-separated resource attribute,
    // landed as a `tags` column on every metric row by the warehouse.
    attributes['filigran.telemetry.tags'] = tags.join(',');
  }

  const exportIntervalMillis = isProduction
    ? PROD_EXPORT_INTERVAL_MS
    : DEV_EXPORT_INTERVAL_MS;
  const refreshIntervalMillis = isProduction
    ? PROD_REFRESH_INTERVAL_MS
    : DEV_REFRESH_INTERVAL_MS;

  meterProvider = new MeterProvider({
    resource: resourceFromAttributes(attributes),
    readers: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: endpoint,
          temporalityPreference: AggregationTemporalityPreference.DELTA,
        }),
        exportIntervalMillis,
      }),
    ],
  });
  registerGauges(meterProvider.getMeter('xtm-hub-telemetry'));

  await refreshSnapshot();
  refreshTimer = setInterval(
    () => void refreshSnapshot(),
    refreshIntervalMillis
  );
  refreshTimer.unref();

  logApp.info('Gauge telemetry started', {
    endpoint,
    instanceId,
    tags,
    exportIntervalMillis,
  });
};

export const TelemetrySnapshotApp = {
  start: async (): Promise<void> => {
    try {
      // Gauge telemetry must never break the platform boot.
      await startSnapshotTelemetry();
    } catch (error) {
      logApp.error('Failed to start gauge telemetry', { error });
    }
  },

  stop: async (): Promise<void> => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = undefined;
    }
    if (meterProvider) {
      try {
        await meterProvider.shutdown();
      } catch (error) {
        logApp.error('Failed to shutdown gauge telemetry meter provider', {
          error,
        });
      }
      meterProvider = undefined;
    }
  },
};
