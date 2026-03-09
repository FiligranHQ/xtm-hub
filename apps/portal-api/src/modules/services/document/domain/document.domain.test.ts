import { toGlobalId } from 'graphql-relay/node/node.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../../../../knexfile';
import {
  DocumentConnection,
  DocumentOrdering,
  FilterKey,
  Integration,
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
} from '../opencti/integrations/integrations.model';

import { TEST_ORGANIZATIONS } from '../../../../../tests/tests.const';
import Document from '../../../../model/kanel/public/Document';
import { ADMIN_UUID } from '../../../../portal.const';
import { DocumentApp } from '../document.app';
import * as DocumentUploadsHelper from '../document.uploads.helper';
import { DocumentDomain } from './document.domain';
import { DocumentMetadataKeys } from './document.metadata.domain';

describe('Document domain', () => {
  const minioFileMock = {
    minioName: 'minioFile',
    mimeType: 'mimeType',
    fileName: 'filename',
  };

  beforeEach(async () => {
    vi.spyOn(DocumentUploadsHelper, 'processUploads').mockResolvedValue([
      minioFileMock,
    ]);

    await db<Document>('Document').delete();
  });

  describe('deactivateDocuments', () => {
    it('should do nothing when the document ids is an empty array', async () => {
      const createdDocument = await DocumentApp.createDocument(
        {
          uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
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

      await DocumentDomain.deactivateDocuments([]);

      const documents = await db<Document[]>('Document')
        .where('id', '=', createdDocument!.id)
        .select('*');

      expect(documents.length).toBe(1);
      expect(documents[0]!.active).toBe(true);
    });

    it('should deactivate document and set remover id', async () => {
      const createdDocument = await DocumentApp.createDocument(
        {
          uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
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

      await DocumentDomain.deactivateDocuments([createdDocument.id]);

      const documents = await db<Document[]>('Document')
        .where('id', '=', createdDocument!.id)
        .select('*');

      expect(documents.length).toBe(1);
      expect(documents[0]!.active).toBe(false);
      expect(documents[0]!.remover_id).toBe(ADMIN_UUID);
    });
  });

  describe(`loadParentDocumentsByServiceInstance`, () => {
    it('should return CSV Feeds along with connectors when fetching integration feeds', async () => {
      await DocumentApp.createDocument(
        {
          uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
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

      const connection: { edges: { node: Integration }[] } =
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
          uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
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
      const csvFeedConnection: { edges: { node: Integration }[] } =
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
      const connectorConnection: { edges: { node: Integration }[] } =
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
      const integrationConnection: DocumentConnection =
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
            uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
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
        const connectorConnection: { edges: { node: Integration }[] } =
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
            uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
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
        const connectorConnection: DocumentConnection =
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

        const secondContractConnection: DocumentConnection =
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

        const allContractsConnection: DocumentConnection =
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

  describe('createDocument', () => {
    it('should create a document with minimal required fields', async () => {
      const docData = {
        name: 'Minimal Document',
        type: 'test-type',
        slug: 'minimal-doc',
      };
      const metadataKeys: DocumentMetadataKeys<Document> = [];
      const document = await DocumentDomain.createDocument(
        docData,
        metadataKeys
      );
      expect(document).toBeDefined();
      if (!document) throw new Error('Document not created');
      expect(document.name).toBe(docData.name);
      expect(document.type).toBe(docData.type);
      expect(document.slug).toBe(docData.slug);
      expect(document.uploader_id).toBe(ADMIN_UUID);
      expect(document.uploader_organization_id).toBe(
        TEST_ORGANIZATIONS.FILIGRAN.ID
      );
      expect(document.active).toBe(true);
      // Check DB row exists
      const dbDocument = await db('Document').where('id', document.id).first();

      expect(dbDocument).toBeDefined();
      expect(dbDocument.name).toBe(docData.name);
      expect(dbDocument.type).toBe(docData.type);
      expect(dbDocument.slug).toBe(docData.slug);
      expect(dbDocument.uploader_id).toBe(ADMIN_UUID);
      expect(dbDocument.uploader_organization_id).toBe(
        TEST_ORGANIZATIONS.FILIGRAN.ID
      );
      expect(dbDocument.active).toBe(true);
    });

    it('should create a document with explicit uploader_id', async () => {
      const otherUserId = TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID;
      const docData = {
        name: 'Uploader Doc',
        type: 'test-type',
        slug: 'uploader-doc',
        uploader_id: toGlobalId('Document', otherUserId),
      };
      const metadataKeys: DocumentMetadataKeys<Document> = [];
      const document = await DocumentDomain.createDocument(
        docData,
        metadataKeys
      );
      expect(document).toBeDefined();
      if (!document) throw new Error('Document not created');
      expect(document.uploader_id).toBe(otherUserId);
    });

    it('should create an inactive document', async () => {
      const docData = {
        name: 'Inactive Doc',
        type: 'test-type',
        slug: 'inactive-doc',
        active: false,
      };
      const metadataKeys: DocumentMetadataKeys<Document> = [];
      const document = await DocumentDomain.createDocument(
        docData,
        metadataKeys
      );
      expect(document).toBeDefined();
      if (!document) throw new Error('Document not created');
      expect(document.active).toBe(false);
    });

    it('should throw if required fields are missing', async () => {
      await expect(DocumentDomain.createDocument({}, [])).rejects.toThrow();
    });
  });
});
