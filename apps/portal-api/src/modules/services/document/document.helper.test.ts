import { v4 as uuidv4 } from 'uuid';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  IntegrationType,
  ServiceDefinitionIdentifier,
} from '../../../__generated__/resolvers-types';
import ServiceDefinition from '../../../model/kanel/public/ServiceDefinition';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { ErrorCode } from '../../../utils/error/error.code';
import { telemetryApp } from '../../telemetry/telemetry.app';
import { TelemetryEventType } from '../../telemetry/telemetry.types';
import { serviceDefinitionDomain } from '../definition/service-definition.domain';
import {
  INTEGRATION_CSV_FEED_METADATA_KEYS,
  INTEGRATION_SERVICE_INSTANCE_ID,
  OPENCTI_INTEGRATION_DOCUMENT_TYPE,
} from '../integrations/integrations.model';
import { DocumentApp } from './document.app';
import {
  loadDocumentWithCountersById,
  retrieveDocumentTypeAndMetadataKeys,
} from './document.helper';
import * as DocumentUploadsHelper from './document.uploads.helper';

describe('DocumentHelper', () => {
  describe('CSV Feed', () => {
    const minioFileMock = {
      minioName: 'minioFile',
      mimeType: 'mimeType',
      fileName: 'csvfilename',
    };
    beforeEach(() => {
      vi.spyOn(DocumentUploadsHelper, 'processUploads').mockResolvedValue([
        minioFileMock,
      ]);
    });

    afterAll(async () => {
      vi.useRealTimers();
    });

    it('cvsFeed should return the document with elastic search counters', async () => {
      const document = await DocumentApp.createDocument(
        {
          uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
          name: 'myCsvFeed',
          description: 'description',
          short_description: 'short_description',
          slug: 'slug',
          active: true,
        },
        [{ key: 'integration_type', value: IntegrationType.CsvFeed }],
        INTEGRATION_SERVICE_INSTANCE_ID,
        []
      );
      expect(document).toBeDefined();

      const documentId = document!.id;

      vi.spyOn(telemetryApp, 'countEventsByDocumentId').mockImplementation(
        async (eventType: TelemetryEventType, eventDocumentId: string) => {
          if (
            eventDocumentId === documentId &&
            eventType === TelemetryEventType.DOWNLOAD
          )
            return 5;
          if (
            eventDocumentId === documentId &&
            eventType === TelemetryEventType.SHARE
          )
            return 12;
          return 0; // default
        }
      );

      const documentLoaded = await loadDocumentWithCountersById(documentId);

      expect(documentLoaded.download_number).toBe(5);
      expect(documentLoaded.share_number).toBe(12);
    });
  });

  describe('retrieveDocumentTypeAndMetadataKeys', () => {
    const serviceInstanceId = uuidv4() as ServiceInstanceId;
    const loadServiceDefinitionByServiceInstanceSpy = vi.spyOn(
      serviceDefinitionDomain,
      'loadServiceDefinitionByServiceInstance'
    );
    it('should throw when service definition is not found', async () => {
      loadServiceDefinitionByServiceInstanceSpy.mockResolvedValue(null);

      const call = retrieveDocumentTypeAndMetadataKeys(serviceInstanceId, []);

      await expect(call).rejects.toThrow(ErrorCode.ServiceDefinitionNotFound);
    });

    it('should throw when service definition is not manageable', async () => {
      loadServiceDefinitionByServiceInstanceSpy.mockResolvedValue({
        identifier: ServiceDefinitionIdentifier.Link,
      } as ServiceDefinition);

      const call = retrieveDocumentTypeAndMetadataKeys(serviceInstanceId, []);

      await expect(call).rejects.toThrow(ErrorCode.ServiceNotManageable);
    });

    it('should throw when document is missing metadata', async () => {
      loadServiceDefinitionByServiceInstanceSpy.mockResolvedValue({
        identifier: ServiceDefinitionIdentifier.OpenctiIntegrations,
      } as ServiceDefinition);

      const call = retrieveDocumentTypeAndMetadataKeys(serviceInstanceId, []);

      await expect(call).rejects.toThrow(ErrorCode.DocumentMissingMetadata);
    });

    it('should throw when integration type is not recognized', async () => {
      loadServiceDefinitionByServiceInstanceSpy.mockResolvedValue({
        identifier: ServiceDefinitionIdentifier.OpenctiIntegrations,
      } as ServiceDefinition);

      const call = retrieveDocumentTypeAndMetadataKeys(serviceInstanceId, [
        { key: 'integration_type', value: 'hello' },
      ]);

      await expect(call).rejects.toThrow(
        ErrorCode.IntegrationTypeNotRecognized
      );
    });

    it('should throw when integration type is not manageable', async () => {
      loadServiceDefinitionByServiceInstanceSpy.mockResolvedValue({
        identifier: ServiceDefinitionIdentifier.OpenctiIntegrations,
      } as ServiceDefinition);

      const call = retrieveDocumentTypeAndMetadataKeys(serviceInstanceId, [
        { key: 'integration_type', value: IntegrationType.Connector },
      ]);

      await expect(call).rejects.toThrow(
        ErrorCode.IntegrationTypeNotManageable
      );
    });

    it('should return document type and metadata', async () => {
      loadServiceDefinitionByServiceInstanceSpy.mockResolvedValue({
        identifier: ServiceDefinitionIdentifier.OpenctiIntegrations,
      } as ServiceDefinition);

      const { documentType, metadataKeys } =
        await retrieveDocumentTypeAndMetadataKeys(serviceInstanceId, [
          { key: 'integration_type', value: IntegrationType.CsvFeed },
        ]);

      expect(documentType).toBe(OPENCTI_INTEGRATION_DOCUMENT_TYPE);
      expect(metadataKeys).toStrictEqual(INTEGRATION_CSV_FEED_METADATA_KEYS);
    });
  });
});
