import type { TelemetryEvent } from '../../modules/telemetry/telemetry.types';

export const TELEMETRY_QUEUES = {
  EVENTS: 'telemetry.events',
  DEAD_LETTER: 'telemetry.deadletter',
} as const;

export interface TelemetryJobData {
  event: TelemetryEvent;
}
