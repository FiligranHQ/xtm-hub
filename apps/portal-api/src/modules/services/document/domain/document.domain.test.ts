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

import { SERVICES, TEST_ORGANIZATIONS } from '../../../../../tests/tests.const';
import Document, { DocumentId } from '../../../../model/kanel/public/Document';
import { ADMIN_UUID } from '../../../../portal.const';
import { DocumentApp } from '../document.app';
import * as DocumentUploadsHelper from '../document.uploads.helper';
import { DocumentDomain } from './document.domain';

const testCreateDocument = async () => {
  const document = await DocumentApp.createDocument(
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

  expect(document).toBeDefined();

  return document!;
};

const testLoadDocument = async (
  documentId: DocumentId
): Promise<Document | undefined> => {
  return db<Document>('Document')
    .where('id', '=', documentId)
    .select('*')
    .first();
};

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
    let createdDocument: Document;
    beforeEach(async () => {
      createdDocument = await testCreateDocument();
    });

    it('should do nothing when the document ids is an empty array', async () => {
      await DocumentDomain.deactivateDocuments([]);

      const document = await testLoadDocument(createdDocument.id);

      expect(document).toBeDefined();
      expect(document!.active).toBe(true);
    });

    it('should deactivate document and set remover id', async () => {
      await DocumentDomain.deactivateDocuments([createdDocument.id]);

      const document = await testLoadDocument(createdDocument.id);

      expect(document).toBeDefined();
      expect(document!.active).toBe(false);
      expect(document!.remover_id).toBe(ADMIN_UUID);
    });
  });

  describe(`loadParentDocumentsByServiceInstance`, () => {
    let csvFeed: Document;
    beforeEach(async () => {
      csvFeed = await testCreateDocument();
    });
    it('should return CSV Feeds along with connectors when fetching integration feeds', async () => {
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

        expect(secondContractConnection.edges.length).toBe(2);
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

        expect(allContractsConnection.edges.length).toBe(3);
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
      const document = await DocumentDomain.createDocument(docData, []);
      expect(document).toBeDefined();
      expect(document).toMatchObject({
        name: docData.name,
        type: docData.type,
        slug: docData.slug,
        uploader_id: ADMIN_UUID,
        uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        active: true,
      });

      // Check DB row exists
      const dbDocument = await db('Document').where('id', document!.id).first();
      expect(dbDocument).toBeDefined();
      expect(dbDocument).toMatchObject({
        name: docData.name,
        type: docData.type,
        slug: docData.slug,
        uploader_id: ADMIN_UUID,
        uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        active: true,
      });
    });

    it('should create a document with explicit uploader_id', async () => {
      const otherUserId = TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID;
      const docData = {
        name: 'Uploader Doc',
        type: 'test-type',
        slug: 'uploader-doc',
        uploader_id: toGlobalId('User', otherUserId),
      };
      const document = await DocumentDomain.createDocument(docData, []);
      expect(document).toBeDefined();

      expect(document!.uploader_id).toBe(otherUserId);
    });

    it('should create an inactive document', async () => {
      const docData = {
        name: 'Inactive Doc',
        type: 'test-type',
        slug: 'inactive-doc',
        active: false,
      };
      const document = await DocumentDomain.createDocument(docData, []);
      expect(document).toBeDefined();
      expect(document!.active).toBe(false);
    });

    it('should throw if required fields are missing', async () => {
      await expect(DocumentDomain.createDocument({}, [])).rejects.toThrow();
    });
  });

  describe('loadDocumentWithMetadataById', () => {
    it('should load a document with metadata keys', async () => {
      const [inserted] = await db('Document')
        .insert({
          name: 'DocMeta2',
          type: 'meta-type',
          slug: 'doc-meta2',
          uploader_id: ADMIN_UUID,
          uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
          active: true,
        })
        .returning('*');

      await db('Document_Metadata').insert({
        document_id: inserted.id,
        key: 'product_version',
        value: '1.2.3',
      });
      const loaded = await DocumentDomain.loadDocumentWithMetadataById(
        inserted.id,
        ['product_version']
      );
      expect(loaded).toBeDefined();
      expect(loaded).toMatchObject({
        id: inserted.id,
        name: 'DocMeta2',
        product_version: '1.2.3',
      });
    });

    it('should return undefined if document does not exist', async () => {
      const loaded = await DocumentDomain.loadDocumentWithMetadataById(
        '00000000-0000-0000-0000-000000000000'
      );
      expect(loaded).toBeUndefined();
    });
  });

  describe('loadUploader', () => {
    it('should return the user who uploaded document', async () => {
      const [inserted] = await db('Document')
        .insert({
          name: 'DocMeta2',
          type: 'meta-type',
          slug: 'doc-meta2',
          uploader_id: ADMIN_UUID,
          uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
          active: true,
        })
        .returning('*');

      const uploader = await DocumentDomain.loadUploader(inserted.id);

      expect(uploader).toBeDefined();
      expect(uploader!.id).toBe(ADMIN_UUID);
    });

    it('should return undefined when document does not exist', async () => {
      const uploader = await DocumentDomain.loadUploader(
        '00000000-0000-0000-0000-000000000000'
      );

      expect(uploader).toBeUndefined();
    });
  });

  describe('loadUploaderOrganization', () => {
    it('should return the organization which uploaded document', async () => {
      const inserted = await testCreateDocument();

      const uploaderOrganization =
        await DocumentDomain.loadUploaderOrganization(inserted.id);

      expect(uploaderOrganization).toBeDefined();
      expect(uploaderOrganization!.id).toBe(TEST_ORGANIZATIONS.FILIGRAN.ID);
    });

    it('should return undefined when document does not exist', async () => {
      const uploader = await DocumentDomain.loadUploaderOrganization(
        '00000000-0000-0000-0000-000000000000'
      );

      expect(uploader).toBeUndefined();
    });
  });

  describe('loadSeoDocumentsByServiceSlug', () => {
    const TEST_SERVICE_SLUG = 'opencti-integrations';
    const TEST_METADATA_KEY = 'seo_meta';
    const TEST_METADATA_VALUE = 'meta_value';

    let parentDoc: Document;
    let childDoc: Document;
    let inactiveDoc: Document;
    let otherServiceDoc: Document;

    beforeEach(async () => {
      await db('Document_Children').delete();
      await db('Document_Metadata').delete();
      await db('Document').delete();

      [parentDoc] = await db('Document')
        .insert({
          name: 'Parent SEO Doc',
          type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
          slug: 'parent-seo',
          uploader_id: ADMIN_UUID,
          uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
          service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
          active: true,
          created_at: new Date('2023-01-01T10:00:00Z'),
          updated_at: new Date('2023-01-02T10:00:00Z'),
        })
        .returning('*');

      [childDoc] = await db('Document')
        .insert({
          name: 'Child SEO Doc',
          type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
          slug: 'child-seo',
          uploader_id: ADMIN_UUID,
          uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
          service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
          active: true,
          created_at: new Date('2023-01-01T11:00:00Z'),
          updated_at: new Date('2023-01-02T11:00:00Z'),
        })
        .returning('*');
      await db('Document_Children').insert({
        parent_document_id: parentDoc.id,
        child_document_id: childDoc.id,
      });

      [inactiveDoc] = await db('Document')
        .insert({
          name: 'Inactive SEO Doc',
          type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
          slug: 'inactive-seo',
          uploader_id: ADMIN_UUID,
          uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
          service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
          active: false,
          created_at: new Date('2023-01-01T12:00:00Z'),
          updated_at: new Date('2023-01-02T12:00:00Z'),
        })
        .returning('*');

      [otherServiceDoc] = await db('Document')
        .insert({
          name: 'Other Service Doc',
          type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
          slug: 'other-service-doc',
          uploader_id: ADMIN_UUID,
          uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
          service_instance_id: SERVICES.INSTANCES.EPIC.ID,
          active: true,
          created_at: new Date('2023-01-01T13:00:00Z'),
          updated_at: new Date('2023-01-02T13:00:00Z'),
        })
        .returning('*');

      await db('Document_Metadata').insert({
        document_id: parentDoc.id,
        key: TEST_METADATA_KEY,
        value: TEST_METADATA_VALUE,
      });
    });

    it('should return only active parent documents for the given service slug and type', async () => {
      const docs = await DocumentDomain.loadSeoDocumentsByServiceSlug(
        OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        TEST_SERVICE_SLUG
      );

      expect(docs.length).toBe(1);
      expect(docs[0]).toMatchObject({
        id: parentDoc.id,
        active: true,
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
      });
    });

    it('should not return child, inactive, or other-service documents', async () => {
      const docs = await DocumentDomain.loadSeoDocumentsByServiceSlug(
        OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        TEST_SERVICE_SLUG
      );
      const ids = docs.map((d: Document) => d.id);
      expect(ids).not.toContain(childDoc.id);
      expect(ids).not.toContain(inactiveDoc.id);
      expect(ids).not.toContain(otherServiceDoc.id);
    });

    it('should order results by updated_at and created_at descending when orderResults is true', async () => {
      // Insert a second parent doc with later updated_at
      const [secondParent] = await db('Document')
        .insert({
          name: 'Second Parent',
          type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
          slug: 'second-parent',
          uploader_id: ADMIN_UUID,
          uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
          service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
          active: true,
          created_at: new Date('2023-01-01T14:00:00Z'),
          updated_at: new Date('2023-01-03T10:00:00Z'),
        })
        .returning('*');
      const docs = await DocumentDomain.loadSeoDocumentsByServiceSlug(
        OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        TEST_SERVICE_SLUG,
        [],
        true
      );
      expect(docs.length).toBe(2);
      expect(docs[0].id).toBe(secondParent.id);
      expect(docs[1].id).toBe(parentDoc.id);
    });

    it('should include metadata if requested', async () => {
      const docs = await DocumentDomain.loadSeoDocumentsByServiceSlug(
        OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        TEST_SERVICE_SLUG,
        [TEST_METADATA_KEY]
      );
      expect(docs.length).toBe(1);
      expect(docs[0][TEST_METADATA_KEY]).toBe(TEST_METADATA_VALUE);
    });

    it('should return empty array if no documents match', async () => {
      const docs = await DocumentDomain.loadSeoDocumentsByServiceSlug(
        'nonexistent-type',
        'nonexistent-slug'
      );
      expect(Array.isArray(docs)).toBe(true);
      expect(docs.length).toBe(0);
    });
  });
});
