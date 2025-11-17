import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  contextAdminUser,
  SERVICE_INTEGRATIONS_FEEDS_ID,
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
import { dbTx } from '../../../knexfile';
import {
  IntegrationFeedType,
  PlatformIdentifier,
  ServiceConfigurationStatus,
} from '../../__generated__/resolvers-types';
import { DocumentId } from '../../model/kanel/public/Document';
import type { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { createDocumentWithChildren } from '../services/document/document.domain';
import * as DocumentHelper from '../services/document/document.helper';
import {
  CsvFeed,
  INTEGRATION_FEED_CSV_FEED_METADATA,
  OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
} from '../services/integration-feeds/integration-feeds.model';
import * as serviceInstanceDomain from '../services/service-instance.domain';

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
  const minioFileMock = {
    minioName: 'minioFile',
    mimeType: 'mimeType',
    fileName: 'csvfilename',
  };
  beforeEach(() => {
    vi.spyOn(DocumentHelper, 'processUploads').mockResolvedValue([
      minioFileMock,
    ]);
  });

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
      const platform_id = '916121bf-d246-4a43-8522-24be19537b91';
      const platformServiceInstanceId = '5891d6cf-1737-48bb-8f60-de520a93f2bd';
      vi.spyOn(
        serviceInstanceDomain,
        'loadPlatformConfigurationByServiceInstanceId'
      ).mockResolvedValue({
        service_instance_id: platformServiceInstanceId as ServiceInstanceId,
        config: {
          token: '59dea7ba-b3b3-4b42-bb60-6326159dc937',
          platform_id: platform_id,
          platform_url: 'https://testing.oaev.staging.filigran.io/',
          registerer_id: '7de5c830-ed96-45ff-91a7-b384943a4620',
          platform_title: 'Open AEV Instance',
          platform_version: '1.0.0',
          platform_contract: 'EE',
        },
        status: ServiceConfigurationStatus.Active,
      });

      const fakeResourceId =
        'c07f6909-f8c5-4f61-b17d-b5b2da9b2799' as DocumentId;
      const trx = await dbTx();
      await createDocumentWithChildren<CsvFeed>(
        OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
        {
          id: fakeResourceId,
          uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
          name: 'myCsvFeed',
          slug: 'myCsvFeed',
          description: 'description',
          minio_name: 'minioName',
          file_name: 'csvfilename',
          service_instance_id: SERVICE_INTEGRATIONS_FEEDS_ID,
          integration_type: IntegrationFeedType.CsvFeed,
          active: true,
        },
        [],
        INTEGRATION_FEED_CSV_FEED_METADATA,
        contextAdminUser,
        trx
      );
      trx.commit();

      await telemetryApp.sendOneClickDeployEvent({
        userId: ADMIN_UUID,
        input: {
          platform_identifier: PlatformIdentifier.Opencti,
          service_instance_id: toGlobalId(
            'ServiceInstance',
            SERVICE_INTEGRATIONS_FEEDS_ID
          ),
          resource_id: toGlobalId('DocumentId', fakeResourceId),
          resource_title: 'CsvFeed Title',
          platform_service_instance_id: toGlobalId(
            'RegisteredPlatform',
            platformServiceInstanceId
          ),
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
        platform_id: platform_id,
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
      const platformId = '916121bf-d246-4a43-8522-24be19537b91';
      const platformServiceInstanceId = '5891d6cf-1737-48bb-8f60-de520a93f2bd';
      vi.spyOn(
        serviceInstanceDomain,
        'loadPlatformConfigurationByServiceInstanceId'
      ).mockResolvedValue({
        service_instance_id: platformServiceInstanceId as ServiceInstanceId,
        config: {
          token: '59dea7ba-b3b3-4b42-bb60-6326159dc937',
          platform_id: platformId,
          platform_url: 'https://testing.oaev.staging.filigran.io/',
          registerer_id: '7de5c830-ed96-45ff-91a7-b384943a4620',
          platform_title: 'Open AEV Instance',
          platform_contract: 'EE',
        },
        status: ServiceConfigurationStatus.Active,
      });

      const fakeResourceId = 'c07f6909-f8c5-4f61-b17d-b5b2da9b2799';

      await telemetryApp.sendOneClickDeployEvent({
        userId: ADMIN_UUID,
        input: {
          platform_identifier: PlatformIdentifier.Opencti,
          service_instance_id: toGlobalId(
            'ServiceInstance',
            SERVICE_INTEGRATIONS_FEEDS_ID
          ),
          resource_id: toGlobalId('DocumentId', fakeResourceId),
          resource_title: 'CsvFeed Title',
          platform_service_instance_id: toGlobalId(
            'RegisteredPlatform',
            platformServiceInstanceId
          ),
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
        platform_id: platformId,
        target_product: TelemetryTargetProduct.OPEN_CTI,
      });
    });
    it('should send a OneClickDeployEvent connectors with version', async () => {
      vi.useFakeTimers();
      const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
      vi.setSystemTime(date);
      const telemetrySpy = vi
        .spyOn(telemetryApp, 'sendTelemetryEvent')
        .mockResolvedValue();
      const platform_id = '916121bf-d246-4a43-8522-24be19537b91';
      const platformServiceInstanceId = '5891d6cf-1737-48bb-8f60-de520a93f2bd';
      vi.spyOn(
        serviceInstanceDomain,
        'loadPlatformConfigurationByServiceInstanceId'
      ).mockResolvedValue({
        service_instance_id: platformServiceInstanceId as ServiceInstanceId,
        config: {
          token: '59dea7ba-b3b3-4b42-bb60-6326159dc937',
          platform_id: platform_id,
          platform_url: 'https://testing.oaev.staging.filigran.io/',
          registerer_id: '7de5c830-ed96-45ff-91a7-b384943a4620',
          platform_title: 'Open AEV Instance',
          platform_version: '1.0.0',
          platform_contract: 'EE',
        },
        status: ServiceConfigurationStatus.Active,
      });

      const fakeResourceId =
        'ddd49f48-1a66-4670-9dab-0d247b613969' as DocumentId;
      const trx = await dbTx();
      await createDocumentWithChildren<CsvFeed>(
        OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
        {
          id: fakeResourceId,
          uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
          name: 'connector',
          slug: 'connector',
          description: 'description',
          minio_name: 'minioName',
          file_name: 'connectorFilename',
          service_instance_id: SERVICE_INTEGRATIONS_FEEDS_ID,
          integration_type: IntegrationFeedType.CsvFeed,
          active: true,
        },
        [],
        INTEGRATION_FEED_CSV_FEED_METADATA,
        contextAdminUser,
        trx
      );
      trx.commit();

      await telemetryApp.sendOneClickDeployEvent({
        userId: ADMIN_UUID,
        input: {
          platform_identifier: PlatformIdentifier.Opencti,
          service_instance_id: toGlobalId(
            'ServiceInstance',
            SERVICE_INTEGRATIONS_FEEDS_ID
          ),
          resource_id: toGlobalId('DocumentId', fakeResourceId),
          resource_title: 'Connector Title',
          platform_service_instance_id: toGlobalId(
            'RegisteredPlatform',
            platformServiceInstanceId
          ),
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
        resource_title: 'Connector Title',
        platform_id: platform_id,
        platform_version: '1.0.0',
        target_product: TelemetryTargetProduct.OPEN_CTI,
      });
    });
  });

  afterEach(async () => {
    vi.useRealTimers();
  });
});
