import { MockInstance } from '@vitest/spy';
import config from 'config';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import portalConfig from '../../config';
import { esDbClient } from '../../thirdparty/elasticsearch/client';
import { PgBossProducer } from '../../thirdparty/pgboss/producer';
import { TELEMETRY_QUEUES } from '../../thirdparty/pgboss/telemetry.jobs';
import { logApp } from '../../utils/app-logger.util';
import { TelemetryApp } from './telemetry.app';
import {
  TelemetryEventService,
  TelemetryEventServiceType,
  TelemetryOrganizationType,
  TelemetrySource,
  TelemetryTargetProduct,
} from './telemetry.const';
import {
  LoginEvent,
  SubscribeEvent,
  TelemetryEventType,
} from './telemetry.types';

import { toGlobalId } from 'graphql-relay/node/node.js';
import { FileUpload } from 'graphql-upload/processRequest.mjs';
import { TestHelper } from '../../../tests/helper/test.helper';
import { SERVICES, TEST_ORGANIZATIONS } from '../../../tests/tests.const';
import {
  DocumentMetadataKeyCode,
  IntegrationType,
  PlatformConfigurationStatus,
  PlatformContract,
  PlatformIdentifier,
} from '../../__generated__/resolvers-types';
import type { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { DocumentApp } from '../document/document.app';
import { DocumentUploadsHelper } from '../document/document.uploads.helper';
import { ServiceInstanceDomain } from '../service/instance/service-instance.domain';
import { INTEGRATION_SERVICE_INSTANCE_ID } from '../shareable-resource/opencti/integration/integration.model';

vi.mock('config', async (importOriginal) => {
  const mod = await importOriginal<{ default: typeof config }>();
  return {
    default: {
      get: vi.fn(mod.default.get.bind(mod.default)),
      has: mod.default.has.bind(mod.default),
    },
  };
});

// The event pipeline stamps the durable hub instance identity on every
// event; pin it so assertions do not depend on the test database contents.
vi.mock('./telemetry-snapshot.domain', async (importOriginal) => {
  const mod =
    await importOriginal<typeof import('./telemetry-snapshot.domain')>();
  return {
    ...mod,
    loadInstanceIdentity: vi.fn().mockResolvedValue({
      instanceId: 'test-hub-instance-id',
      instanceCreation: '2026-01-01T00:00:00.000Z',
    }),
  };
});

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

describe('telemetryApp', () => {
  const minioFileMock = {
    minioName: 'minioFile',
    mimeType: 'mimeType',
    fileName: 'csvfilename',
  };

  const mockFileUpload: FileUpload = {
    filename: 'test-image.png',
    mimetype: 'image/png',
    encoding: '7bit',
    createReadStream: vi.fn(),
  };

  const mockUpload = {
    file: mockFileUpload,
    promise: Promise.resolve(mockFileUpload),
  };

  beforeEach(async () => {
    vi.spyOn(DocumentUploadsHelper, 'processUploads').mockResolvedValue([
      minioFileMock,
    ]);
    await TestHelper.document.delete({});
  });

  describe('getMostDeployedResourceIds', () => {
    it('should return resource ids ordered by deploy count desc', async () => {
      vi.spyOn(esDbClient, 'search').mockResolvedValue({
        hits: { hits: [], total: { value: 0, relation: 'eq' } },
        aggregations: {
          resource_counts: {
            buckets: [
              { key: 'resource-1', doc_count: 10 },
              { key: 'resource-2', doc_count: 7 },
              { key: 'resource-3', doc_count: 3 },
            ],
          },
        },
      } as never);

      const result = await TelemetryApp.getMostDeployedResourceIds(3);

      expect(result).toEqual(['resource-1', 'resource-2', 'resource-3']);
      expect(esDbClient.search).toHaveBeenCalledWith(
        expect.objectContaining({
          index: 'telemetry',
          size: 0,
          query: { term: { event_type: TelemetryEventType.ONE_CLICK_DEPLOY } },
          aggs: {
            resource_counts: {
              terms: {
                field: 'resource_id',
                size: 3,
                order: { _count: 'desc' },
              },
            },
          },
        })
      );
    });

    it('should return an empty array when there are no aggregations', async () => {
      vi.spyOn(esDbClient, 'search').mockResolvedValue({
        hits: { hits: [], total: { value: 0, relation: 'eq' } },
        aggregations: undefined,
      } as never);

      const result = await TelemetryApp.getMostDeployedResourceIds(5);

      expect(result).toEqual([]);
    });

    it('should return an empty array when buckets are empty', async () => {
      vi.spyOn(esDbClient, 'search').mockResolvedValue({
        hits: { hits: [], total: { value: 0, relation: 'eq' } },
        aggregations: {
          resource_counts: { buckets: [] },
        },
      } as never);

      const result = await TelemetryApp.getMostDeployedResourceIds(5);

      expect(result).toEqual([]);
    });

    it.each`
      platformIdentifiers                                         | expectedTargetProducts                                                | description
      ${[PlatformIdentifier.Opencti]}                             | ${[TelemetryTargetProduct.OPEN_CTI]}                                  | ${'single opencti filter'}
      ${[PlatformIdentifier.Openaev]}                             | ${[TelemetryTargetProduct.OPEN_AEV]}                                  | ${'single openaev filter'}
      ${[PlatformIdentifier.Opencti, PlatformIdentifier.Openaev]} | ${[TelemetryTargetProduct.OPEN_CTI, TelemetryTargetProduct.OPEN_AEV]} | ${'both platform identifiers'}
    `(
      'should filter by target_product when platformIdentifiers is provided ($description)',
      async ({
        platformIdentifiers,
        expectedTargetProducts,
      }: {
        platformIdentifiers: PlatformIdentifier[];
        expectedTargetProducts: TelemetryTargetProduct[];
      }) => {
        vi.spyOn(esDbClient, 'search').mockResolvedValue({
          hits: { hits: [], total: { value: 0, relation: 'eq' } },
          aggregations: {
            resource_counts: {
              buckets: [{ key: 'resource-1', doc_count: 5 }],
            },
          },
        } as never);

        const result = await TelemetryApp.getMostDeployedResourceIds(
          3,
          platformIdentifiers
        );

        expect(result).toEqual(['resource-1']);
        expect(esDbClient.search).toHaveBeenCalledWith(
          expect.objectContaining({
            index: 'telemetry',
            size: 0,
            query: {
              bool: {
                filter: [
                  {
                    term: {
                      event_type: TelemetryEventType.ONE_CLICK_DEPLOY,
                    },
                  },
                  { terms: { target_product: expectedTargetProducts } },
                ],
              },
            },
          })
        );
      }
    );

    it('should use unfiltered query when platformIdentifiers is an empty array', async () => {
      vi.spyOn(esDbClient, 'search').mockResolvedValue({
        hits: { hits: [], total: { value: 0, relation: 'eq' } },
        aggregations: {
          resource_counts: {
            buckets: [{ key: 'resource-1', doc_count: 5 }],
          },
        },
      } as never);

      await TelemetryApp.getMostDeployedResourceIds(3, []);

      expect(esDbClient.search).toHaveBeenCalledWith(
        expect.objectContaining({
          query: { term: { event_type: TelemetryEventType.ONE_CLICK_DEPLOY } },
        })
      );
    });
  });

  describe('sendOneClickDeployEvent', () => {
    it('should send a OneClickDeployEvent with version and with tenant_id', async () => {
      vi.useFakeTimers();
      const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
      vi.setSystemTime(date);
      const platform_id = '916121bf-d246-4a43-8522-24be19537b91';
      const platformServiceInstanceId = '5891d6cf-1737-48bb-8f60-de520a93f2bd';
      vi.spyOn(
        ServiceInstanceDomain,
        'loadPlatformConfigurationByServiceInstanceId'
      ).mockResolvedValue({
        service_instance_id: platformServiceInstanceId as ServiceInstanceId,
        token: '59dea7ba-b3b3-4b42-bb60-6326159dc937',
        platform_id: platform_id,
        platform_url: 'https://testing.oaev.staging.filigran.io/',
        registerer_id: '7de5c830-ed96-45ff-91a7-b384943a4620',
        platform_title: 'Open AEV Instance',
        platform_version: '1.0.0',
        platform_contract: PlatformContract.Ee,
        tenant_id: 'c4a88438-abf8-4a76-8594-6df800434865',
        tenant_name: 'tenant_name',
        status: PlatformConfigurationStatus.Active,
        last_connectivity_check: new Date(),
      });

      const document = await DocumentApp.createDocument({
        input: {
          uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
          name: 'myCsvFeed',
          description: 'description',
          short_description: 'short_description',
          slug: 'slug',
          active: true,
        },
        metadata: [
          {
            key: DocumentMetadataKeyCode.IntegrationType,
            value: IntegrationType.CsvFeed,
          },
          {
            key: DocumentMetadataKeyCode.FeedUrl,
            value: 'https://example.com',
          },
        ],
        serviceInstanceId: INTEGRATION_SERVICE_INSTANCE_ID,
        sourceDocument: mockUpload,
      });
      expect(document).toBeDefined();

      const documentId = document!.id;

      const telemetrySpy = vi
        .spyOn(TelemetryApp, 'sendTelemetryEvent')
        .mockResolvedValue();

      await TelemetryApp.sendOneClickDeployEvent({
        userId: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        input: {
          platform_identifier: PlatformIdentifier.Opencti,
          service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
          resource_id: documentId,
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
        source: TelemetrySource.XTMHUB,
        user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        service: TelemetryEventService.INTEGRATIONS_LIBRARY,
        service_type: TelemetryEventServiceType.CSV_FEEDS,
        resource_id: documentId,
        resource_title: 'CsvFeed Title',
        platform_id: platform_id,
        platform_version: '1.0.0',
        target_product: TelemetryTargetProduct.OPEN_CTI,
        tenant_id: 'c4a88438-abf8-4a76-8594-6df800434865',
      });

      const [deployment] = await TestHelper.oneClickDeployment.loadAll({
        resource_id: documentId,
      });
      expect(deployment).toBeDefined();
      expect(deployment.platform_id).toBe(platform_id);
      expect(deployment.tenant_id).toBe('c4a88438-abf8-4a76-8594-6df800434865');
      expect(deployment.user_id).toBe(
        TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID
      );
    });
    it('should send a OneClickDeployEvent without version and without tenant_id', async () => {
      vi.useFakeTimers();
      const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
      vi.setSystemTime(date);

      const platformId = '916121bf-d246-4a43-8522-24be19537b91';
      const platformServiceInstanceId = '5891d6cf-1737-48bb-8f60-de520a93f2bd';
      vi.spyOn(
        ServiceInstanceDomain,
        'loadPlatformConfigurationByServiceInstanceId'
      ).mockResolvedValue({
        service_instance_id: platformServiceInstanceId as ServiceInstanceId,
        token: '59dea7ba-b3b3-4b42-bb60-6326159dc937',
        platform_id: platformId,
        platform_url: 'https://testing.oaev.staging.filigran.io/',
        registerer_id: '7de5c830-ed96-45ff-91a7-b384943a4620',
        platform_title: 'Open AEV Instance',
        platform_contract: PlatformContract.Ee,
        tenant_id: null,
        tenant_name: null,
        platform_version: null,
        status: PlatformConfigurationStatus.Active,
        last_connectivity_check: new Date(),
      });

      const document = await DocumentApp.createDocument({
        input: {
          uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
          name: 'myCsvFeed',
          description: 'description',
          short_description: 'short_description',
          slug: 'slug',
          active: true,
        },
        metadata: [
          {
            key: DocumentMetadataKeyCode.IntegrationType,
            value: IntegrationType.CsvFeed,
          },
          {
            key: DocumentMetadataKeyCode.FeedUrl,
            value: 'https://example.com',
          },
        ],
        serviceInstanceId: INTEGRATION_SERVICE_INSTANCE_ID,
        sourceDocument: mockUpload,
      });
      expect(document).toBeDefined();

      const documentId = document!.id;

      const telemetrySpy = vi
        .spyOn(TelemetryApp, 'sendTelemetryEvent')
        .mockResolvedValue();

      await TelemetryApp.sendOneClickDeployEvent({
        userId: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        input: {
          platform_identifier: PlatformIdentifier.Opencti,
          service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
          resource_id: documentId,
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
        source: TelemetrySource.XTMHUB,
        user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        service: TelemetryEventService.INTEGRATIONS_LIBRARY,
        service_type: TelemetryEventServiceType.CSV_FEEDS,
        resource_id: documentId,
        resource_title: 'CsvFeed Title',
        platform_id: platformId,
        platform_version: undefined,
        tenant_id: undefined,
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
        ServiceInstanceDomain,
        'loadPlatformConfigurationByServiceInstanceId'
      ).mockResolvedValue({
        service_instance_id: platformServiceInstanceId as ServiceInstanceId,
        token: '59dea7ba-b3b3-4b42-bb60-6326159dc937',
        platform_id: platform_id,
        platform_url: 'https://testing.oaev.staging.filigran.io/',
        registerer_id: '7de5c830-ed96-45ff-91a7-b384943a4620',
        platform_title: 'Open AEV Instance',
        platform_contract: PlatformContract.Ee,
        tenant_name: null,
        tenant_id: null,
        platform_version: '1.0.0',
        status: PlatformConfigurationStatus.Active,
        last_connectivity_check: new Date(),
      });
      const document = await DocumentApp.createDocument({
        input: {
          uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
          name: 'myCsvFeed',
          description: 'description',
          short_description: 'short_description',
          slug: 'slug',
          active: true,
        },
        metadata: [
          {
            key: DocumentMetadataKeyCode.IntegrationType,
            value: IntegrationType.CsvFeed,
          },
          {
            key: DocumentMetadataKeyCode.FeedUrl,
            value: 'https://example.com',
          },
        ],
        serviceInstanceId: INTEGRATION_SERVICE_INSTANCE_ID,
        sourceDocument: mockUpload,
      });
      expect(document).toBeDefined();

      const documentId = document!.id;

      const telemetrySpy = vi
        .spyOn(TelemetryApp, 'sendTelemetryEvent')
        .mockResolvedValue();
      await TelemetryApp.sendOneClickDeployEvent({
        userId: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        input: {
          platform_identifier: PlatformIdentifier.Opencti,
          service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
          resource_id: documentId,
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
        source: TelemetrySource.XTMHUB,
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

  describe('sendTelemetryEvent', () => {
    let realConfigGet: typeof config.get;

    beforeAll(() => {
      realConfigGet = vi
        .mocked(config.get)
        .getMockImplementation() as typeof config.get;
    });
    let pgBossSendSpy: MockInstance;
    let indexSpy: MockInstance;
    let logSpy: MockInstance;

    const loginEvent: LoginEvent = {
      event_type: TelemetryEventType.LOGIN,
      organization_id: 'fakeOrgId',
      organization_name: 'fakeOrgName',
      organization_type: TelemetryOrganizationType.PROFESSIONAL,
      user_id: 'fakeUserId',
      '@timestamp': new Date().toISOString(),
      source: TelemetrySource.XTMHUB,
    };

    const subscribeEvent: SubscribeEvent = {
      event_type: TelemetryEventType.SUBSCRIBE,
      organization_id: 'fakeOrgId',
      organization_name: 'fakeOrgName',
      organization_type: TelemetryOrganizationType.PROFESSIONAL,
      user_id: 'fakeUserId',
      '@timestamp': new Date().toISOString(),
      source: TelemetrySource.XTMHUB,
      service: TelemetryEventService.INTEGRATIONS_LIBRARY,
    };

    // sendTelemetryEvent stamps the hub identity before enqueueing/indexing.
    const hubIdentity = {
      hub_instance_id: 'test-hub-instance-id',
      hub_environment: portalConfig.environment,
    };
    const enrichedLoginEvent = { ...loginEvent, ...hubIdentity };
    const enrichedSubscribeEvent = { ...subscribeEvent, ...hubIdentity };

    describe('when queue processing is disabled', () => {
      beforeEach(() => {
        indexSpy = vi
          .spyOn(esDbClient, 'index')
          .mockResolvedValue(mockWriteResponse);
        pgBossSendSpy = vi
          .spyOn(PgBossProducer, 'send')
          .mockResolvedValue('job-id');
        vi.mocked(config.get).mockImplementation((key: string) => {
          if (key === 'telemetry_use_queue_processing') return false;
          if (key === 'telemetry_queued_event_types') return [];
          return realConfigGet(key);
        });
      });

      it('should send directly to Elasticsearch', async () => {
        await TelemetryApp.sendTelemetryEvent(loginEvent);

        expect(indexSpy).toHaveBeenCalledExactlyOnceWith({
          index: 'telemetry',
          document: enrichedLoginEvent,
        });
        expect(pgBossSendSpy).not.toHaveBeenCalled();
      });

      it('should not throw if there is an error but log an error', async () => {
        indexSpy.mockRejectedValue(new Error('Connection failed'));
        const logErrorSpy = vi.spyOn(logApp, 'error');

        await TelemetryApp.sendTelemetryEvent(loginEvent);
        await Promise.resolve();
        expect(logErrorSpy).toHaveBeenCalledOnce();
        expect(pgBossSendSpy).not.toHaveBeenCalled();
      });
    });

    describe('when queue processing is enabled with empty event types list', () => {
      beforeEach(() => {
        indexSpy = vi
          .spyOn(esDbClient, 'index')
          .mockResolvedValue(mockWriteResponse);
        pgBossSendSpy = vi
          .spyOn(PgBossProducer, 'send')
          .mockResolvedValue('job-id');
        logSpy = vi.spyOn(logApp, 'error');
        vi.mocked(config.get).mockImplementation((key: string) => {
          if (key === 'telemetry_use_queue_processing') return true;
          if (key === 'telemetry_queued_event_types') return [];
          return realConfigGet(key);
        });
      });

      it('should enqueue all events via PgBossProducer', async () => {
        await TelemetryApp.sendTelemetryEvent(loginEvent);

        expect(pgBossSendSpy).toHaveBeenCalledExactlyOnceWith(
          TELEMETRY_QUEUES.EVENTS,
          { event: enrichedLoginEvent }
        );
        expect(indexSpy).not.toHaveBeenCalled();
      });

      it('should enqueue any event type when list is empty', async () => {
        await TelemetryApp.sendTelemetryEvent(subscribeEvent);

        expect(pgBossSendSpy).toHaveBeenCalledExactlyOnceWith(
          TELEMETRY_QUEUES.EVENTS,
          { event: enrichedSubscribeEvent }
        );
        expect(indexSpy).not.toHaveBeenCalled();
      });

      it('should log error when PgBossProducer.send fails', async () => {
        const sendError = new Error('PgBoss connection lost');
        pgBossSendSpy.mockRejectedValue(sendError);

        await TelemetryApp.sendTelemetryEvent(loginEvent);

        expect(logSpy).toHaveBeenCalledWith(
          'Failed to enqueue telemetry event',
          { event: enrichedLoginEvent, error: sendError }
        );
        expect(indexSpy).not.toHaveBeenCalled();
      });
    });

    describe('when queue processing is enabled with specific event types', () => {
      beforeEach(() => {
        indexSpy = vi
          .spyOn(esDbClient, 'index')
          .mockResolvedValue(mockWriteResponse);
        pgBossSendSpy = vi
          .spyOn(PgBossProducer, 'send')
          .mockResolvedValue('job-id');
        vi.mocked(config.get).mockImplementation((key: string) => {
          if (key === 'telemetry_use_queue_processing') return true;
          if (key === 'telemetry_queued_event_types')
            return [TelemetryEventType.LOGIN];
          return realConfigGet(key);
        });
      });

      it('should enqueue events whose type is in the list', async () => {
        await TelemetryApp.sendTelemetryEvent(loginEvent);

        expect(pgBossSendSpy).toHaveBeenCalledExactlyOnceWith(
          TELEMETRY_QUEUES.EVENTS,
          { event: enrichedLoginEvent }
        );
        expect(indexSpy).not.toHaveBeenCalled();
      });

      it('should send directly to ES for events not in the list', async () => {
        await TelemetryApp.sendTelemetryEvent(subscribeEvent);

        expect(indexSpy).toHaveBeenCalledExactlyOnceWith({
          index: 'telemetry',
          document: enrichedSubscribeEvent,
        });
        expect(pgBossSendSpy).not.toHaveBeenCalled();
      });
    });
  });

  afterEach(async () => {
    vi.useRealTimers();
  });
});
