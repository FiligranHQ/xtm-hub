import { toGlobalId } from 'graphql-relay/node/node.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DocumentConnection,
  DocumentMetadataKeyCode,
  DocumentOrdering,
  FilterKey,
  Integration,
  IntegrationSubType,
  IntegrationType,
  LogicalOperator,
  OrderingMode,
} from '../../../__generated__/resolvers-types';
import { upsertConnectors } from '../../shareable-resource/opencti/integration/ingest-manifest/ingest-manifest.domain';
import { ManifestInformation } from '../../shareable-resource/opencti/integration/ingest-manifest/ingest-manifest.model';
import sampleExtractedManifest from '../../shareable-resource/opencti/integration/ingest-manifest/test/sample-extracted-manifest.json';
import {
  Connector,
  INTEGRATION_CONNECTOR_METADATA_KEYS,
  INTEGRATION_METADATA_KEYS,
  INTEGRATION_SERVICE_INSTANCE_ID,
  OPENCTI_INTEGRATION_DOCUMENT_TYPE,
} from '../../shareable-resource/opencti/integration/integration.model';

import { TestDocumentHelper } from '../../../../tests/helper/test.document.helper';
import { SERVICES, TEST_ORGANIZATIONS } from '../../../../tests/tests.const';
import Document from '../../../model/kanel/public/Document';
import { ADMIN_UUID } from '../../../portal.const';
import * as DocumentUploadsHelper from '../document.uploads.helper';
import { DocumentDomain } from './document.domain';

describe('document domain', () => {
  const minioFileMock = {
    minioName: 'minioFile',
    mimeType: 'mimeType',
    fileName: 'filename',
  };

  beforeEach(async () => {
    vi.spyOn(DocumentUploadsHelper, 'processUploads').mockResolvedValue([
      minioFileMock,
    ]);
    await TestDocumentHelper.document.delete({});
  });

  describe('deactivateDocuments', () => {
    let createdDocument: Document;
    beforeEach(async () => {
      createdDocument = await TestDocumentHelper.document.createWholeDocument(
        {}
      );
    });

    it('should do nothing when the document ids is an empty array', async () => {
      await DocumentDomain.deactivateDocuments([]);

      const document = await TestDocumentHelper.document.load({
        id: createdDocument.id,
      });

      expect(document).toMatchObject({
        active: true,
      });
    });

    it('should deactivate document and set remover id', async () => {
      await DocumentDomain.deactivateDocuments([createdDocument.id]);

      const document = await TestDocumentHelper.document.load({
        id: createdDocument.id,
      });

      expect(document).toMatchObject({
        active: false,
        remover_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID,
      });
    });
  });

  describe(`loadParentDocumentsByServiceInstance`, () => {
    let csvFeed: Document;
    beforeEach(async () => {
      await TestDocumentHelper.document.delete({
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
      });

      csvFeed = await TestDocumentHelper.document.createWholeDocument({});
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
            serviceInstanceId: INTEGRATION_SERVICE_INSTANCE_ID,
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
            serviceInstanceId: INTEGRATION_SERVICE_INSTANCE_ID,
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

      expect(csvFeedConnection.edges).toHaveLength(1);
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
            serviceInstanceId: INTEGRATION_SERVICE_INSTANCE_ID,
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

      expect(connectorConnection.edges).toHaveLength(1);
      expect(connectorConnection.edges[0]?.node).toMatchObject({
        id: connector?.id,
        integration_type: IntegrationType.Connector,
      });

      // fetch both
      const integrationConnection: DocumentConnection =
        await DocumentDomain.loadParentDocumentsByServiceInstance(
          OPENCTI_INTEGRATION_DOCUMENT_TYPE,
          {
            orderBy: DocumentOrdering.CreatedAt,
            orderMode: OrderingMode.Desc,
            first: 10,
            serviceInstanceId: INTEGRATION_SERVICE_INSTANCE_ID,
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

      expect(integrationConnection.edges).toHaveLength(2);
    });

    describe('multiple filters', () => {
      it('should handle type and version', async () => {
        const connectors = await upsertConnectors(
          sampleExtractedManifest as ManifestInformation[]
        );

        expect(connectors).toHaveLength(2);

        // Fetch connectors with version
        const connectorConnection: { edges: { node: Integration }[] } =
          await DocumentDomain.loadParentDocumentsByServiceInstance(
            OPENCTI_INTEGRATION_DOCUMENT_TYPE,
            {
              orderBy: DocumentOrdering.CreatedAt,
              orderMode: OrderingMode.Desc,
              first: 10,
              serviceInstanceId: INTEGRATION_SERVICE_INSTANCE_ID,
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

        expect(connectorConnection.edges).toHaveLength(1);
        expect(connectorConnection.edges[0]?.node).toMatchObject({
          id: connectors[0]?.id,
          integration_type: IntegrationType.Connector,
        });
      });

      it('should handle type and subtype', async () => {
        const connectors = await upsertConnectors(
          sampleExtractedManifest as ManifestInformation[]
        );

        expect(connectors).toHaveLength(2);

        // Fetch connectors with version
        const connectorConnection: DocumentConnection =
          await DocumentDomain.loadParentDocumentsByServiceInstance(
            OPENCTI_INTEGRATION_DOCUMENT_TYPE,
            {
              orderBy: DocumentOrdering.CreatedAt,
              orderMode: OrderingMode.Desc,
              first: 10,
              serviceInstanceId: INTEGRATION_SERVICE_INSTANCE_ID,
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

        expect(connectorConnection.edges).toHaveLength(2);

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
        expect(connectors).toHaveLength(2);

        const secondContractConnection: DocumentConnection =
          await DocumentDomain.loadParentDocumentsByServiceInstance(
            OPENCTI_INTEGRATION_DOCUMENT_TYPE,
            {
              orderBy: DocumentOrdering.CreatedAt,
              orderMode: OrderingMode.Desc,
              first: 10,
              serviceInstanceId: INTEGRATION_SERVICE_INSTANCE_ID,
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

        expect(secondContractConnection.edges).toHaveLength(2);
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
        expect(connectors).toHaveLength(2);

        const allContractsConnection: DocumentConnection =
          await DocumentDomain.loadParentDocumentsByServiceInstance(
            OPENCTI_INTEGRATION_DOCUMENT_TYPE,
            {
              orderBy: DocumentOrdering.CreatedAt,
              orderMode: OrderingMode.Desc,
              first: 10,
              serviceInstanceId: INTEGRATION_SERVICE_INSTANCE_ID,
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

        expect(allContractsConnection.edges).toHaveLength(3);
      });
    });
  });

  describe('createDocument', () => {
    it.each`
      typeOfDocument      | overwriteField                                                                       | expected
      ${'minimal fields'} | ${{}}                                                                                | ${{}}
      ${'uploader id'}    | ${{ uploader_id: toGlobalId('User', TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID) }} | ${{ uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID }}
      ${'inactive'}       | ${{ active: false }}                                                                 | ${{ active: false }}
    `(
      'it should create a document with $typeOfDocument',
      async ({ typeOfDocument, overwriteField, expected }) => {
        // Given
        const docData = {
          name: typeOfDocument,
          slug: typeOfDocument.toLowerCase().replace(/\s/g, '-'),
          type: 'test-type',
          ...overwriteField,
        };

        // When
        const document = await DocumentDomain.createDocument(docData, []);
        const dbDocument = await TestDocumentHelper.document.load({
          id: document!.id,
        });

        // Then
        const baseExpected = {
          name: docData.name,
          type: docData.type,
          slug: docData.slug,
          uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID,
          uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
          active: true,
        };

        const expectedDocument = {
          ...baseExpected,
          ...expected,
        };
        expect(document).toMatchObject(expectedDocument);
        expect(dbDocument).toMatchObject(expectedDocument);
      }
    );

    it('should throw if required fields are missing', async () => {
      await expect(DocumentDomain.createDocument({}, [])).rejects.toThrow();
    });
  });

  describe('loadDocumentWithMetadataById', () => {
    it('should load a document with metadata keys', async () => {
      const inserted = await TestDocumentHelper.document.create({
        name: 'DocMeta2',
        type: 'meta-type',
        slug: 'doc-meta2',
        uploader_id: ADMIN_UUID,
        uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        active: true,
      });

      await TestDocumentHelper.documentMetadata.create({
        document_id: inserted.id,
        key: DocumentMetadataKeyCode.ProductVersion,
        value: '1.2.3',
      });
      const loaded = await DocumentDomain.loadDocumentWithMetadataById(
        inserted.id,
        [DocumentMetadataKeyCode.ProductVersion]
      );
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
      const inserted = await TestDocumentHelper.document.create({
        name: 'DocMeta2',
        type: 'meta-type',
        slug: 'doc-meta2',
        uploader_id: ADMIN_UUID,
        uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        active: true,
      });

      const uploader = await DocumentDomain.loadUploader(inserted.id);

      expect(uploader).toMatchObject({
        id: ADMIN_UUID,
      });
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
      const inserted = await TestDocumentHelper.document.createWholeDocument(
        {}
      );

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
    const TEST_METADATA_KEY = DocumentMetadataKeyCode.FeedUrl;
    const TEST_METADATA_VALUE = 'meta_value';

    let parentDoc: Document;
    let childDoc: Document;
    let inactiveDoc: Document;
    let otherServiceDoc: Document;

    beforeEach(async () => {
      await TestDocumentHelper.documentChildren.delete({});
      await TestDocumentHelper.documentMetadata.delete({});
      await TestDocumentHelper.document.delete({});

      parentDoc = await TestDocumentHelper.document.create({
        name: 'Parent SEO Doc',
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        slug: 'parent-seo',
        uploader_id: ADMIN_UUID,
        uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        active: true,
        created_at: new Date('2023-01-01T10:00:00Z'),
        updated_at: new Date('2023-01-02T10:00:00Z'),
      });
      childDoc = await TestDocumentHelper.document.create({
        name: 'Child SEO Doc',
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        slug: 'child-seo',
        uploader_id: ADMIN_UUID,
        uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        active: true,
        created_at: new Date('2023-01-01T11:00:00Z'),
        updated_at: new Date('2023-01-02T11:00:00Z'),
      });
      await TestDocumentHelper.documentChildren.create({
        parent_document_id: parentDoc.id,
        child_document_id: childDoc.id,
      });

      inactiveDoc = await TestDocumentHelper.document.create({
        name: 'Inactive SEO Doc',
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        slug: 'inactive-seo',
        uploader_id: ADMIN_UUID,
        uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        active: false,
        created_at: new Date('2023-01-01T12:00:00Z'),
        updated_at: new Date('2023-01-02T12:00:00Z'),
      });

      otherServiceDoc = await TestDocumentHelper.document.create({
        name: 'Other Service Doc',
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        slug: 'other-service-doc',
        uploader_id: ADMIN_UUID,
        uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: SERVICES.INSTANCES.EPIC.ID,
        active: true,
        created_at: new Date('2023-01-01T13:00:00Z'),
        updated_at: new Date('2023-01-02T13:00:00Z'),
      });

      await TestDocumentHelper.documentMetadata.create({
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

      expect(docs).toHaveLength(1);
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
      const secondParent = await TestDocumentHelper.document.create({
        name: 'Second Parent',
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        slug: 'second-parent',
        uploader_id: ADMIN_UUID,
        uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        active: true,
        created_at: new Date('2023-01-01T14:00:00Z'),
        updated_at: new Date('2023-01-03T10:00:00Z'),
      });
      const docs = await DocumentDomain.loadSeoDocumentsByServiceSlug(
        OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        TEST_SERVICE_SLUG,
        [],
        true
      );
      expect(docs).toHaveLength(2);
      expect(docs[0].id).toBe(secondParent.id);
      expect(docs[1].id).toBe(parentDoc.id);
    });

    it('should include metadata if requested', async () => {
      const docs = await DocumentDomain.loadSeoDocumentsByServiceSlug(
        OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        TEST_SERVICE_SLUG,
        [TEST_METADATA_KEY]
      );
      expect(docs).toHaveLength(1);
      expect(docs[0][TEST_METADATA_KEY]).toBe(TEST_METADATA_VALUE);
    });

    it('should return empty array if no documents match', async () => {
      const docs = await DocumentDomain.loadSeoDocumentsByServiceSlug(
        'nonexistent-type',
        'nonexistent-slug'
      );
      expect(Array.isArray(docs)).toBe(true);
      expect(docs).toHaveLength(0);
    });
  });

  describe('loadDocumentsByMetadata', () => {
    let doc1: Document;
    let doc2: Document;
    let doc3: Document;
    const TEST_KEY = DocumentMetadataKeyCode.ProductVersion;
    const TEST_VALUE = 'test_value';
    const OTHER_VALUE = 'other_value';

    beforeEach(async () => {
      await TestDocumentHelper.document.delete({});
      await TestDocumentHelper.documentMetadata.delete({});
      doc1 = await TestDocumentHelper.document.create();
      doc2 = await TestDocumentHelper.document.create({ slug: 'doc2-slug' });
      doc3 = await TestDocumentHelper.document.create({ slug: 'doc3-slug' });
      await TestDocumentHelper.documentMetadata.create({
        document_id: doc1.id,
        key: TEST_KEY,
        value: TEST_VALUE,
      });
      await TestDocumentHelper.documentMetadata.create({
        document_id: doc2.id,
        key: TEST_KEY,
        value: OTHER_VALUE,
      });
    });

    it('should return documents matching the metadata key and value', async () => {
      const docs = await DocumentDomain.loadDocumentsByMetadata(
        TEST_KEY,
        TEST_VALUE
      );
      expect(Array.isArray(docs)).toBe(true);
      expect(docs).toHaveLength(1);
      expect(docs[0]!.id).toBe(doc1.id);
    });

    it('should return multiple documents if multiple match', async () => {
      await TestDocumentHelper.documentMetadata.create({
        document_id: doc3.id,
        key: TEST_KEY,
        value: TEST_VALUE,
      });
      const docs = await DocumentDomain.loadDocumentsByMetadata(
        TEST_KEY,
        TEST_VALUE
      );
      expect(docs).toHaveLength(2);
      const ids = docs.map((d) => d.id);
      expect(ids).toContain(doc1.id);
      expect(ids).toContain(doc3.id);
    });

    it('should return empty array if no documents match', async () => {
      const docs = await DocumentDomain.loadDocumentsByMetadata(
        TEST_KEY,
        'nonexistent'
      );
      expect(Array.isArray(docs)).toBe(true);
      expect(docs).toHaveLength(0);
    });

    it('should include requested metadata fields', async () => {
      const docs = await DocumentDomain.loadDocumentsByMetadata(
        TEST_KEY,
        TEST_VALUE,
        [TEST_KEY]
      );
      expect(docs).toHaveLength(1);
      expect((docs[0] as unknown as { [TEST_KEY]: string })[TEST_KEY]).toBe(
        TEST_VALUE
      );
    });
  });
});
