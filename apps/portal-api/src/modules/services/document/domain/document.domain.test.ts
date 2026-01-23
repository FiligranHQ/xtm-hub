import { toGlobalId } from 'graphql-relay/node/node.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../../../../knexfile';
import {
  DocumentOrdering,
  FilterKey,
  IntegrationConnection,
  IntegrationSubType,
  IntegrationType,
  LogicalOperator,
  OrderingMode,
} from '../../../../__generated__/resolvers-types';
import { upsertConnectors } from '../../../ingest-manifest/ingest-manifest.domain';
import { ManifestInformation } from '../../../ingest-manifest/ingest-manifest.model';
import sampleExtractedManifest from '../../../ingest-manifest/test/sample-extracted-manifest.json';
import {
  Connector,
  INTEGRATION_CONNECTOR_METADATA_KEYS,
  INTEGRATION_METADATA_KEYS,
  INTEGRATION_SERVICE_INSTANCE_ID,
  OPENCTI_INTEGRATION_DOCUMENT_TYPE,
} from '../../integrations/integrations.model';

import { DocumentApp } from '../document.app';
import * as DocumentUploadsHelper from '../document.uploads.helper';
import { DocumentDomain } from './document.domain';

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
  describe(`loadParentDocumentsByServiceInstance`, () => {
    beforeEach(async () => {
      await db<Document>('Document')
        .where('type', OPENCTI_INTEGRATION_DOCUMENT_TYPE)
        .delete();
    });

    it('should return CSV Feeds along with connectors when fetching integration feeds', async () => {
      await DocumentApp.createDocument(
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

      await upsertConnectors([
        sampleExtractedManifest[0],
      ] as ManifestInformation[]);

      const connection: IntegrationConnection =
        await DocumentDomain.loadParentDocumentsByServiceInstance(
          OPENCTI_INTEGRATION_DOCUMENT_TYPE,
          {
            orderBy: DocumentOrdering.CreatedAt,
            orderMode: OrderingMode.Desc,
            first: 10,
            serviceInstanceId: toGlobalId(
              'ServiceInstance',
              INTEGRATION_SERVICE_INSTANCE_ID
            ),
          },
          INTEGRATION_METADATA_KEYS
        );

      const csvFeeds = connection.edges
        .filter(
          (feed) => feed.node.integration_type === IntegrationType.CsvFeed
        )
        .map((feed) => feed.node);
      expect(csvFeeds.length).toBeTruthy();

      const connectors = connection.edges.filter(
        (feed) => feed.node.integration_type === IntegrationType.Connector
      );

      expect(connectors.length).toBeTruthy();
      const connector: Connector = connectors[0]?.node as Connector;
      INTEGRATION_CONNECTOR_METADATA_KEYS.forEach((metadata) => {
        expect(connector[metadata]).toBeDefined();
      });
    });

    it('should filter an integration feed with a metadata type', async () => {
      // Create data
      const csvFeed = await DocumentApp.createDocument(
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

      const [connector] = await upsertConnectors([
        sampleExtractedManifest[0],
      ] as ManifestInformation[]);

      expect(connector).toBeDefined();

      // Fetch csv feeds only
      const csvFeedConnection: IntegrationConnection =
        await DocumentDomain.loadParentDocumentsByServiceInstance(
          OPENCTI_INTEGRATION_DOCUMENT_TYPE,
          {
            orderBy: DocumentOrdering.CreatedAt,
            orderMode: OrderingMode.Desc,
            first: 10,
            serviceInstanceId: toGlobalId(
              'ServiceInstance',
              INTEGRATION_SERVICE_INSTANCE_ID
            ),
            logicalFilters: {
              operator: LogicalOperator.And,
              children: [
                {
                  leaf: {
                    key: FilterKey.IntegrationType,
                    value: [IntegrationType.CsvFeed],
                  },
                },
              ],
            },
          },
          INTEGRATION_METADATA_KEYS
        );

      expect(csvFeedConnection.edges.length).toBe(1);
      expect(csvFeedConnection.edges[0]?.node.id).toBe(csvFeed!.id);
      expect(csvFeedConnection.edges[0]?.node.integration_type).toBe(
        IntegrationType.CsvFeed
      );

      // Fetch connectors only
      const connectorConnection: IntegrationConnection =
        await DocumentDomain.loadParentDocumentsByServiceInstance(
          OPENCTI_INTEGRATION_DOCUMENT_TYPE,
          {
            orderBy: DocumentOrdering.CreatedAt,
            orderMode: OrderingMode.Desc,
            first: 10,
            serviceInstanceId: toGlobalId(
              'ServiceInstance',
              INTEGRATION_SERVICE_INSTANCE_ID
            ),
            logicalFilters: {
              operator: LogicalOperator.And,
              children: [
                {
                  leaf: {
                    key: FilterKey.IntegrationType,
                    value: [IntegrationType.Connector],
                  },
                },
              ],
            },
          },
          INTEGRATION_METADATA_KEYS
        );

      expect(connectorConnection.edges.length).toBe(1);
      expect(connectorConnection.edges[0]?.node.id).toBe(connector?.id);
      expect(connectorConnection.edges[0]?.node.integration_type).toBe(
        IntegrationType.Connector
      );

      // fetch both
      const integrationConnection: IntegrationConnection =
        await DocumentDomain.loadParentDocumentsByServiceInstance(
          OPENCTI_INTEGRATION_DOCUMENT_TYPE,
          {
            orderBy: DocumentOrdering.CreatedAt,
            orderMode: OrderingMode.Desc,
            first: 10,
            serviceInstanceId: toGlobalId(
              'ServiceInstance',
              INTEGRATION_SERVICE_INSTANCE_ID
            ),
            logicalFilters: {
              operator: LogicalOperator.And,
              children: [
                {
                  leaf: {
                    key: FilterKey.IntegrationType,
                    value: [IntegrationType.Connector, IntegrationType.CsvFeed],
                  },
                },
              ],
            },
          },
          INTEGRATION_METADATA_KEYS
        );

      expect(integrationConnection.edges.length).toBe(2);
    });

    describe('multiple filters', () => {
      it('should handle type and version', async () => {
        // Create data
        await DocumentApp.createDocument(
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

        const connectors = await upsertConnectors(
          sampleExtractedManifest as ManifestInformation[]
        );

        expect(connectors.length).toBe(2);

        // Fetch connectors with version
        const connectorConnection: IntegrationConnection =
          await DocumentDomain.loadParentDocumentsByServiceInstance(
            OPENCTI_INTEGRATION_DOCUMENT_TYPE,
            {
              orderBy: DocumentOrdering.CreatedAt,
              orderMode: OrderingMode.Desc,
              first: 10,
              serviceInstanceId: toGlobalId(
                'ServiceInstance',
                INTEGRATION_SERVICE_INSTANCE_ID
              ),
              logicalFilters: {
                operator: LogicalOperator.And,
                children: [
                  {
                    leaf: {
                      key: FilterKey.IntegrationType,
                      value: [IntegrationType.Connector],
                    },
                  },
                  {
                    leaf: {
                      key: FilterKey.ProductVersion,
                      value: ['1.0.0'],
                    },
                  },
                ],
              },
            },
            INTEGRATION_METADATA_KEYS
          );

        expect(connectorConnection.edges.length).toBe(1);
        expect(connectorConnection.edges[0]?.node.id).toBe(connectors[0]?.id);
        expect(connectorConnection.edges[0]?.node.integration_type).toBe(
          IntegrationType.Connector
        );
      });

      it('should handle type and subtype', async () => {
        // Create data
        await DocumentApp.createDocument(
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

        const connectors = await upsertConnectors(
          sampleExtractedManifest as ManifestInformation[]
        );

        expect(connectors.length).toBe(2);

        // Fetch connectors with version
        const connectorConnection: IntegrationConnection =
          await DocumentDomain.loadParentDocumentsByServiceInstance(
            OPENCTI_INTEGRATION_DOCUMENT_TYPE,
            {
              orderBy: DocumentOrdering.CreatedAt,
              orderMode: OrderingMode.Desc,
              first: 10,
              serviceInstanceId: toGlobalId(
                'ServiceInstance',
                INTEGRATION_SERVICE_INSTANCE_ID
              ),
              logicalFilters: {
                operator: LogicalOperator.Or,
                children: [
                  {
                    operator: LogicalOperator.And,
                    children: [
                      {
                        leaf: {
                          key: FilterKey.IntegrationType,
                          value: [IntegrationType.Connector],
                        },
                      },
                      {
                        leaf: {
                          key: FilterKey.IntegrationSubtype,
                          value: [IntegrationSubType.ExternalImport],
                        },
                      },
                    ],
                  },
                  {
                    leaf: {
                      key: FilterKey.IntegrationType,
                      value: [IntegrationType.CsvFeed],
                    },
                  },
                ],
              },
            },
            INTEGRATION_METADATA_KEYS
          );

        expect(connectorConnection.edges.length).toBe(2);

        expect(connectorConnection.edges).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              node: expect.objectContaining({
                integration_type: IntegrationType.CsvFeed,
              }),
            }),
            expect.objectContaining({
              node: expect.objectContaining({
                integration_type: IntegrationType.Connector,
                integration_subtype: IntegrationSubType.ExternalImport,
              }),
            }),
          ])
        );
      });
    });

    describe('product version filtering', () => {
      it('should filter an integration feed with a product version', async () => {
        // Create data
        const connectors = await upsertConnectors(
          sampleExtractedManifest as ManifestInformation[]
        );

        expect(connectors).toBeDefined();
        expect(connectors.length).toBe(2);

        const secondContractConnection: IntegrationConnection =
          await DocumentDomain.loadParentDocumentsByServiceInstance(
            OPENCTI_INTEGRATION_DOCUMENT_TYPE,
            {
              orderBy: DocumentOrdering.CreatedAt,
              orderMode: OrderingMode.Desc,
              first: 10,
              serviceInstanceId: toGlobalId(
                'ServiceInstance',
                INTEGRATION_SERVICE_INSTANCE_ID
              ),
              logicalFilters: {
                operator: LogicalOperator.And,
                children: [
                  {
                    leaf: {
                      key: FilterKey.ProductVersion,
                      value: ['1.0.0'],
                    },
                  },
                ],
              },
            },
            INTEGRATION_METADATA_KEYS
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

        const allContractsConnection: IntegrationConnection =
          await DocumentDomain.loadParentDocumentsByServiceInstance(
            OPENCTI_INTEGRATION_DOCUMENT_TYPE,
            {
              orderBy: DocumentOrdering.CreatedAt,
              orderMode: OrderingMode.Desc,
              first: 10,
              serviceInstanceId: toGlobalId(
                'ServiceInstance',
                INTEGRATION_SERVICE_INSTANCE_ID
              ),
              logicalFilters: {
                operator: LogicalOperator.And,
                children: [
                  {
                    leaf: {
                      key: FilterKey.ProductVersion,
                      value: ['1.0.54', '1.0.1'],
                    },
                  },
                ],
              },
            },
            INTEGRATION_METADATA_KEYS
          );

        expect(allContractsConnection.edges.length).toBe(2);
      });
    });
  });
});
