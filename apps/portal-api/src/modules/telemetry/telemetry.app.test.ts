import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  contextAdminUser,
  SERVICE_CSV_FEEDS_ID,
} from '../../../tests/tests.const';
import { ADMIN_UUID, PLATFORM_ORGANIZATION_UUID } from '../../portal.const';
import { esDbClient } from '../../thirdparty/elasticsearch/client';
import { logApp } from '../../utils/app-logger.util';
import { telemetryApp } from './telemetry.app';
import {
  TELEMETRY_SOURCE,
  TelemetryEventService,
  TelemetryEventServiceType,
  TelemetryOrganizationType,
  TelemetryTargetProduct,
} from './telemetry.const';
import { LoginEvent, TelemetryEventType } from './telemetry.types';

import { toGlobalId } from 'graphql-relay/node/node.js';
import {
  PlatformIdentifier,
  ServiceConfigurationStatus,
} from '../../__generated__/resolvers-types';
import type { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { serviceContractDomain } from '../services/contract/domain';

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
        organization_type: TelemetryOrganizationType.PROFESSIONAL,
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
        organization_type: TelemetryOrganizationType.PROFESSIONAL,
        user_id: 'fakeUserId',
        '@timestamp': timestamp.toISOString(),
        source: 'xtm-hub',
      };

      await telemetryApp.sendTelemetryEvent(event);
      expect(logErrorSpy).toHaveBeenCalledOnce();
    });
  });
  describe('sendOneClickDeployEvent', () => {
    it('should send a OneClickDeployEvent with version', async () => {
      vi.useFakeTimers();
      const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
      vi.setSystemTime(date);
      const telemetrySpy = vi
        .spyOn(telemetryApp, 'sendTelemetryEvent')
        .mockResolvedValue();
      vi.spyOn(
        serviceContractDomain,
        'loadConfigurationByPlatform'
      ).mockResolvedValue({
        service_instance_id:
          '5891d6cf-1737-48bb-8f60-de520a93f2bd' as ServiceInstanceId,
        config: {
          token: '59dea7ba-b3b3-4b42-bb60-6326159dc937',
          platform_id: '916121bf-d246-4a43-8522-24be19537b91',
          platform_url: 'https://testing.obas.staging.filigran.io/',
          registerer_id: '7de5c830-ed96-45ff-91a7-b384943a4620',
          platform_title: 'Open AEV Instance',
          platform_version: '1.0.0',
          platform_contract: 'EE',
        },
        status: ServiceConfigurationStatus.Active,
      });

      const fakeResourceId = 'c07f6909-f8c5-4f61-b17d-b5b2da9b2799';
      const fakePlatformId = '11b0fe37-0623-4487-af23-0efa6de157a4';

      await telemetryApp.sendOneClickDeployEvent(contextAdminUser, {
        userId: ADMIN_UUID,
        input: {
          platform_identifier: PlatformIdentifier.Opencti,
          service_instance_id: toGlobalId(
            'ServiceInstance',
            SERVICE_CSV_FEEDS_ID
          ),
          resource_id: toGlobalId('DocumentId', fakeResourceId),
          resource_title: 'CsvFeed Title',
          platform_id: toGlobalId('OpenCTIPlatform', fakePlatformId),
        },
      });

      expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
        '@timestamp': '2025-02-03T13:12:15.000Z',
        event_type: TelemetryEventType.ONE_CLICK_DEPLOY,
        organization_id: PLATFORM_ORGANIZATION_UUID,
        organization_name: 'Filigran',
        source: TELEMETRY_SOURCE,
        user_id: ADMIN_UUID,
        service: TelemetryEventService.INTEGRATION_FEEDS_LIBRARY,
        service_type: TelemetryEventServiceType.CSV_FEEDS,
        resource_id: fakeResourceId,
        resource_title: 'CsvFeed Title',
        platform_id: fakePlatformId,
        platform_version: '1.0.0',
        target_product: TelemetryTargetProduct.OPEN_CTI,
      });
    });
    it('should send a OneClickDeployEvent without version', async () => {
      vi.useFakeTimers();
      const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
      vi.setSystemTime(date);
      const telemetrySpy = vi
        .spyOn(telemetryApp, 'sendTelemetryEvent')
        .mockResolvedValue();
      vi.spyOn(
        serviceContractDomain,
        'loadConfigurationByPlatform'
      ).mockResolvedValue({
        service_instance_id:
          '5891d6cf-1737-48bb-8f60-de520a93f2bd' as ServiceInstanceId,
        config: {
          token: '59dea7ba-b3b3-4b42-bb60-6326159dc937',
          platform_id: '916121bf-d246-4a43-8522-24be19537b91',
          platform_url: 'https://testing.obas.staging.filigran.io/',
          registerer_id: '7de5c830-ed96-45ff-91a7-b384943a4620',
          platform_title: 'Open AEV Instance',
          platform_contract: 'EE',
        },
        status: ServiceConfigurationStatus.Active,
      });

      const fakeResourceId = 'c07f6909-f8c5-4f61-b17d-b5b2da9b2799';
      const fakePlatformId = '11b0fe37-0623-4487-af23-0efa6de157a4';

      await telemetryApp.sendOneClickDeployEvent(contextAdminUser, {
        userId: ADMIN_UUID,
        input: {
          platform_identifier: PlatformIdentifier.Opencti,
          service_instance_id: toGlobalId(
            'ServiceInstance',
            SERVICE_CSV_FEEDS_ID
          ),
          resource_id: toGlobalId('DocumentId', fakeResourceId),
          resource_title: 'CsvFeed Title',
          platform_id: toGlobalId('OpenCTIPlatform', fakePlatformId),
        },
      });

      expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
        '@timestamp': '2025-02-03T13:12:15.000Z',
        event_type: TelemetryEventType.ONE_CLICK_DEPLOY,
        organization_id: PLATFORM_ORGANIZATION_UUID,
        organization_name: 'Filigran',
        organization_type: TelemetryOrganizationType.PROFESSIONAL,
        source: TELEMETRY_SOURCE,
        user_id: ADMIN_UUID,
        service: TelemetryEventService.INTEGRATION_FEEDS_LIBRARY,
        service_type: TelemetryEventServiceType.CSV_FEEDS,
        resource_id: fakeResourceId,
        resource_title: 'CsvFeed Title',
        platform_id: fakePlatformId,
        target_product: TelemetryTargetProduct.OPEN_CTI,
      });
    });
  });
  afterEach(async () => {
    vi.useRealTimers();
  });
});
