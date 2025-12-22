import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../../../../knexfile';
import {
  DocumentOrdering,
  FilterKey,
  IntegrationFeedConnection,
  IntegrationFeedType,
  OrderingMode,
} from '../../../../__generated__/resolvers-types';
import { DocumentId } from '../../../../model/kanel/public/Document';
import { upsertConnectors } from '../../../ingest-manifest/ingest-manifest.domain';
import { ManifestInformation } from '../../../ingest-manifest/ingest-manifest.model';
import sampleExtractedManifest from '../../../ingest-manifest/test/sample-extracted-manifest.json';
import {
  Connector,
  CsvFeed,
  INTEGRATION_FEED_CONNECTOR_METADATA,
  INTEGRATION_FEED_CSV_FEED_METADATA,
  INTEGRATION_FEED_METADATA,
  INTEGRATION_FEEDS_SERVICE_INSTANCE_ID,
  OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
} from '../../integration-feeds/integration-feeds.model';
import { loadParentDocumentsByServiceInstance } from './document.domain';

import { DocumentApp } from '../document.app';
import * as DocumentUploadsHelper from '../document.uploads.helper';

describe('Document domain', () => {
  const minioFileMock = {
    minioName: 'minioFile',
    mimeType: 'mimeType',
    fileName: 'filename',
  };
  beforeEach(() => {
    vi.spyOn(DocumentUploadsHelper, 'processUploads').mockResolvedValue([
      minioFileMock,
    ]);
  });
  describe(`${loadParentDocumentsByServiceInstance.name}`, () => {
    beforeEach(async () => {
      await db<Document>('Document')
        .where('type', OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE)
        .delete();
    });

    it('should return CSV Feeds along with connectors when fetching integration feeds', async () => {
      const documentId = uuidv4() as DocumentId;

      await DocumentApp.createDocumentWithImageUploadsAndMetadata<CsvFeed>(
        OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
        {
          id: documentId,
          uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
          name: 'myCsvFeed',
          slug: 'myCsvFeed',
          description: 'description',
          minio_name: 'minioName',
          file_name: 'csvfilename',
          active: true,
          integration_type: IntegrationFeedType.CsvFeed,
          service_instance_id: INTEGRATION_FEEDS_SERVICE_INSTANCE_ID,
        },
        [],
        INTEGRATION_FEED_CSV_FEED_METADATA
      );

      await upsertConnectors([
        sampleExtractedManifest[0],
      ] as ManifestInformation[]);

      const connection: IntegrationFeedConnection =
        await loadParentDocumentsByServiceInstance(
          OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
          {
            orderBy: DocumentOrdering.CreatedAt,
            orderMode: OrderingMode.Desc,
            first: 10,
            serviceInstanceId: toGlobalId(
              'ServiceInstance',
              INTEGRATION_FEEDS_SERVICE_INSTANCE_ID
            ),
          },
          INTEGRATION_FEED_METADATA
        );

      const csvFeeds = connection.edges
        .filter(
          (feed) => feed.node.integration_type === IntegrationFeedType.CsvFeed
        )
        .map((feed) => feed.node);
      expect(csvFeeds.length).toBeTruthy();

      const connectors = connection.edges.filter(
        (feed) => feed.node.integration_type === IntegrationFeedType.Connector
      );

      expect(connectors.length).toBeTruthy();
      const connector: Connector = connectors[0]?.node as Connector;
      INTEGRATION_FEED_CONNECTOR_METADATA.forEach((metadata) => {
        expect(connector[metadata]).toBeDefined();
      });
    });

    it('should filter an integration feed with a metadata type', async () => {
      // Create data
      const documentId = uuidv4() as DocumentId;

      const csvFeed =
        await DocumentApp.createDocumentWithImageUploadsAndMetadata<CsvFeed>(
          OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
          {
            id: documentId,
            uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
            name: 'myCsvFeed',
            slug: 'myCsvFeed',
            description: 'description',
            minio_name: 'minioName',
            file_name: 'csvfilename',
            active: true,
            integration_type: IntegrationFeedType.CsvFeed,
            service_instance_id: INTEGRATION_FEEDS_SERVICE_INSTANCE_ID,
          },
          [],
          INTEGRATION_FEED_CSV_FEED_METADATA
        );

      const [connector] = await upsertConnectors([
        sampleExtractedManifest[0],
      ] as ManifestInformation[]);

      expect(connector).toBeDefined();

      // Fetch csv feeds only
      const csvFeedConnection: IntegrationFeedConnection =
        await loadParentDocumentsByServiceInstance(
          OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
          {
            orderBy: DocumentOrdering.CreatedAt,
            orderMode: OrderingMode.Desc,
            first: 10,
            serviceInstanceId: toGlobalId(
              'ServiceInstance',
              INTEGRATION_FEEDS_SERVICE_INSTANCE_ID
            ),
            filters: [
              {
                key: FilterKey.IntegrationType,
                value: [IntegrationFeedType.CsvFeed],
              },
            ],
          },
          INTEGRATION_FEED_METADATA
        );

      expect(csvFeedConnection.edges.length).toBe(1);
      expect(csvFeedConnection.edges[0]?.node.id).toBe(csvFeed.id);
      expect(csvFeedConnection.edges[0]?.node.integration_type).toBe(
        IntegrationFeedType.CsvFeed
      );

      // Fetch connectors only
      const connectorConnection: IntegrationFeedConnection =
        await loadParentDocumentsByServiceInstance(
          OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
          {
            orderBy: DocumentOrdering.CreatedAt,
            orderMode: OrderingMode.Desc,
            first: 10,
            serviceInstanceId: toGlobalId(
              'ServiceInstance',
              INTEGRATION_FEEDS_SERVICE_INSTANCE_ID
            ),
            filters: [
              {
                key: FilterKey.IntegrationType,
                value: [IntegrationFeedType.Connector],
              },
            ],
          },
          INTEGRATION_FEED_METADATA
        );

      expect(connectorConnection.edges.length).toBe(1);
      expect(connectorConnection.edges[0]?.node.id).toBe(connector?.id);
      expect(connectorConnection.edges[0]?.node.integration_type).toBe(
        IntegrationFeedType.Connector
      );
    });

    describe('product version filtering', () => {
      it('should filter an integration feed with a product version', async () => {
        // Create data
        const connectors = await upsertConnectors(
          sampleExtractedManifest as ManifestInformation[]
        );

        expect(connectors).toBeDefined();
        expect(connectors.length).toBe(2);

        const secondContractConnection: IntegrationFeedConnection =
          await loadParentDocumentsByServiceInstance(
            OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
            {
              orderBy: DocumentOrdering.CreatedAt,
              orderMode: OrderingMode.Desc,
              first: 10,
              serviceInstanceId: toGlobalId(
                'ServiceInstance',
                INTEGRATION_FEEDS_SERVICE_INSTANCE_ID
              ),
              filters: [
                {
                  key: FilterKey.ProductVersion,
                  value: ['1.0.0'],
                },
              ],
            },
            INTEGRATION_FEED_METADATA
          );

        expect(secondContractConnection.edges.length).toBe(1);
        expect(secondContractConnection.edges[0]?.node.id).toBe(
          connectors[0]?.id
        );
      });

      it('should handle multiple product version filters', async () => {
        // Create data
        const connectors = await upsertConnectors(
          sampleExtractedManifest as ManifestInformation[]
        );

        expect(connectors).toBeDefined();
        expect(connectors.length).toBe(2);

        const allContractsConnection: IntegrationFeedConnection =
          await loadParentDocumentsByServiceInstance(
            OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
            {
              orderBy: DocumentOrdering.CreatedAt,
              orderMode: OrderingMode.Desc,
              first: 10,
              serviceInstanceId: toGlobalId(
                'ServiceInstance',
                INTEGRATION_FEEDS_SERVICE_INSTANCE_ID
              ),
              filters: [
                {
                  key: FilterKey.ProductVersion,
                  value: ['1.0.54', '1.0.1'],
                },
              ],
            },
            INTEGRATION_FEED_METADATA
          );

        expect(allContractsConnection.edges.length).toBe(2);
      });
    });
  });
});
