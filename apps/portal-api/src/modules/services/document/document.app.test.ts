import { FileUpload } from 'graphql-upload/processRequest.mjs';
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  SERVICE_CUSTOM_DASHBOARDS_ID,
  SERVICE_INTEGRATIONS_ID,
} from '../../../../tests/tests.const';
import {
  IntegrationSubType,
  IntegrationType,
} from '../../../__generated__/resolvers-types';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { ADMIN_UUID, PLATFORM_ORGANIZATION_UUID } from '../../../portal.const';
import { MinIOClient } from '../../../thirdparty/minio/client';
import { ErrorCode } from '../../../utils/error/error.code';
import { telemetryApp } from '../../telemetry/telemetry.app';
import {
  TELEMETRY_SOURCE,
  TelemetryEventService,
} from '../../telemetry/telemetry.const';
import { TelemetryEventType } from '../../telemetry/telemetry.types';
import * as DocumentUploadsHelper from '../document/document.uploads.helper';
import { DocumentApp } from './document.app';
import { deleteDocuments } from './document.helper';

describe('DocumentApp', () => {
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

  const documentData = {
    short_description: 'short_description',
    slug: 'slug',
    uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
    name: 'name',
    description: 'description',
    active: true,
  };

  beforeEach(() => {
    vi.spyOn(DocumentUploadsHelper, 'processUploads').mockResolvedValue([
      minioFileMock,
    ]);
    vi.spyOn(MinIOClient, 'createFile').mockResolvedValue(minioFileMock);
  });

  afterEach(async () => {
    await deleteDocuments();
  });

  afterAll(async () => {
    vi.useRealTimers();
  });

  describe('createDocument', () => {
    it('should throw when metadata is missing', async () => {
      const call = DocumentApp.createDocument(
        documentData,
        [],
        SERVICE_CUSTOM_DASHBOARDS_ID as ServiceInstanceId,
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
        SERVICE_INTEGRATIONS_ID,
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
        SERVICE_INTEGRATIONS_ID,
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
        SERVICE_INTEGRATIONS_ID,
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
        SERVICE_CUSTOM_DASHBOARDS_ID as ServiceInstanceId,
        []
      );
      expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
        '@timestamp': '2025-02-03T13:12:15.000Z',
        event_type: TelemetryEventType.CREATE,
        organization_id: PLATFORM_ORGANIZATION_UUID,
        organization_name: 'Filigran',
        organization_type: 'Professional',
        source: TELEMETRY_SOURCE,
        user_id: ADMIN_UUID,
        service: TelemetryEventService.CUSTOM_DASHBOARDS_LIBRARY,
        resource_id: expect.any(String),
        resource_title: 'myCustomDashboard',
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
        SERVICE_CUSTOM_DASHBOARDS_ID as ServiceInstanceId,
        []
      );

      expect(createdDocument).toBeDefined();

      const call = DocumentApp.updateDocument(
        createdDocument!.id,
        SERVICE_CUSTOM_DASHBOARDS_ID as ServiceInstanceId,
        [],
        {
          document: [],
          input: documentData,
          updateDocument: true,
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
        SERVICE_INTEGRATIONS_ID,
        []
      );

      expect(createdDocument).toBeDefined();

      const result = await DocumentApp.updateDocument(
        createdDocument!.id,
        SERVICE_INTEGRATIONS_ID,
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
        SERVICE_INTEGRATIONS_ID,
        []
      );

      expect(createdDocument).toBeDefined();

      const result = await DocumentApp.updateDocument(
        createdDocument!.id,
        SERVICE_INTEGRATIONS_ID,
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
        SERVICE_INTEGRATIONS_ID,
        []
      );

      expect(createdDocument).toBeDefined();

      const result = await DocumentApp.updateDocument(
        createdDocument!.id,
        SERVICE_INTEGRATIONS_ID,
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
});
