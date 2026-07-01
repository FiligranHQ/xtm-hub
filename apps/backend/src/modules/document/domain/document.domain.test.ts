import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
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
  ServiceDefinitionIdentifier,
} from '../../../__generated__/resolvers-types';
import { OPENAEV_SCENARIO_DOCUMENT_TYPE } from '../../shareable-resource/openaev/scenario/scenario.model';
import { IngestManifestDomain } from '../../shareable-resource/opencti/integration/ingest-manifest/ingest-manifest.domain';
import { ManifestInformation } from '../../shareable-resource/opencti/integration/ingest-manifest/ingest-manifest.model';
import sampleExtractedManifest from '../../shareable-resource/opencti/integration/ingest-manifest/test/sample-extracted-manifest.json';
import {
  Connector,
  INTEGRATION_CONNECTOR_METADATA_KEYS,
  INTEGRATION_METADATA_KEYS,
  INTEGRATION_SERVICE_INSTANCE_ID,
  OPENCTI_INTEGRATION_DOCUMENT_TYPE,
} from '../../shareable-resource/opencti/integration/integration.model';

import { TestHelper } from '../../../../tests/helper/test.helper';
import { SERVICES, TEST_ORGANIZATIONS } from '../../../../tests/tests.const';
import Document from '../../../model/kanel/public/Document';
import { ObjectUseCaseObjectId } from '../../../model/kanel/public/ObjectUseCase';
import { UseCaseId } from '../../../model/kanel/public/UseCase';
import { ADMIN_UUID } from '../../../portal.const';
import { DocumentUploadsHelper } from '../document.uploads.helper';
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
    await TestHelper.document.delete({});
  });

  describe('deactivateDocuments', () => {
    let createdDocument: Document;
    beforeEach(async () => {
      createdDocument = await TestHelper.document.createWholeDocument({});
    });

    it('should do nothing when the document ids is an empty array', async () => {
      await DocumentDomain.deactivateDocuments([]);

      const document = await TestHelper.document.load({
        id: createdDocument.id,
      });

      expect(document).toMatchObject({
        active: true,
      });
    });

    it('should deactivate document and set remover id', async () => {
      await DocumentDomain.deactivateDocuments([createdDocument.id]);

      const document = await TestHelper.document.load({
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
      await TestHelper.document.delete({
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
      });

      csvFeed = await TestHelper.document.createWholeDocument({});
    });

    it('should return CSV Feeds along with connectors when fetching integration feeds', async () => {
      await IngestManifestDomain.upsertConnectors([
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
      const [connector] = await IngestManifestDomain.upsertConnectors([
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
        const connectors = await IngestManifestDomain.upsertConnectors(
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
        const connectors = await IngestManifestDomain.upsertConnectors(
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
        const connectors = await IngestManifestDomain.upsertConnectors(
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
        const connectors = await IngestManifestDomain.upsertConnectors(
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
      typeOfDocument      | overwriteField                                                   | expected
      ${'minimal fields'} | ${{}}                                                            | ${{}}
      ${'uploader id'}    | ${{ uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID }} | ${{ uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID }}
      ${'inactive'}       | ${{ active: false }}                                             | ${{ active: false }}
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
        const dbDocument = await TestHelper.document.load({
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
      const inserted = await TestHelper.document.create({
        name: 'DocMeta2',
        type: 'meta-type',
        slug: 'doc-meta2',
        uploader_id: ADMIN_UUID,
        uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        active: true,
      });

      await TestHelper.documentMetadata.create({
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

  describe('loadDocumentsWithMetadataByIds', () => {
    let doc1: Document;
    let doc2: Document;
    let doc3: Document;
    const TEST_KEY = DocumentMetadataKeyCode.ProductVersion;
    const TEST_VALUE = '2.0.0';

    beforeEach(async () => {
      await TestHelper.documentMetadata.delete({});
      await TestHelper.document.delete({});

      doc1 = await TestHelper.document.create({
        name: 'Doc One',
        slug: 'doc-one',
        uploader_id: ADMIN_UUID,
        uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        active: true,
      });
      doc2 = await TestHelper.document.create({
        name: 'Doc Two',
        slug: 'doc-two',
        uploader_id: ADMIN_UUID,
        uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        active: true,
      });
      doc3 = await TestHelper.document.create({
        name: 'Doc Three',
        slug: 'doc-three',
        uploader_id: ADMIN_UUID,
        uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        active: true,
      });

      await TestHelper.documentMetadata.create({
        document_id: doc1.id,
        key: TEST_KEY,
        value: TEST_VALUE,
      });
    });

    it.each`
      description                       | getIds                                                     | expectedLength | getExpectedIds
      ${'empty array (early return)'}   | ${() => []}                                                | ${0}           | ${() => []}
      ${'single matching id'}           | ${() => [doc1.id]}                                         | ${1}           | ${() => [doc1.id]}
      ${'multiple matching ids'}        | ${() => [doc1.id, doc2.id, doc3.id]}                       | ${3}           | ${() => [doc1.id, doc2.id, doc3.id]}
      ${'no matching id'}               | ${() => ['00000000-0000-0000-0000-000000000000']}          | ${0}           | ${() => []}
      ${'mix of valid and unknown ids'} | ${() => [doc1.id, '00000000-0000-0000-0000-000000000000']} | ${1}           | ${() => [doc1.id]}
    `(
      'should return $expectedLength document(s) for $description',
      async ({
        getIds,
        expectedLength,
        getExpectedIds,
      }: {
        getIds: () => string[];
        expectedLength: number;
        getExpectedIds: () => string[];
      }) => {
        const result =
          await DocumentDomain.loadDocumentsWithMetadataByIds(getIds());
        expect(result).toHaveLength(expectedLength);
        const resultIds = result.map((d) => d.id as string);
        for (const expectedId of getExpectedIds()) {
          expect(resultIds).toContain(expectedId);
        }
      }
    );

    const METADATA_ABSENT = 'METADATA_ABSENT' as const;

    it.each`
      description                | includeMetadata                             | expectedValue
      ${'no metadata requested'} | ${[]}                                       | ${METADATA_ABSENT}
      ${'metadata requested'}    | ${[DocumentMetadataKeyCode.ProductVersion]} | ${TEST_VALUE}
    `(
      'should handle metadata correctly when $description',
      async ({
        includeMetadata,
        expectedValue,
      }: {
        includeMetadata: DocumentMetadataKeyCode[];
        expectedValue: string;
      }) => {
        const result = await DocumentDomain.loadDocumentsWithMetadataByIds(
          [doc1.id],
          includeMetadata
        );
        expect(result).toHaveLength(1);
        const actual = (
          result[0] as unknown as Partial<
            Record<DocumentMetadataKeyCode, string>
          >
        )[TEST_KEY];
        expect(actual).toBe(
          expectedValue === METADATA_ABSENT ? undefined : expectedValue
        );
      }
    );
  });

  describe('loadUploader', () => {
    it('should return the user who uploaded document', async () => {
      const inserted = await TestHelper.document.create({
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
      const inserted = await TestHelper.document.createWholeDocument({});

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
      await TestHelper.documentChildren.delete({});
      await TestHelper.documentMetadata.delete({});
      await TestHelper.document.delete({});

      parentDoc = await TestHelper.document.create({
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
      childDoc = await TestHelper.document.create({
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
      await TestHelper.documentChildren.create({
        parent_document_id: parentDoc.id,
        child_document_id: childDoc.id,
      });

      inactiveDoc = await TestHelper.document.create({
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

      otherServiceDoc = await TestHelper.document.create({
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

      await TestHelper.documentMetadata.create({
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
      const secondParent = await TestHelper.document.create({
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
      await TestHelper.document.delete({});
      await TestHelper.documentMetadata.delete({});
      doc1 = await TestHelper.document.create();
      doc2 = await TestHelper.document.create({ slug: 'doc2-slug' });
      doc3 = await TestHelper.document.create({ slug: 'doc3-slug' });
      await TestHelper.documentMetadata.create({
        document_id: doc1.id,
        key: TEST_KEY,
        value: TEST_VALUE,
      });
      await TestHelper.documentMetadata.create({
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
      await TestHelper.documentMetadata.create({
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
      expect(
        (
          docs[0] as unknown as Partial<Record<DocumentMetadataKeyCode, string>>
        )[TEST_KEY]
      ).toBe(TEST_VALUE);
    });

    describe('when documentFilters are provided', () => {
      it.each`
        description                             | filters                        | expectedCount
        ${'active: true — matches'}             | ${{ active: true }}            | ${1}
        ${'active: false — excludes'}           | ${{ active: false }}           | ${0}
        ${'is_decommissioned: true — excludes'} | ${{ is_decommissioned: true }} | ${0}
      `(
        'should apply scalar filter: $description',
        async ({
          filters,
          expectedCount,
        }: {
          filters: Partial<Document>;
          expectedCount: number;
        }) => {
          const docs = await DocumentDomain.loadDocumentsByMetadata(
            TEST_KEY,
            TEST_VALUE,
            [],
            filters
          );
          expect(docs).toHaveLength(expectedCount);
        }
      );

      it('should return document when tag matches', async () => {
        await TestHelper.document.update({ id: doc1.id }, { tags: ['latest'] });

        const docs = await DocumentDomain.loadDocumentsByMetadata(
          TEST_KEY,
          TEST_VALUE,
          [],
          { tags: ['latest'] }
        );
        expect(docs).toHaveLength(1);
        expect(docs[0]!.id).toBe(doc1.id);
      });

      it('should return no results when tag does not match', async () => {
        await TestHelper.document.update({ id: doc1.id }, { tags: ['latest'] });

        const docs = await DocumentDomain.loadDocumentsByMetadata(
          TEST_KEY,
          TEST_VALUE,
          [],
          { tags: ['latest_lts'] }
        );
        expect(docs).toHaveLength(0);
      });

      it.each`
        doc1Tags          | doc1Active | filterTags    | filterActive | expectedCount | description
        ${['latest']}     | ${true}    | ${['latest']} | ${true}      | ${1}          | ${'tag matches, active matches'}
        ${['latest']}     | ${false}   | ${['latest']} | ${true}      | ${0}          | ${'tag matches, active does not match'}
        ${['latest_lts']} | ${true}    | ${['latest']} | ${true}      | ${0}          | ${'tag does not match, active matches'}
        ${['latest_lts']} | ${false}   | ${['latest']} | ${true}      | ${0}          | ${'nothing matches'}
      `(
        'should combine tag and scalar filters: $description',
        async ({
          doc1Tags,
          doc1Active,
          filterTags,
          filterActive,
          expectedCount,
        }: {
          doc1Tags: string[];
          doc1Active: boolean;
          filterTags: string[];
          filterActive: boolean;
          expectedCount: number;
        }) => {
          await TestHelper.document.update(
            { id: doc1.id },
            { tags: doc1Tags, active: doc1Active }
          );

          const docs = await DocumentDomain.loadDocumentsByMetadata(
            TEST_KEY,
            TEST_VALUE,
            [],
            { active: filterActive, tags: filterTags }
          );
          expect(docs).toHaveLength(expectedCount);
        }
      );
    });
  });

  describe('loadDocumentBy', () => {
    it('should return a document when it exists', async () => {
      // Given
      const doc = await TestHelper.document.create();

      // When
      const result = await DocumentDomain.loadDocumentBy({ id: doc.id });

      // Then
      expect(result).toMatchObject({ id: doc.id, type: 'image' });
    });

    it('should return undefined when document is not found', async () => {
      // Given
      const nonExistentId = '00000000-0000-0000-0000-000000000001';

      // When
      const result = await DocumentDomain.loadDocumentBy({
        id: nonExistentId as Document['id'],
      });

      // Then
      expect(result).toBeUndefined();
    });

    it('should filter by multiple fields', async () => {
      // Given
      const doc = await TestHelper.document.create({ active: true });

      // When
      const resultFound = await DocumentDomain.loadDocumentBy({
        id: doc.id,
        active: true,
      });
      const resultNotFound = await DocumentDomain.loadDocumentBy({
        id: doc.id,
        active: false,
      });

      // Then
      expect(resultFound).toMatchObject({ id: doc.id });
      expect(resultNotFound).toBeUndefined();
    });
  });

  describe('loadNewestDocuments', () => {
    beforeEach(async () => {
      await TestHelper.documentChildren.delete({});
      await TestHelper.documentMetadata.delete({});
      await TestHelper.document.delete({});
    });

    it('should return active documents sorted by creation date newest first', async () => {
      // Given
      const olderDoc = await TestHelper.document.create({
        name: 'Older document',
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        slug: 'older-document',
        uploader_id: ADMIN_UUID,
        uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        active: true,
        created_at: new Date('2024-01-01T10:00:00Z'),
      });
      const newerDoc = await TestHelper.document.create({
        name: 'Newer document',
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        slug: 'newer-document',
        uploader_id: ADMIN_UUID,
        uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        active: true,
        created_at: new Date('2025-01-01T10:00:00Z'),
      });

      // When
      const result = await DocumentDomain.loadNewestDocuments(10);

      // Then
      expect(result[0]?.id).toBe(newerDoc.id);
      expect(result[1]?.id).toBe(olderDoc.id);
    });

    it('should exclude inactive documents', async () => {
      // Given
      const activeDoc = await TestHelper.document.create({
        name: 'Active document',
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        slug: 'active-document',
        uploader_id: ADMIN_UUID,
        uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        active: true,
      });
      await TestHelper.document.create({
        name: 'Inactive document',
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        slug: 'inactive-document',
        uploader_id: ADMIN_UUID,
        uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        active: false,
      });

      // When
      const result = await DocumentDomain.loadNewestDocuments(10);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe(activeDoc.id);
    });

    it('should filter documents by serviceDefinitionIdentifiers', async () => {
      // Given
      const integrationDoc = await TestHelper.document.create({
        name: 'Integration document',
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        slug: 'integration-document',
        uploader_id: ADMIN_UUID,
        uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        active: true,
      });
      await TestHelper.document.create({
        name: 'Scenario document',
        type: OPENAEV_SCENARIO_DOCUMENT_TYPE,
        slug: 'scenario-document',
        uploader_id: ADMIN_UUID,
        uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: SERVICES.INSTANCES.OPENAEV_SCENARIOS.ID,
        active: true,
      });

      // When
      const result = await DocumentDomain.loadNewestDocuments(
        10,
        [],
        [ServiceDefinitionIdentifier.OpenctiIntegrations]
      );

      // Then
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe(integrationDoc.id);
    });
  });

  describe('search by use case name', () => {
    let docWithThreatHunting: Document;
    let docWithIncidentResponse: Document;
    let threatHuntingUseCaseId: UseCaseId;
    let incidentResponseUseCaseId: UseCaseId;

    beforeAll(async () => {
      // Use cases are not wiped by the outer beforeEach, so create them once.
      const uc1 = await TestHelper.useCase.create({
        name: 'threat-hunting-label',
        color: '#ff0000',
      });
      const uc2 = await TestHelper.useCase.create({
        name: 'incident-response-label',
        color: '#0000ff',
      });
      threatHuntingUseCaseId = uc1.id;
      incidentResponseUseCaseId = uc2.id;
    });

    beforeEach(async () => {
      docWithThreatHunting = await TestHelper.document.create({
        slug: 'doc-alpha-uc-search',
        name: 'doc-alpha-uc-search',
        active: true,
        uploader_id: ADMIN_UUID,
        uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
      });
      docWithIncidentResponse = await TestHelper.document.create({
        slug: 'doc-beta-uc-search',
        name: 'doc-beta-uc-search',
        active: true,
        uploader_id: ADMIN_UUID,
        uploader_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
      });
      await TestHelper.objectUseCase.insert([
        {
          object_id:
            docWithThreatHunting.id as unknown as ObjectUseCaseObjectId,
          use_case_id: threatHuntingUseCaseId,
        },
        {
          object_id:
            docWithIncidentResponse.id as unknown as ObjectUseCaseObjectId,
          use_case_id: incidentResponseUseCaseId,
        },
      ]);
    });

    afterAll(async () => {
      await TestHelper.objectUseCase.delete({
        use_case_id: threatHuntingUseCaseId,
      });
      await TestHelper.objectUseCase.delete({
        use_case_id: incidentResponseUseCaseId,
      });
      await TestHelper.useCase.delete({ id: threatHuntingUseCaseId });
      await TestHelper.useCase.delete({ id: incidentResponseUseCaseId });
    });

    it.each`
      description                                   | searchTerm                   | expectedCount | getExpectedId
      ${'exact use case name match'}                | ${'threat-hunting-label'}    | ${1}          | ${() => docWithThreatHunting.id}
      ${'partial use case name match'}              | ${'hunting-label'}           | ${1}          | ${() => docWithThreatHunting.id}
      ${'case-insensitive use case name match'}     | ${'THREAT-HUNTING-LABEL'}    | ${1}          | ${() => docWithThreatHunting.id}
      ${'no match returns no test documents'}       | ${'no-match-label-zzz'}      | ${0}          | ${() => null}
      ${'other use case does not leak into result'} | ${'incident-response-label'} | ${1}          | ${() => docWithIncidentResponse.id}
    `(
      'should return $expectedCount test document(s) when searching "$searchTerm" ($description)',
      async ({
        searchTerm,
        expectedCount,
        getExpectedId,
      }: {
        searchTerm: string;
        expectedCount: number;
        getExpectedId: () => string | null;
      }) => {
        const result = await DocumentDomain.loadDocuments(
          {
            searchTerm,
            first: 100,
            orderBy: DocumentOrdering.CreatedAt,
            orderMode: OrderingMode.Desc,
          },
          {}
        );

        const ids = result.edges.map((e) => e.node.id as string);

        expect(ids).toHaveLength(expectedCount);
        if (expectedCount > 0) {
          expect(ids).toContain(getExpectedId());
        }
      }
    );
  });
});
