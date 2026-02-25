import { FileUpload } from 'graphql-upload/processRequest.mjs';
import { v4 as uuidv4 } from 'uuid';
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { SERVICES, TEST_ORGANIZATIONS } from '../../../../tests/tests.const';
import {
  IntegrationSubType,
  IntegrationType,
  QueryPublicDocumentsArgs,
  ServiceDefinitionIdentifier,
} from '../../../__generated__/resolvers-types';
import ServiceDefinition from '../../../model/kanel/public/ServiceDefinition';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { MinIOClient } from '../../../thirdparty/minio/client';
import { ErrorCode } from '../../../utils/error/error.code';
import { telemetryApp } from '../../telemetry/telemetry.app';
import {
  TELEMETRY_SOURCE,
  TelemetryEventService,
} from '../../telemetry/telemetry.const';
import { TelemetryEventType } from '../../telemetry/telemetry.types';
import { ServiceDefinitionDomain } from '../definition/service-definition.domain';
import * as DocumentUploadsHelper from '../document/document.uploads.helper';
import { DocumentApp } from './document.app';
import { deleteDocuments } from './document.helper';
import { DocumentDomain } from './domain/document.domain';
import {
  CUSTOM_DASHBOARD_METADATA_KEYS,
  OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
} from './opencti/custom-dashboards/custom-dashboards.model';

describe('DocumentApp', () => {
  const minioFileMock = {
    minioName: 'minioFile',
    mimeType: 'mimeType',
    fileName: 'csvfilename',
    jsonContent: { configuration: { uri: 'https://example.com' } },
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

  const documentData = {
    short_description: 'short_description',
    slug: 'slug',
    uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
    name: 'name',
    description: 'description',
    active: true,
  };

  beforeEach(() => {
    vi.spyOn(DocumentUploadsHelper, 'processUploads').mockResolvedValue([
      minioFileMock,
    ]);
    vi.spyOn(MinIOClient, 'createFile').mockResolvedValue(minioFileMock);
    vi.spyOn(MinIOClient, 'deleteFile').mockResolvedValue();
  });

  afterEach(async () => {
    await deleteDocuments();
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    vi.useRealTimers();
  });

  describe('createDocument', () => {
    it('should throw when metadata is missing', async () => {
      const call = DocumentApp.createDocument(
        documentData,
        [],
        SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID as ServiceInstanceId,
        []
      );

      await expect(call).rejects.toThrow(ErrorCode.DocumentMissingMetadata);
    });

    it('should not throw when metadata is missing but optional', async () => {
      const result = await DocumentApp.createDocument(
        documentData,
        [
          {
            key: 'integration_type',
            value: IntegrationType.ThirdPartyIntegration,
          },
          {
            key: 'integration_subtype',
            value: IntegrationSubType.Orchestration,
          },
          {
            key: 'vendor_url',
            value: 'https://example.com',
          },
        ],
        SERVICES.INSTANCES.INTEGRATIONS.ID,
        []
      );

      expect(result).toBeDefined();
    });

    it('should use first file for document when document is not a third party integration', async () => {
      const createdDocument = await DocumentApp.createDocument(
        documentData,
        [
          {
            key: 'integration_type',
            value: IntegrationType.CsvFeed,
          },
        ],
        SERVICES.INSTANCES.INTEGRATIONS.ID,
        [mockUpload]
      );

      expect(createdDocument).toBeDefined();
      expect(createdDocument!.file_name).toBe(minioFileMock.fileName);
      expect(createdDocument!.minio_name).toBe(minioFileMock.minioName);
      expect(createdDocument!.mime_type).toBe(minioFileMock.mimeType);
    });

    it('should not use first file for document when document is a third party integration', async () => {
      const createdDocument = await DocumentApp.createDocument(
        documentData,
        [
          {
            key: 'integration_type',
            value: IntegrationType.ThirdPartyIntegration,
          },
          {
            key: 'integration_subtype',
            value: IntegrationSubType.Orchestration,
          },
          {
            key: 'vendor_url',
            value: 'https://example.com',
          },
        ],
        SERVICES.INSTANCES.INTEGRATIONS.ID,
        [mockUpload]
      );

      expect(createdDocument).toBeDefined();
      expect(createdDocument!.file_name).toBeNull();
      expect(createdDocument!.minio_name).toBeNull();
      expect(createdDocument!.mime_type).toBeNull();
    });

    it('should send a create telemetry event when creating a document', async () => {
      vi.useFakeTimers();
      const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
      vi.setSystemTime(date);
      const telemetrySpy = vi
        .spyOn(telemetryApp, 'sendTelemetryEvent')
        .mockResolvedValue();

      await DocumentApp.createDocument(
        documentData,
        [{ key: 'product_version', value: '1.2.3' }],
        SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID as ServiceInstanceId,
        []
      );
      expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
        '@timestamp': '2025-02-03T13:12:15.000Z',
        event_type: TelemetryEventType.CREATE,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        organization_name: TEST_ORGANIZATIONS.FILIGRAN.NAME,
        organization_type: 'Professional',
        source: TELEMETRY_SOURCE,
        user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        service: TelemetryEventService.CUSTOM_DASHBOARDS_LIBRARY,
        resource_id: expect.any(String),
        resource_title: documentData.name,
        status: 'published',
        service_type: undefined,
      });
    });
  });

  describe('updateDocument', () => {
    it('should throw when metadata is missing', async () => {
      const createdDocument = await DocumentApp.createDocument(
        documentData,
        [{ key: 'product_version', value: '1.2.3' }],
        SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID as ServiceInstanceId,
        []
      );

      expect(createdDocument).toBeDefined();

      const call = DocumentApp.updateDocument(
        createdDocument!.id,
        SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID as ServiceInstanceId,
        [],
        {
          document: [],
          input: documentData,
          updateDocument: true,
          images: [],
        }
      );

      await expect(call).rejects.toThrow(ErrorCode.DocumentMissingMetadata);
    });

    it('should not throw when metadata is missing but optional', async () => {
      const createdDocument = await DocumentApp.createDocument(
        documentData,
        [
          {
            key: 'integration_type',
            value: IntegrationType.ThirdPartyIntegration,
          },
          {
            key: 'integration_subtype',
            value: IntegrationSubType.Orchestration,
          },
          {
            key: 'vendor_url',
            value: 'https://example.com',
          },
        ],
        SERVICES.INSTANCES.INTEGRATIONS.ID,
        []
      );

      expect(createdDocument).toBeDefined();

      const result = await DocumentApp.updateDocument(
        createdDocument!.id,
        SERVICES.INSTANCES.INTEGRATIONS.ID,
        [
          {
            key: 'integration_type',
            value: IntegrationType.ThirdPartyIntegration,
          },
          {
            key: 'integration_subtype',
            value: IntegrationSubType.Orchestration,
          },
          {
            key: 'vendor_url',
            value: 'https://example.com',
          },
        ],
        {
          input: documentData,
          document: [],
          updateDocument: true,
          images: [],
        }
      );

      expect(result).toBeDefined();
    });

    it('should use first file for document when document is not a third party integration', async () => {
      const createdDocument = await DocumentApp.createDocument(
        documentData,
        [
          {
            key: 'integration_type',
            value: IntegrationType.CsvFeed,
          },
        ],
        SERVICES.INSTANCES.INTEGRATIONS.ID,
        [mockUpload]
      );

      expect(createdDocument).toBeDefined();

      const result = await DocumentApp.updateDocument(
        createdDocument!.id,
        SERVICES.INSTANCES.INTEGRATIONS.ID,
        [
          {
            key: 'integration_type',
            value: IntegrationType.CsvFeed,
          },
        ],
        {
          input: documentData,
          document: [mockUpload],
          updateDocument: true,
          images: [],
        }
      );

      expect(result).toBeDefined();
      expect(result!.file_name).toBe(minioFileMock.fileName);
      expect(result!.minio_name).toBe(minioFileMock.minioName);
      expect(result!.mime_type).toBe(minioFileMock.mimeType);
    });

    it('should not use first file for document when document is a third party integration', async () => {
      const createdDocument = await DocumentApp.createDocument(
        documentData,
        [
          {
            key: 'integration_type',
            value: IntegrationType.ThirdPartyIntegration,
          },
          {
            key: 'integration_subtype',
            value: IntegrationSubType.Orchestration,
          },
          {
            key: 'vendor_url',
            value: 'https://example.com',
          },
        ],
        SERVICES.INSTANCES.INTEGRATIONS.ID,
        []
      );

      expect(createdDocument).toBeDefined();

      const result = await DocumentApp.updateDocument(
        createdDocument!.id,
        SERVICES.INSTANCES.INTEGRATIONS.ID,
        [
          {
            key: 'integration_type',
            value: IntegrationType.ThirdPartyIntegration,
          },
          {
            key: 'integration_subtype',
            value: IntegrationSubType.Orchestration,
          },
          {
            key: 'vendor_url',
            value: 'https://example.com',
          },
        ],
        {
          input: documentData,
          document: [mockUpload],
          updateDocument: true,
          images: [],
        }
      );

      expect(result).toBeDefined();
      expect(result!.file_name).toBeNull();
      expect(result!.minio_name).toBeNull();
      expect(result!.mime_type).toBeNull();
    });
  });

  describe('loadDocument', () => {
    it('should return the document with elastic search counters', async () => {
      const document = await DocumentApp.createDocument(
        {
          uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
          name: 'myCustomDashboard',
          description: 'description',
          short_description: 'short_description',
          slug: 'slug',
          active: true,
        },
        [{ key: 'product_version', value: '1.2.3' }],
        SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
        []
      );
      expect(document).toBeDefined();

      const documentId = document!.id;

      vi.spyOn(telemetryApp, 'countEventsByDocumentId').mockImplementation(
        async (eventType: TelemetryEventType, calledDocumentId: string) => {
          if (
            calledDocumentId === documentId &&
            eventType === TelemetryEventType.DOWNLOAD
          )
            return 5;
          if (
            calledDocumentId === documentId &&
            eventType === TelemetryEventType.SHARE
          )
            return 12;
          return 0; // default
        }
      );

      const documentLoaded = await DocumentApp.loadDocument(documentId);

      expect(documentLoaded.download_number).toBe(5);
      expect(documentLoaded.share_number).toBe(12);
    });
  });

  describe('loadPublicDocumentBySlug', () => {
    it('should throw when service definition is not found', async () => {
      const call = DocumentApp.loadPublicDocumentBySlug(
        uuidv4() as ServiceInstanceId,
        'slug'
      );

      await expect(call).rejects.toThrow(ErrorCode.ServiceDefinitionNotFound);
    });

    it('should return the document with elastic search counters', async () => {
      const document = await DocumentApp.createDocument(
        {
          uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
          name: 'myCustomDashboard',
          description: 'description',
          short_description: 'short_description',
          slug: 'slug',
          active: true,
        },
        [{ key: 'product_version', value: '1.2.3' }],
        SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
        []
      );
      expect(document).toBeDefined();

      const documentId = document!.id;

      vi.spyOn(telemetryApp, 'countEventsByDocumentId').mockImplementation(
        async (eventType: TelemetryEventType, calledDocumentId: string) => {
          if (
            calledDocumentId === documentId &&
            eventType === TelemetryEventType.DOWNLOAD
          )
            return 5;
          if (
            calledDocumentId === documentId &&
            eventType === TelemetryEventType.SHARE
          )
            return 12;
          return 0; // default
        }
      );

      const documentLoaded = await DocumentApp.loadPublicDocumentBySlug(
        SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
        document!.slug!
      );

      expect(documentLoaded.download_number).toBe(5);
      expect(documentLoaded.share_number).toBe(12);
    });
  });

  describe('loadPublicDocumentsByServiceSlug', () => {
    it('should throw when service definition is not found', async () => {
      const call = DocumentApp.loadPublicDocumentsByServiceSlug('unknown-slug');

      await expect(call).rejects.toThrow(ErrorCode.ServiceDefinitionNotFound);
    });

    it('should return the documents', async () => {
      const loadSeoDocumentsByServiceSlugSpy = vi
        .spyOn(DocumentDomain, 'loadSeoDocumentsByServiceSlug')
        .mockResolvedValue([{}]);

      const loadedDocuments =
        await DocumentApp.loadPublicDocumentsByServiceSlug(
          SERVICES.INSTANCES.CUSTOM_DASHBOARDS.SLUG
        );

      expect(loadSeoDocumentsByServiceSlugSpy).toHaveBeenCalledWith(
        OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
        SERVICES.INSTANCES.CUSTOM_DASHBOARDS.SLUG,
        CUSTOM_DASHBOARD_METADATA_KEYS
      );
      expect(loadedDocuments).toBeDefined();
      expect(loadedDocuments.length).toBe(1);
    });
  });

  describe('loadPublicDocuments', () => {
    it('should throw if service definition is not found', async () => {
      vi.spyOn(
        ServiceDefinitionDomain,
        'loadServiceDefinitionByServiceInstance'
      ).mockResolvedValue(undefined);
      const input = { serviceInstanceId: 'invalid-id', slug: 'test-slug' };
      const call = DocumentApp.loadPublicDocuments(
        input as QueryPublicDocumentsArgs
      );
      await expect(call).rejects.toThrow(ErrorCode.ServiceDefinitionNotFound);
    });

    it('should call DocumentDomain.loadPaginatedSeoDocumentsByServiceSlug with correct params', async () => {
      const mockServiceDefinition = {
        identifier: ServiceDefinitionIdentifier.OpenctiCustomDashboards,
      };
      vi.spyOn(
        ServiceDefinitionDomain,
        'loadServiceDefinitionByServiceInstance'
      ).mockResolvedValue(mockServiceDefinition as ServiceDefinition);
      const loadPaginatedSeoDocumentsSpy = vi
        .spyOn(DocumentDomain, 'loadPaginatedSeoDocumentsByServiceSlug')
        .mockResolvedValue({
          edges: [],
          pageInfo: { hasNextPage: false, hasPreviousPage: false },
          totalCount: 0,
        });
      const input = {
        serviceInstanceId: 'valid-id',
        slug: 'test-slug',
        page: 1,
        pageSize: 10,
      };

      await DocumentApp.loadPublicDocuments(
        input as unknown as QueryPublicDocumentsArgs
      );

      expect(loadPaginatedSeoDocumentsSpy).toHaveBeenCalledWith(
        'opencti_custom_dashboard',
        'test-slug',
        { page: 1, pageSize: 10, serviceInstanceId: 'valid-id' },
        ['product_version']
      );
    });
  });
});
