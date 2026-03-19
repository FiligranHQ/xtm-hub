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
  DocumentImageType,
  DocumentSourceType,
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
import { DOCUMENT_IMAGE_METADATA_KEYS, DocumentImage } from './document.model';
import { DocumentChildrenDomain } from './domain/document.children.domain';
import { DocumentDomain } from './domain/document.domain';
import {
  DocumentMetadataDomain,
  DocumentMetadataKeys,
} from './domain/document.metadata.domain';
import {
  CUSTOM_DASHBOARD_METADATA_KEYS,
  OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
} from './opencti/custom-dashboards/custom-dashboards.model';
import {
  Connector,
  OPENCTI_INTEGRATION_DOCUMENT_TYPE,
  ThirdPartyIntegration,
} from './opencti/integrations/integrations.model';

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
      const call = DocumentApp.createDocument({
        input: documentData,
        metadata: [],
        serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
      });

      await expect(call).rejects.toThrow(ErrorCode.DocumentMissingMetadata);
    });

    it('should not throw when metadata is missing but optional', async () => {
      const result = await DocumentApp.createDocument({
        input: documentData,
        metadata: [
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
        serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
        document: mockUpload,
      });

      expect(result).toBeDefined();
    });

    it('should use document when file is provided', async () => {
      const createdDocument = await DocumentApp.createDocument({
        input: documentData,
        metadata: [
          {
            key: 'integration_type',
            value: IntegrationType.CsvFeed,
          },
        ],
        serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
        document: mockUpload,
      });

      expect(createdDocument).toBeDefined();
      expect(createdDocument!.file_name).toBe(minioFileMock.fileName);
      expect(createdDocument!.minio_name).toBe(minioFileMock.minioName);
      expect(createdDocument!.mime_type).toBe(minioFileMock.mimeType);
    });

    it('should not use document file when document is a third party integration', async () => {
      const createdDocument = await DocumentApp.createDocument({
        input: documentData,
        metadata: [
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
        serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
        document: mockUpload,
      });

      expect(createdDocument).toBeDefined();
      expect(createdDocument!.file_name).toBeNull();
      expect(createdDocument!.minio_name).toBeNull();
      expect(createdDocument!.mime_type).toBeNull();
    });

    it('should create children image and logo documents', async () => {
      const createdDocument = await DocumentApp.createDocument({
        input: documentData,
        metadata: [
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
        serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
        document: mockUpload,
        images: [mockUpload],
        logo: mockUpload,
      });

      expect(createdDocument).toBeDefined();

      const children: DocumentImage[] =
        (await DocumentChildrenDomain.loadChildrenDocuments(
          createdDocument!.id,
          DOCUMENT_IMAGE_METADATA_KEYS
        )) as unknown as DocumentImage[];

      expect(children.length).toBe(2);
      const image = children.find(
        (child) => child.image_type === DocumentImageType.Image
      );
      expect(image).toBeDefined();
      const logo = children.find(
        (child) => child.image_type === DocumentImageType.Logo
      );
      expect(logo).toBeDefined();
    });

    it('should send a create telemetry event when creating a document', async () => {
      vi.useFakeTimers();
      const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
      vi.setSystemTime(date);
      const telemetrySpy = vi
        .spyOn(telemetryApp, 'sendTelemetryEvent')
        .mockResolvedValue();

      await DocumentApp.createDocument({
        input: documentData,
        metadata: [{ key: 'product_version', value: '1.2.3' }],
        serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
        document: mockUpload,
      });
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
      const createdDocument = await DocumentApp.createDocument({
        input: documentData,
        metadata: [{ key: 'product_version', value: '1.2.3' }],
        serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
        document: mockUpload,
      });

      expect(createdDocument).toBeDefined();

      const call = DocumentApp.updateDocument({
        parentDocumentId: createdDocument!.id,
        serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
        metadata: [],
        input: documentData,
        existingImageIds: [],
      });

      await expect(call).rejects.toThrow(ErrorCode.DocumentMissingMetadata);
    });

    it('should not throw when metadata is missing but optional', async () => {
      const createdDocument = await DocumentApp.createDocument({
        input: documentData,
        metadata: [
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
        serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
        document: mockUpload,
      });

      expect(createdDocument).toBeDefined();

      const result = await DocumentApp.updateDocument({
        parentDocumentId: createdDocument!.id,
        serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
        metadata: [
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
        input: documentData,
        existingImageIds: [],
      });

      expect(result).toBeDefined();
    });

    it('should use first file for document when document is not a third party integration', async () => {
      const createdDocument = await DocumentApp.createDocument({
        input: documentData,
        metadata: [
          {
            key: 'integration_type',
            value: IntegrationType.CsvFeed,
          },
        ],
        serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
        document: mockUpload,
      });

      expect(createdDocument).toBeDefined();

      const result = await DocumentApp.updateDocument({
        parentDocumentId: createdDocument!.id,
        serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
        metadata: [
          {
            key: 'integration_type',
            value: IntegrationType.CsvFeed,
          },
        ],
        document: mockUpload,
        existingImageIds: [],
        input: documentData,
      });

      expect(result).toBeDefined();
      expect(result!.file_name).toBe(minioFileMock.fileName);
      expect(result!.minio_name).toBe(minioFileMock.minioName);
      expect(result!.mime_type).toBe(minioFileMock.mimeType);
    });

    it('should not use document file when document is a third party integration', async () => {
      const createdDocument = await DocumentApp.createDocument({
        input: documentData,
        metadata: [
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
        serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
      });

      expect(createdDocument).toBeDefined();

      const result = await DocumentApp.updateDocument({
        parentDocumentId: createdDocument!.id,
        serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
        metadata: [
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
        document: mockUpload,
        existingImageIds: [],
        input: documentData,
      });

      expect(result).toBeDefined();
      expect(result!.file_name).toBeNull();
      expect(result!.minio_name).toBeNull();
      expect(result!.mime_type).toBeNull();
    });

    it('should add a logo document when logo file is provided', async () => {
      const createdDocument = await DocumentApp.createDocument({
        input: documentData,
        metadata: [
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
        serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
      });

      expect(createdDocument).toBeDefined();

      const result = await DocumentApp.updateDocument({
        parentDocumentId: createdDocument!.id,
        serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
        metadata: [
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
        document: mockUpload,
        existingImageIds: [],
        input: documentData,
        logo: mockUpload,
      });

      const children = (await DocumentChildrenDomain.loadChildrenDocuments(
        result.id,
        DOCUMENT_IMAGE_METADATA_KEYS
      )) as unknown as DocumentImage[];

      const logo = children.find(
        (doc) => doc.image_type === DocumentImageType.Logo
      );
      expect(logo).toMatchObject({
        file_name: minioFileMock.fileName,
        minio_name: minioFileMock.minioName,
        mime_type: minioFileMock.mimeType,
      });
    });

    it.each`
      label          | integrationType              | integrationSubtype
      ${'CsvFeed'}   | ${IntegrationType.CsvFeed}   | ${null}
      ${'TaxiiFeed'} | ${IntegrationType.TaxiiFeed} | ${IntegrationSubType.Native}
      ${'Stream'}    | ${IntegrationType.Stream}    | ${IntegrationSubType.Native}
    `(
      'should preserve the existing feed_url when no document is uploaded for $label',
      async ({
        integrationType,
        integrationSubtype,
      }: {
        integrationType: IntegrationType;
        integrationSubtype: IntegrationSubType | null;
      }) => {
        const metadata = [
          { key: 'integration_type', value: integrationType },
          ...(integrationSubtype
            ? [{ key: 'integration_subtype', value: integrationSubtype }]
            : []),
        ];

        const createdDocument = await DocumentApp.createDocument({
          input: documentData,
          metadata,
          serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
          document: mockUpload,
        });
        expect(createdDocument).toBeDefined();

        const result = await DocumentApp.updateDocument({
          parentDocumentId: createdDocument!.id,
          serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
          metadata,
          input: documentData,
          existingImageIds: [],
        });

        expect(result).toBeDefined();
        const feedUrl = await DocumentMetadataDomain.loadMetadataValueByKey(
          result!.id,
          'feed_url'
        );
        expect(feedUrl).toBe('https://example.com');
      }
    );

    it.each`
      label          | integrationType              | integrationSubtype
      ${'CsvFeed'}   | ${IntegrationType.CsvFeed}   | ${null}
      ${'TaxiiFeed'} | ${IntegrationType.TaxiiFeed} | ${IntegrationSubType.Native}
      ${'Stream'}    | ${IntegrationType.Stream}    | ${IntegrationSubType.Native}
    `(
      'should preserve the existing feed_url when an image file is uploaded instead of a json file for $label',
      async ({
        integrationType,
        integrationSubtype,
      }: {
        integrationType: IntegrationType;
        integrationSubtype: IntegrationSubType | null;
      }) => {
        const metadata = [
          { key: 'integration_type', value: integrationType },
          ...(integrationSubtype
            ? [{ key: 'integration_subtype', value: integrationSubtype }]
            : []),
        ];

        const createdDocument = await DocumentApp.createDocument({
          input: documentData,
          metadata,
          serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
          document: mockUpload,
          images: [mockUpload],
        });
        expect(createdDocument).toBeDefined();

        vi.spyOn(MinIOClient, 'createFile').mockResolvedValue({
          minioName: 'imageFile',
          mimeType: 'image/png',
          fileName: 'image.png',
        });

        const result = await DocumentApp.updateDocument({
          parentDocumentId: createdDocument!.id,
          serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
          metadata,
          input: documentData,
          document: mockUpload,
          existingImageIds: [],
        });

        expect(result).toBeDefined();
        const feedUrl = await DocumentMetadataDomain.loadMetadataValueByKey(
          result!.id,
          'feed_url'
        );
        expect(feedUrl).toBe('https://example.com');
      }
    );

    it('should convert boolean metadata keys to booleans on update', async () => {
      // Create a Connector document with required metadata
      const connectorMetadata = [
        { key: 'integration_type', value: IntegrationType.Connector },
        { key: 'integration_subtype', value: 'native' },
        { key: 'product_version', value: '1.0.0' },
        { key: 'verified', value: 'false' },
        { key: 'manager_supported', value: 'false' },
        { key: 'playbook_supported', value: 'false' },
        { key: 'container_image', value: 'container_image_value' },
        { key: 'source_code', value: 'source_code_value' },
        { key: 'subscription_link', value: 'subscription_link_value' },
      ];
      const createdDocument = await DocumentApp.createDocument({
        input: documentData,
        metadata: connectorMetadata,
        serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
        document: mockUpload,
      });
      expect(createdDocument).toBeDefined();

      // Update with boolean metadata as strings
      const updatedMetadata = [
        { key: 'integration_type', value: IntegrationType.Connector },
        { key: 'integration_subtype', value: 'native' },
        { key: 'product_version', value: '2.0.0' },
        { key: 'verified', value: 'true' },
        { key: 'manager_supported', value: 'true' },
        { key: 'playbook_supported', value: 'false' },
        { key: 'container_image', value: 'container_image_value' },
        { key: 'source_code', value: 'source_code_value' },
        { key: 'subscription_link', value: 'subscription_link_value' },
      ];
      const result = await DocumentApp.updateDocument({
        parentDocumentId: createdDocument!.id,
        serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
        metadata: updatedMetadata,
        input: documentData,
        existingImageIds: [],
      });
      expect(result).toBeDefined();

      const updatedConnector = result as Connector;
      expect(updatedConnector.verified).toBe(true);
      expect(updatedConnector.manager_supported).toBe(true);
      expect(updatedConnector.playbook_supported).toBe(false);
      expect(updatedConnector.product_version).toBe('2.0.0');
    });
  });

  describe('loadDocument', () => {
    it('should return the document with elastic search counters', async () => {
      const document = await DocumentApp.createDocument({
        input: {
          uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
          name: 'myCustomDashboard',
          description: 'description',
          short_description: 'short_description',
          slug: 'slug',
          active: true,
        },
        metadata: [{ key: 'product_version', value: '1.2.3' }],
        serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
        document: mockUpload,
      });
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
      const document = await DocumentApp.createDocument({
        input: {
          uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
          name: 'myCustomDashboard',
          description: 'description',
          short_description: 'short_description',
          slug: 'slug',
          active: true,
        },
        metadata: [{ key: 'product_version', value: '1.2.3' }],
        serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
        document: mockUpload,
      });
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

  describe('upsertDocumentWithExternalImage', () => {
    const metadataKeys = [
      { key: 'integration_type', value: IntegrationType.ThirdPartyIntegration },
      { key: 'integration_subtype', value: IntegrationSubType.Orchestration },
      { key: 'vendor_url', value: 'https://example.com' },
    ] as unknown as DocumentMetadataKeys<ThirdPartyIntegration>;

    it('should create a new document with an external image', async () => {
      const input = {
        ...documentData,
        uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
      };
      const doc = await DocumentApp.upsertDocumentWithExternalImage(
        OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        input,
        mockUpload,
        metadataKeys
      );
      expect(doc).toBeDefined();
      expect(doc.id).toBeDefined();
      expect(doc.type).toBe(OPENCTI_INTEGRATION_DOCUMENT_TYPE);
      expect(doc.file_name).toBeNull();
      const children = await DocumentChildrenDomain.loadChildrenDocuments(
        doc.id
      );
      expect(children.length).toBe(1);
      expect(children[0]!.source_type).toBe(DocumentSourceType.External);
      expect(children[0]!.minio_name).toBe(minioFileMock.minioName);
    });

    it('should update an existing document and replace external image', async () => {
      // First create
      const input = {
        ...documentData,
        uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        slug: 'unique-slug',
      };
      const doc1 = await DocumentApp.upsertDocumentWithExternalImage(
        'integration',
        input,
        mockUpload,
        metadataKeys
      );
      // Update with new image
      const newFileUpload = {
        ...mockUpload,
        file: { ...mockFileUpload, filename: 'new-image.png' },
      };

      vi.spyOn(DocumentUploadsHelper, 'processUploads').mockResolvedValue([
        {
          ...minioFileMock,
          fileName: 'new-image.png',
        },
      ]);

      const doc2 = await DocumentApp.upsertDocumentWithExternalImage(
        'integration',
        input,
        newFileUpload,
        metadataKeys
      );
      expect(doc2.id).toBe(doc1.id);
      const children = await DocumentChildrenDomain.loadChildrenDocuments(
        doc2.id
      );
      expect(children.length).toBe(1);
      expect(children[0]!.source_type).toBe(DocumentSourceType.External);
      expect(children[0]!.file_name).toBe('new-image.png');
    });
  });
});
