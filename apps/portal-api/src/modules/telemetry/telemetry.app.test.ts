import { describe, expect, it, vi } from 'vitest';
import { esDbClient } from '../../thirdparty/elasticsearch/client';
import { logApp } from '../../utils/app-logger.util';
import { telemetryApp } from './telemetry.app';
import { LoginEvent, TelemetryEventType } from './telemetry.types';

// Mock the ES Client
vi.mock('@elastic/elasticsearch', () => ({
  Client: vi.fn(),
}));

const mockWriteResponse = {
  _id: 'mock-id',
  _index: 'mock-index',
  _version: 1,
  result: 'created' as never,
  _shards: { total: 1, successful: 1, failed: 0 },
  _seq_no: 0,
  _primary_term: 1,
};

describe('TelemetryApp', () => {
  describe('sendTelemetryEvent', () => {
    it('should index the document in elastic search', async () => {
      const indexSpy = vi
        .spyOn(esDbClient, 'index')
        .mockResolvedValue(mockWriteResponse);

      const timestamp = new Date();

      const event: LoginEvent = {
        event_type: TelemetryEventType.LOGIN,
        organization_id: 'fakeOrgId',
        organization_name: 'fakeOrgName',
        user_id: 'fakeUserId',
        '@timestamp': timestamp.toISOString(),
        source: 'xtm-hub',
      };

      await telemetryApp.sendTelemetryEvent(event);

      expect(indexSpy).toHaveBeenCalledExactlyOnceWith({
        index: 'telemetry',
        document: event,
      });
    });

    it('should not throw if there is an error but log an error', async () => {
      vi.spyOn(esDbClient, 'index').mockRejectedValue(
        new Error('Connection failed')
      );
      const logErrorSpy = vi.spyOn(logApp, 'error');

      const timestamp = new Date();

      const event: LoginEvent = {
        event_type: TelemetryEventType.LOGIN,
        organization_id: 'fakeOrgId',
        organization_name: 'fakeOrgName',
        user_id: 'fakeUserId',
        '@timestamp': timestamp.toISOString(),
        source: 'xtm-hub',
      };

      await telemetryApp.sendTelemetryEvent(event);
      expect(logErrorSpy).toHaveBeenCalledOnce();
    });
  });
});
