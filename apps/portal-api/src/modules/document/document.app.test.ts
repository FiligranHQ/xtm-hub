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
import { TestHelper } from '../../../tests/test.helper';
import { SERVICES, TEST_ORGANIZATIONS } from '../../../tests/tests.const';
import {
  DocumentImageType,
  DocumentMetadataKeyCode,
  DocumentSourceType,
  IntegrationSubType,
  IntegrationType,
  QueryPublicDocumentsArgs,
  ServiceDefinitionIdentifier,
} from '../../__generated__/resolvers-types';
import Document from '../../model/kanel/public/Document';
import ServiceDefinition from '../../model/kanel/public/ServiceDefinition';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { MinIOClient } from '../../thirdparty/minio/client';
import { ErrorCode } from '../../utils/error/error.code';
import * as DocumentUploadsHelper from '../document/document.uploads.helper';
import { ServiceDefinitionDomain } from '../services/definition/service-definition.domain';
import { telemetryApp } from '../telemetry/telemetry.app';
import {
  TelemetryEventService,
  TelemetrySource,
} from '../telemetry/telemetry.const';
import { TelemetryEventType } from '../telemetry/telemetry.types';
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

  const integrationMetadata = [
    {
      key: DocumentMetadataKeyCode.IntegrationType,
      value: IntegrationType.ThirdPartyIntegration,
    },
    {
      key: DocumentMetadataKeyCode.IntegrationSubtype,
      value: IntegrationSubType.Orchestration,
    },
    {
      key: DocumentMetadataKeyCode.VendorUrl,
      value: 'https://example.com',
    },
  ];

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
      // When
      const call = DocumentApp.createDocument({
        input: documentData,
        metadata: [],
        serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
      });

      // Then
      await expect(call).rejects.toThrow(ErrorCode.DocumentMissingMetadata);
    });

    it('should throw when serviceDefinition is not found', async () => {
      // Given
      vi.spyOn(
        ServiceDefinitionDomain,
        'loadServiceDefinitionByServiceInstance'
      ).mockResolvedValue(undefined);

      // When
      const call = DocumentApp.createDocument({
        input: documentData,
        metadata: integrationMetadata,
        serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
      });

      // Then
      await expect(call).rejects.toThrow(ErrorCode.ServiceDefinitionNotFound);
    });

    it('should create document with metadata', async () => {
      // When
      const result = await DocumentApp.createDocument({
        input: documentData,
        metadata: integrationMetadata,
        serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
        sourceDocument: mockUpload,
      });

      // Then
      expect(result).toMatchObject({
        ...documentData,
        integration_type: IntegrationType.ThirdPartyIntegration,
        integration_subtype: IntegrationSubType.Orchestration,
        vendor_url: 'https://example.com',
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
      });
    });

    it('should not use document file when document is a third party integration', async () => {
      // When
      const createdDocument = await DocumentApp.createDocument({
        input: documentData,
        metadata: integrationMetadata,
        serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
        sourceDocument: mockUpload,
      });

      // Then
      expect(createdDocument).toMatchObject({
        file_name: null,
        minio_name: null,
        mime_type: null,
      });
    });

    it('should create children image and logo documents', async () => {
      // When
      const createdDocument = await DocumentApp.createDocument({
        input: documentData,
        metadata: integrationMetadata,
        serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
        sourceDocument: mockUpload,
        images: [mockUpload],
        logo: mockUpload,
      });

      const children: DocumentImage[] =
        (await DocumentChildrenDomain.loadChildrenDocuments(
          createdDocument!.id,
          DOCUMENT_IMAGE_METADATA_KEYS
        )) as unknown as DocumentImage[];

      const image = children.find(
        (child) => child.image_type === DocumentImageType.Image
      );
      const logo = children.find(
        (child) => child.image_type === DocumentImageType.Logo
      );

      // Then
      expect(children.length).toBe(2);
      expect(createdDocument).toBeDefined();
      expect(image).toBeDefined();
      expect(logo).toBeDefined();
    });

    it('should send a create telemetry event when creating a document', async () => {
      // Given
      vi.useFakeTimers();
      const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
      vi.setSystemTime(date);
      const telemetrySpy = vi
        .spyOn(telemetryApp, 'sendTelemetryEvent')
        .mockResolvedValue();

      // When
      await DocumentApp.createDocument({
        input: documentData,
        metadata: [
          { key: DocumentMetadataKeyCode.ProductVersion, value: '1.2.3' },
        ],
        serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
        sourceDocument: mockUpload,
      });

      // Then
      expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
        '@timestamp': '2025-02-03T13:12:15.000Z',
        event_type: TelemetryEventType.CREATE,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        organization_name: TEST_ORGANIZATIONS.FILIGRAN.NAME,
        organization_type: 'Professional',
        source: TelemetrySource.XTMHUB,
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
    let createdDocument: Document | undefined;
    beforeEach(async () => {
      await TestHelper.document.delete({});
      createdDocument = await DocumentApp.createDocument({
        input: documentData,
        metadata: integrationMetadata,
        serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
      });
    });
    it('should throw when metadata is missing', async () => {
      // When
      const call = DocumentApp.updateDocument({
        parentDocumentId: createdDocument!.id,
        serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
        metadata: [],
        input: documentData,
        existingImageIds: [],
      });

      // Then
      await expect(call).rejects.toThrow(ErrorCode.DocumentMissingMetadata);
    });

    it('should throw when serviceDefinition is not found', async () => {
      // Given
      vi.spyOn(
        ServiceDefinitionDomain,
        'loadServiceDefinitionByServiceInstance'
      ).mockResolvedValue(undefined);

      // When
      const call = DocumentApp.updateDocument({
        parentDocumentId: createdDocument!.id,
        serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
        metadata: integrationMetadata,
        input: documentData,
        existingImageIds: [],
      });

      // Then
      await expect(call).rejects.toThrow(ErrorCode.ServiceDefinitionNotFound);
    });

    it('should return fields when metadata is missing but optional', async () => {
      // When
      const result = await DocumentApp.updateDocument({
        parentDocumentId: createdDocument!.id,
        serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
        metadata: [
          {
            key: DocumentMetadataKeyCode.IntegrationType,
            value: IntegrationType.ThirdPartyIntegration,
          },
          {
            key: DocumentMetadataKeyCode.IntegrationSubtype,
            value: IntegrationSubType.Orchestration,
          },
          {
            key: DocumentMetadataKeyCode.VendorUrl,
            value: 'https://changed.com',
          },
        ],
        input: documentData,
        existingImageIds: [],
      });

      // Then
      expect(result).toMatchObject({
        short_description: 'short_description',
        vendor_url: 'https://changed.com',
      });
    });

    it('should use first file for document when document is not a third party integration', async () => {
      // When
      const result = await DocumentApp.updateDocument({
        parentDocumentId: createdDocument!.id,
        serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
        metadata: [
          {
            key: DocumentMetadataKeyCode.IntegrationType,
            value: IntegrationType.CsvFeed,
          },
        ],
        sourceDocument: mockUpload,
        existingImageIds: [],
        input: documentData,
      });

      // Then
      expect(result).toMatchObject({
        file_name: minioFileMock.fileName,
        minio_name: minioFileMock.minioName,
        mime_type: minioFileMock.mimeType,
      });
    });

    it('should not use document file when document is a third party integration', async () => {
      // When
      const result = await DocumentApp.updateDocument({
        parentDocumentId: createdDocument!.id,
        serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
        metadata: integrationMetadata,
        sourceDocument: mockUpload,
        existingImageIds: [],
        input: documentData,
      });

      // Then
      expect(result).toMatchObject({
        file_name: null,
        minio_name: null,
        mime_type: null,
      });
    });

    it('should add a logo document when logo file is provided', async () => {
      // When
      const result = await DocumentApp.updateDocument({
        parentDocumentId: createdDocument!.id,
        serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
        metadata: integrationMetadata,
        sourceDocument: mockUpload,
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

      // Then
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
        // Given
        const metadata = [
          {
            key: DocumentMetadataKeyCode.IntegrationType,
            value: integrationType,
          },
          ...(integrationSubtype
            ? [
                {
                  key: DocumentMetadataKeyCode.IntegrationSubtype,
                  value: integrationSubtype,
                },
              ]
            : []),
        ];

        // When
        const result = await DocumentApp.updateDocument({
          parentDocumentId: createdDocument!.id,
          serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
          metadata,
          input: documentData,
          existingImageIds: [],
        });

        const feedUrlFromDb =
          await DocumentMetadataDomain.loadMetadataValueByKey(
            result!.id,
            DocumentMetadataKeyCode.FeedUrl
          );
        // Then
        expect(result).toMatchObject({ feed_url: 'https://example.com' });
        expect(feedUrlFromDb).toBe('https://example.com');
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
        // Given
        const slug = 'integration-slug';
        const metadata = [
          {
            key: DocumentMetadataKeyCode.IntegrationType,
            value: integrationType,
          },
          ...(integrationSubtype
            ? [
                {
                  key: DocumentMetadataKeyCode.IntegrationSubtype,
                  value: integrationSubtype,
                },
              ]
            : []),
        ];

        const createdDocument = await DocumentApp.createDocument({
          input: { ...documentData, slug },
          metadata,
          serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
          sourceDocument: mockUpload,
          images: [mockUpload],
        });

        vi.spyOn(MinIOClient, 'createFile').mockResolvedValue({
          minioName: 'imageFile',
          mimeType: 'image/png',
          fileName: 'image.png',
        });

        // When
        const result = await DocumentApp.updateDocument({
          parentDocumentId: createdDocument!.id,
          serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
          metadata,
          input: { ...documentData, slug },
          sourceDocument: mockUpload,
          existingImageIds: [],
        });
        const feedUrlFromDb =
          await DocumentMetadataDomain.loadMetadataValueByKey(
            result!.id,
            DocumentMetadataKeyCode.FeedUrl
          );

        // Then
        expect(result).toMatchObject({ feed_url: 'https://example.com' });
        expect(feedUrlFromDb).toBe('https://example.com');
      }
    );

    it('should convert boolean metadata keys to booleans on update', async () => {
      // Given
      // Create a Connector document with required metadata
      const connectorMetadata = [
        {
          key: DocumentMetadataKeyCode.IntegrationType,
          value: IntegrationType.Connector,
        },
        { key: DocumentMetadataKeyCode.IntegrationSubtype, value: 'native' },
        { key: DocumentMetadataKeyCode.ProductVersion, value: '1.0.0' },
        { key: DocumentMetadataKeyCode.Verified, value: 'false' },
        { key: DocumentMetadataKeyCode.ManagerSupported, value: 'false' },
        { key: DocumentMetadataKeyCode.PlaybookSupported, value: 'false' },
        {
          key: DocumentMetadataKeyCode.ContainerImage,
          value: 'container_image_value',
        },
        { key: DocumentMetadataKeyCode.SourceCode, value: 'source_code_value' },
        {
          key: DocumentMetadataKeyCode.SubscriptionLink,
          value: 'subscription_link_value',
        },
      ];
      const slug = 'connector-slug';
      const createdDocument = await DocumentApp.createDocument({
        input: { ...documentData, slug },
        metadata: connectorMetadata,
        serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
        sourceDocument: mockUpload,
      });

      // Update with boolean metadata as strings
      const updatedMetadata = [
        {
          key: DocumentMetadataKeyCode.IntegrationType,
          value: IntegrationType.Connector,
        },
        { key: DocumentMetadataKeyCode.IntegrationSubtype, value: 'native' },
        { key: DocumentMetadataKeyCode.ProductVersion, value: '2.0.0' },
        { key: DocumentMetadataKeyCode.Verified, value: 'true' },
        { key: DocumentMetadataKeyCode.ManagerSupported, value: 'true' },
        { key: DocumentMetadataKeyCode.PlaybookSupported, value: 'false' },
        {
          key: DocumentMetadataKeyCode.ContainerImage,
          value: 'container_image_value',
        },
        { key: DocumentMetadataKeyCode.SourceCode, value: 'source_code_value' },
        {
          key: DocumentMetadataKeyCode.SubscriptionLink,
          value: 'subscription_link_value',
        },
      ];

      // When
      const result = await DocumentApp.updateDocument({
        parentDocumentId: createdDocument!.id,
        serviceInstanceId: SERVICES.INSTANCES.INTEGRATIONS.ID,
        metadata: updatedMetadata,
        input: { ...documentData, slug },
        existingImageIds: [],
      });

      // Then
      expect(result).toMatchObject({
        verified: true,
        manager_supported: true,
        playbook_supported: false,
        product_version: '2.0.0',
      });
    });
  });

  describe('loadDocument', () => {
    it('should return the document with elastic search counters', async () => {
      // Given
      const document = await DocumentApp.createDocument({
        input: {
          uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
          name: 'myCustomDashboard',
          description: 'description',
          short_description: 'short_description',
          slug: 'slug',
          active: true,
        },
        metadata: [
          { key: DocumentMetadataKeyCode.ProductVersion, value: '1.2.3' },
        ],
        serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
        sourceDocument: mockUpload,
      });

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

      // When
      const documentLoaded = await DocumentApp.loadDocument(documentId);

      // Then
      expect(documentLoaded.download_number).toBe(5);
      expect(documentLoaded.share_number).toBe(12);
    });
  });

  describe('loadPublicDocumentBySlug', () => {
    it('should throw when service definition is not found', async () => {
      // When
      const call = DocumentApp.loadPublicDocumentBySlug(
        uuidv4() as ServiceInstanceId,
        'slug'
      );

      // Then
      await expect(call).rejects.toThrow(ErrorCode.ServiceDefinitionNotFound);
    });

    it('should return the document with elastic search counters', async () => {
      // Given
      const document = await DocumentApp.createDocument({
        input: {
          uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
          name: 'myCustomDashboard',
          description: 'description',
          short_description: 'short_description',
          slug: 'slug',
          active: true,
        },
        metadata: [
          { key: DocumentMetadataKeyCode.ProductVersion, value: '1.2.3' },
        ],
        serviceInstanceId: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
        sourceDocument: mockUpload,
      });

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

      // When
      const documentLoaded = await DocumentApp.loadPublicDocumentBySlug(
        SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
        document!.slug!
      );

      // Then
      expect(documentLoaded.download_number).toBe(5);
      expect(documentLoaded.share_number).toBe(12);
    });
  });

  describe('loadPublicDocumentsByServiceSlug', () => {
    it('should throw when service definition is not found', async () => {
      // When
      const call = DocumentApp.loadPublicDocumentsByServiceSlug('unknown-slug');

      // Then
      await expect(call).rejects.toThrow(ErrorCode.ServiceDefinitionNotFound);
    });

    it('should return the documents', async () => {
      // Given
      const loadSeoDocumentsByServiceSlugSpy = vi
        .spyOn(DocumentDomain, 'loadSeoDocumentsByServiceSlug')
        .mockResolvedValue([{}]);

      // When
      await DocumentApp.loadPublicDocumentsByServiceSlug(
        SERVICES.INSTANCES.CUSTOM_DASHBOARDS.SLUG
      );

      // Then
      expect(loadSeoDocumentsByServiceSlugSpy).toHaveBeenCalledWith(
        OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
        SERVICES.INSTANCES.CUSTOM_DASHBOARDS.SLUG,
        CUSTOM_DASHBOARD_METADATA_KEYS
      );
    });
  });

  describe('loadPublicDocuments', () => {
    it('should throw if service definition is not found', async () => {
      // Given
      vi.spyOn(
        ServiceDefinitionDomain,
        'loadServiceDefinitionByServiceInstance'
      ).mockResolvedValue(undefined);
      const input = { serviceInstanceId: 'invalid-id', slug: 'test-slug' };

      // When
      const call = DocumentApp.loadPublicDocuments(
        input as QueryPublicDocumentsArgs
      );
      // Then
      await expect(call).rejects.toThrow(ErrorCode.ServiceDefinitionNotFound);
    });

    it('should call DocumentDomain.loadPaginatedSeoDocumentsByServiceSlug with correct params', async () => {
      // Given
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

      // When
      await DocumentApp.loadPublicDocuments(
        input as unknown as QueryPublicDocumentsArgs
      );

      // Then
      expect(loadPaginatedSeoDocumentsSpy).toHaveBeenCalledWith(
        'opencti_custom_dashboard',
        'test-slug',
        { page: 1, pageSize: 10, serviceInstanceId: 'valid-id' },
        [DocumentMetadataKeyCode.ProductVersion]
      );
    });
  });

  describe('upsertDocumentWithExternalImage', () => {
    const metadataKeys = [
      {
        key: DocumentMetadataKeyCode.IntegrationType,
        value: IntegrationType.ThirdPartyIntegration,
      },
      {
        key: DocumentMetadataKeyCode.IntegrationSubtype,
        value: IntegrationSubType.Orchestration,
      },
      { key: DocumentMetadataKeyCode.VendorUrl, value: 'https://example.com' },
    ] as unknown as DocumentMetadataKeys<ThirdPartyIntegration>;

    it('should create a new document with an external image', async () => {
      // Given
      const input = {
        ...documentData,
        uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
      };

      // When
      const doc = await DocumentApp.upsertDocumentWithExternalImage(
        OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        input,
        mockUpload,
        metadataKeys
      );
      const children = await DocumentChildrenDomain.loadChildrenDocuments(
        doc.id
      );
      // Then
      expect(doc).toMatchObject({
        id: expect.any(String),
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        file_name: null,
      });
      expect(children).toHaveLength(1);
      expect(children[0]).toMatchObject({
        source_type: DocumentSourceType.External,
        minio_name: minioFileMock.minioName,
      });
    });

    it('should update an existing document and replace external image', async () => {
      // Given
      // First create
      const input = {
        ...documentData,
        uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        slug: 'unique-slug',
      };
      vi.spyOn(DocumentUploadsHelper, 'processUploads').mockResolvedValue([
        {
          ...minioFileMock,
          fileName: 'new-image.png',
        },
      ]);
      const newFileUpload = {
        ...mockUpload,
        file: { ...mockFileUpload, filename: 'new-image.png' },
      };
      // When
      const doc1 = await DocumentApp.upsertDocumentWithExternalImage(
        'integration',
        input,
        mockUpload,
        metadataKeys
      );
      // Update with new image
      const doc2 = await DocumentApp.upsertDocumentWithExternalImage(
        'integration',
        input,
        newFileUpload,
        metadataKeys
      );
      const children = await DocumentChildrenDomain.loadChildrenDocuments(
        doc2.id
      );

      // Then
      expect(doc2.id).toBe(doc1.id);

      expect(children).toHaveLength(1);
      expect(children[0]).toMatchObject({
        source_type: DocumentSourceType.External,
        file_name: 'new-image.png',
      });
    });
  });
});
