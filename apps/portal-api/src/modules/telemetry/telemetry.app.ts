import { esDbClient } from '../../thirdparty/elasticsearch/client';
import { logApp } from '../../utils/app-logger.util';
import { TelemetryEvent } from './telemetry.types';

const TELEMETRY_INDEX = 'telemetry';

export const telemetryApp = {
  async sendTelemetryEvent(event: TelemetryEvent) {
    try {
      await esDbClient.index({
        index: TELEMETRY_INDEX,
        document: event,
      });
    } catch (error) {
      logApp.error('Error sending telemetry event ', { event, error });
    }
  },
};
