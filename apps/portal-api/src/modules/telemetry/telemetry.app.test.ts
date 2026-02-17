import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
import { SERVICES, TEST_ORGANIZATIONS } from '../../../tests/tests.const';
import {
  IntegrationType,
  PlatformIdentifier,
  ServiceConfigurationStatus,
} from '../../__generated__/resolvers-types';
import type { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { DocumentApp } from '../services/document/document.app';
import { deleteDocuments } from '../services/document/document.helper';
import * as DocumentUploadsHelper from '../services/document/document.uploads.helper';
import { INTEGRATION_SERVICE_INSTANCE_ID } from '../services/integrations/integrations.model';
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
  beforeEach(async () => {
    vi.spyOn(DocumentUploadsHelper, 'processUploads').mockResolvedValue([
      minioFileMock,
    ]);
    await deleteDocuments();
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

      const document = await DocumentApp.createDocument(
        {
          uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
          name: 'myCsvFeed',
          description: 'description',
          short_description: 'short_description',
          slug: 'slug',
          active: true,
        },
        [
          { key: 'integration_type', value: IntegrationType.CsvFeed },
          { key: 'feed_url', value: 'https://example.com' },
        ],
        INTEGRATION_SERVICE_INSTANCE_ID,
        []
      );
      expect(document).toBeDefined();

      const documentId = document!.id;

      const telemetrySpy = vi
        .spyOn(telemetryApp, 'sendTelemetryEvent')
        .mockResolvedValue();

      await telemetryApp.sendOneClickDeployEvent({
        userId: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        input: {
          platform_identifier: PlatformIdentifier.Opencti,
          service_instance_id: toGlobalId(
            'ServiceInstance',
            SERVICES.INSTANCES.INTEGRATIONS.ID
          ),
          resource_id: toGlobalId('DocumentId', documentId),
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
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        organization_name: 'Filigran',
        organization_type: TelemetryOrganizationType.PROFESSIONAL,
        source: TELEMETRY_SOURCE,
        user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        service: TelemetryEventService.INTEGRATIONS_LIBRARY,
        service_type: TelemetryEventServiceType.CSV_FEEDS,
        resource_id: documentId,
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

      const document = await DocumentApp.createDocument(
        {
          uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
          name: 'myCsvFeed',
          description: 'description',
          short_description: 'short_description',
          slug: 'slug',
          active: true,
        },
        [
          { key: 'integration_type', value: IntegrationType.CsvFeed },
          { key: 'feed_url', value: 'https://example.com' },
        ],
        INTEGRATION_SERVICE_INSTANCE_ID,
        []
      );
      expect(document).toBeDefined();

      const documentId = document!.id;

      const telemetrySpy = vi
        .spyOn(telemetryApp, 'sendTelemetryEvent')
        .mockResolvedValue();

      await telemetryApp.sendOneClickDeployEvent({
        userId: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        input: {
          platform_identifier: PlatformIdentifier.Opencti,
          service_instance_id: toGlobalId(
            'ServiceInstance',
            SERVICES.INSTANCES.INTEGRATIONS.ID
          ),
          resource_id: toGlobalId('DocumentId', documentId),
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
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        organization_name: 'Filigran',
        organization_type: TelemetryOrganizationType.PROFESSIONAL,
        source: TELEMETRY_SOURCE,
        user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        service: TelemetryEventService.INTEGRATIONS_LIBRARY,
        service_type: TelemetryEventServiceType.CSV_FEEDS,
        resource_id: documentId,
        resource_title: 'CsvFeed Title',
        platform_id: platformId,
        platform_version: undefined,
        target_product: TelemetryTargetProduct.OPEN_CTI,
      });
    });
    it('should send a OneClickDeployEvent connectors with version', async () => {
      vi.useFakeTimers();
      const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
      vi.setSystemTime(date);
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
      const document = await DocumentApp.createDocument(
        {
          uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
          name: 'myCsvFeed',
          description: 'description',
          short_description: 'short_description',
          slug: 'slug',
          active: true,
        },
        [
          { key: 'integration_type', value: IntegrationType.CsvFeed },
          { key: 'feed_url', value: 'https://example.com' },
        ],
        INTEGRATION_SERVICE_INSTANCE_ID,
        []
      );
      expect(document).toBeDefined();

      const documentId = document!.id;

      const telemetrySpy = vi
        .spyOn(telemetryApp, 'sendTelemetryEvent')
        .mockResolvedValue();
      await telemetryApp.sendOneClickDeployEvent({
        userId: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        input: {
          platform_identifier: PlatformIdentifier.Opencti,
          service_instance_id: toGlobalId(
            'ServiceInstance',
            SERVICES.INSTANCES.INTEGRATIONS.ID
          ),
          resource_id: toGlobalId('DocumentId', documentId),
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
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        organization_name: 'Filigran',
        organization_type: TelemetryOrganizationType.PROFESSIONAL,
        source: TELEMETRY_SOURCE,
        user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        service: TelemetryEventService.INTEGRATIONS_LIBRARY,
        service_type: TelemetryEventServiceType.CSV_FEEDS,
        resource_id: documentId,
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
