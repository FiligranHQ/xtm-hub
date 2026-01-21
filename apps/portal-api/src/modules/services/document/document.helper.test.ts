import { IntegrationSubTypeEnum } from '@xtm-hub/portal-front/__generated__/models/IntegrationSubType.enum';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  IntegrationType,
  ServiceDefinitionIdentifier,
} from '../../../__generated__/resolvers-types';
import { ErrorCode, UnknownErrorCode } from '../../../utils/error/error.code';
import { telemetryApp } from '../../telemetry/telemetry.app';
import { TelemetryEventType } from '../../telemetry/telemetry.types';
import { OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE } from '../custom-dashboards/custom-dashboards.domain';
import {
  INTEGRATION_SERVICE_INSTANCE_ID,
  OPENCTI_INTEGRATION_DOCUMENT_TYPE,
} from '../integrations/integrations.model';
import { OPENAEV_SCENARIO_DOCUMENT_TYPE } from '../openaev-scenarios/openaev-scenarios.domain';
import { DocumentApp } from './document.app';
import {
  DocumentHelper,
  loadDocumentWithCountersById,
  ManageableServiceDefinitionIdentifier,
  VAULT_DOCUMENT_TYPE,
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
        [
          { key: 'integration_type', value: IntegrationType.CsvFeed },
          { key: 'feed_url', value: 'https://example.com' },
        ],
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

  describe('retrieveDocumentTypeFromServiceDefinition', () => {
    it('should throw when service is not manageable', () => {
      expect(() =>
        DocumentHelper.retrieveDocumentTypeFromServiceDefinition(
          ServiceDefinitionIdentifier.Link as ManageableServiceDefinitionIdentifier
        )
      ).toThrow(ErrorCode.ServiceNotManageable);
    });

    it.each`
      identifier                                             | documentType
      ${ServiceDefinitionIdentifier.OpenctiIntegrations}     | ${OPENCTI_INTEGRATION_DOCUMENT_TYPE}
      ${ServiceDefinitionIdentifier.OpenctiCustomDashboards} | ${OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE}
      ${ServiceDefinitionIdentifier.OpenaevScenarios}        | ${OPENAEV_SCENARIO_DOCUMENT_TYPE}
      ${ServiceDefinitionIdentifier.Vault}                   | ${VAULT_DOCUMENT_TYPE}
    `(
      'should return $documentType when service definition identifier is $identifier',
      ({ identifier, documentType }) => {
        const result =
          DocumentHelper.retrieveDocumentTypeFromServiceDefinition(identifier);
        expect(result).toBe(documentType);
      }
    );
  });

  describe('assertMetadataIsNotMissing', () => {
    it('should throw error when metadata mapping is missing', () => {
      expect(() =>
        DocumentHelper.assertMetadataIsNotMissing(
          ServiceDefinitionIdentifier.Link as ManageableServiceDefinitionIdentifier,
          []
        )
      ).toThrow(UnknownErrorCode.MissingMetadataMapping);
    });

    it('should throw error when integration_type is missing in an integration document', () => {
      expect(() =>
        DocumentHelper.assertMetadataIsNotMissing(
          ServiceDefinitionIdentifier.OpenctiIntegrations,
          [{ key: 'feed_url', value: 'https://example.com' }]
        )
      ).toThrowError(ErrorCode.DocumentMissingMetadata);
    });

    it('should throw error when integration_type is not recognized', () => {
      expect(() =>
        DocumentHelper.assertMetadataIsNotMissing(
          ServiceDefinitionIdentifier.OpenctiIntegrations,
          [{ key: 'integration_type', value: 'test' }]
        )
      ).toThrowError(ErrorCode.IntegrationTypeNotRecognized);
    });

    it('should throw error when integration type is not manageable', () => {
      expect(() =>
        DocumentHelper.assertMetadataIsNotMissing(
          ServiceDefinitionIdentifier.OpenctiIntegrations,
          [{ key: 'integration_type', value: IntegrationType.Connector }]
        )
      ).toThrowError(ErrorCode.IntegrationTypeNotManageable);
    });

    it('should throw error when a metadata key is missing', () => {
      expect(() =>
        DocumentHelper.assertMetadataIsNotMissing(
          ServiceDefinitionIdentifier.OpenctiIntegrations,
          [{ key: 'integration_type', value: IntegrationType.CsvFeed }]
        )
      ).toThrowError(ErrorCode.DocumentMissingMetadata);
    });

    it('should not throw an error when a metadata key is missing but is optional', () => {
      DocumentHelper.assertMetadataIsNotMissing(
        ServiceDefinitionIdentifier.OpenctiIntegrations,
        [
          {
            key: 'integration_type',
            value: IntegrationType.ThirdPartyIntegration,
          },
          {
            key: 'integration_subtype',
            value: IntegrationSubTypeEnum.ORCHESTRATION,
          },
          {
            key: 'vendor_url',
            value: 'https://example.com',
          },
        ]
      );
    });

    it('should not throw when all metadata keys are present', () => {
      DocumentHelper.assertMetadataIsNotMissing(
        ServiceDefinitionIdentifier.OpenctiIntegrations,
        [
          {
            key: 'integration_type',
            value: IntegrationType.CsvFeed,
          },
          {
            key: 'feed_url',
            value: 'https://example.com',
          },
        ]
      );
    });
  });
});
