import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import {
  IntegrationType,
  ServiceDefinitionIdentifier,
} from '../../../__generated__/resolvers-types';
import ServiceDefinition from '../../../model/kanel/public/ServiceDefinition';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { ErrorCode } from '../../../utils/error/error.code';
import { serviceDefinitionDomain } from '../definition/service-definition.domain';
import {
  INTEGRATION_CSV_FEED_METADATA,
  OPENCTI_INTEGRATION_DOCUMENT_TYPE,
} from '../integrations/integrations.model';
import { retrieveDocumentTypeAndMetadataKeys } from './document.helper';

describe('DocumentHelper', () => {
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
        identifier: ServiceDefinitionIdentifier.Vault,
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
      expect(metadataKeys).toBe(INTEGRATION_CSV_FEED_METADATA);
    });
  });
});
