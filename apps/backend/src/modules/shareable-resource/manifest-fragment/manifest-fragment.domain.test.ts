import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { TestHelper } from '../../../../tests/helper/test.helper';
import {
  DocumentMetadataKeyCode,
  DocumentSourceType,
  ManifestType,
  PortalCapability,
  type ManifestFragmentInput,
} from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import type { DocumentId } from '../../../model/kanel/public/Document';
import type { DocumentMetadataKey } from '../../../model/kanel/public/DocumentMetadata';
import { ObjectSolutionCategoryObjectId } from '../../../model/kanel/public/ObjectSolutionCategory';
import { SYSTEM_USER_CONTEXT } from '../../../portal.const';
import { minioInit } from '../../../server/initialize';
import { BadRequestErrorCode } from '../../../utils/error/error.code';
import {
  INTEGRATION_SERVICE_INSTANCE_ID,
  OPENCTI_INTEGRATION_DOCUMENT_TYPE,
} from '../opencti/integration/integration.model';
import { ManifestFragmentDomain } from './manifest-fragment.domain';

const SEEDED_SOLUTION_CATEGORY_ID = '8d121337-1a45-4b8b-ba73-f4e879c2e16a';
const SEEDED_SOLUTION_CATEGORY_NAME = 'SolutionCategory';
describe('manifestFragmentDomain', () => {
  beforeAll(async () => {
    await minioInit();
  });

  let _createdDocumentIds: string[] = [];
  const _manifestIngestionUser = {
    ...SYSTEM_USER_CONTEXT.user,
    capabilities: [
      {
        id: 'manifest-ingestions-capability' as never,
        name: PortalCapability.ManageManifestIngestions,
      },
    ],
  };

  beforeEach(() => {
    requestContext.set({
      user: _manifestIngestionUser,
    });
  });

  afterEach(async () => {
    if (_createdDocumentIds.length === 0) {
      return;
    }

    for (const documentId of _createdDocumentIds) {
      await TestHelper.documentMetadata.delete({
        document_id: documentId as DocumentId,
      });
      await TestHelper.document.delete({ id: documentId as DocumentId });
    }

    _createdDocumentIds = [];
  });

  const buildManifestFragment = (
    integrationType: string,
    {
      slug = 'misp',
      id = 'abc123',
      version = '7.260309.0-lts.5',
    }: {
      slug?: string;
      id?: string;
      version?: string;
    } = {}
  ): ManifestFragmentInput => {
    return {
      id,
      title: 'MISP',
      slug,
      description:
        'The MISP connector imports threat intelligence from MISP instances into OpenCTI.',
      short_description:
        'Import threat intelligence events, indicators, and observables from MISP instances.',
      logo: 'SGVsbG8sIFdvcmxkIQ==',
      use_cases: ['Open Source Threat Intel'],
      verified: true,
      last_verified_date: '2025-01-01',
      subscription_link: 'https://www.misp-project.org',
      source_code:
        'https://github.com/OpenCTI-Platform/connectors/tree/master/external-import/misp',
      manager_supported: true,
      min_version: '7.260507.0',
      version,
      image_name: 'opencti/connector-misp',
      image_type: 'EXTERNAL_IMPORT',
      platform: 'OpenCTI',
      integration_type: integrationType,
      license_type: 'Commercial',
      contact: 'https://github.com/some-contributor',
      additional_properties: {
        max_confidence_level: 50,
      },
      config_schema: {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        $id: 'https://www.filigran.io/connectors/misp_config.schema.json',
        type: 'object',
        required: ['OPENCTI_URL', 'OPENCTI_TOKEN'],
        properties: {
          OPENCTI_URL: {
            type: 'string',
            format: 'uri',
            description: 'The base URL of the OpenCTI instance.',
          },
          OPENCTI_TOKEN: {
            type: 'string',
            description: 'The API token to connect to OpenCTI.',
          },
        },
        additionalProperties: true,
      },
    };
  };

  describe('ingestManifestFragment', () => {
    it('accepts a fragment when integration_type is connector', async () => {
      // Given
      const slug = 'misp-integration';
      const fragment = buildManifestFragment(ManifestType.Connector, { slug });

      // When
      await ManifestFragmentDomain.ingestManifestFragment(fragment);

      // Then
      const createdDocument = await TestHelper.document.load({ slug });
      _createdDocumentIds.push(createdDocument!.id);

      expect(createdDocument).toMatchObject({
        name: 'MISP',
        slug,
        description:
          'The MISP connector imports threat intelligence from MISP instances into OpenCTI.',
        short_description:
          'Import threat intelligence events, indicators, and observables from MISP instances.',
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        source_type: DocumentSourceType.External,
        service_instance_id: INTEGRATION_SERVICE_INSTANCE_ID,
        version: '7.260309.0-lts.5',
      });
      expect(createdDocument!.tags).toContain('decoupling');
      expect(createdDocument!.tags).toContain('latest-lts');

      const metadataRows = await TestHelper.documentMetadata.loadAll({
        document_id: createdDocument!.id,
      });

      const metadataByKey = new Map(
        metadataRows.map((metadata) => [metadata.key as string, metadata.value])
      );
      expect(metadataByKey.get(DocumentMetadataKeyCode.ImageName)).toBe(
        'opencti/connector-misp'
      );
      expect(metadataByKey.get(DocumentMetadataKeyCode.ImageType)).toBe(
        'EXTERNAL_IMPORT'
      );
      expect(
        metadataByKey.get(DocumentMetadataKeyCode.ManifestFragmentId)
      ).toBe(fragment.id);
      expect(metadataByKey.get(DocumentMetadataKeyCode.Verified)).toBe(
        String(fragment.verified)
      );
      expect(metadataByKey.get(DocumentMetadataKeyCode.LastVerifiedDate)).toBe(
        fragment.last_verified_date
      );
      expect(metadataByKey.get(DocumentMetadataKeyCode.IntegrationType)).toBe(
        fragment.integration_type
      );
      expect(metadataByKey.get(DocumentMetadataKeyCode.SourceCode)).toBe(
        fragment.source_code
      );
      expect(metadataByKey.get(DocumentMetadataKeyCode.ManagerSupported)).toBe(
        String(fragment.manager_supported)
      );
      expect(
        metadataByKey.get(DocumentMetadataKeyCode.MinimumDeployableVersion)
      ).toBe(fragment.min_version);
      expect(
        metadataByKey.get(
          DocumentMetadataKeyCode.MinimumDeployableVersionPadded
        )
      ).toBe('007.260507.000');
      expect(metadataByKey.get(DocumentMetadataKeyCode.VersionPadded)).toBe(
        '007.260309.000.LTS.005'
      );
      expect(
        metadataByKey.get(DocumentMetadataKeyCode.AdditionalProperties)
      ).toBe(JSON.stringify(fragment.additional_properties));
      expect(metadataByKey.get(DocumentMetadataKeyCode.ConfigSchema)).toBe(
        JSON.stringify(fragment.config_schema)
      );
      expect(metadataByKey.get(DocumentMetadataKeyCode.LicenseType)).toBe(
        fragment.license_type
      );
      expect(metadataByKey.get(DocumentMetadataKeyCode.Contact)).toBe(
        fragment.contact
      );
    });

    it('does not store a contact when the fragment leaves it empty', async () => {
      // Given a Filigran-supported integration, which carries no contact
      const slug = 'misp-without-contact';
      const fragment = buildManifestFragment(ManifestType.Connector, { slug });
      fragment.contact = undefined;

      // When
      await ManifestFragmentDomain.ingestManifestFragment(fragment);

      // Then
      const createdDocument = await TestHelper.document.load({ slug });
      _createdDocumentIds.push(createdDocument!.id);

      const metadataRows = await TestHelper.documentMetadata.loadAll({
        document_id: createdDocument!.id,
      });
      const metadataByKey = new Map(
        metadataRows.map((metadata) => [metadata.key as string, metadata.value])
      );
      expect(metadataByKey.get(DocumentMetadataKeyCode.Contact)).toBeNull();
    });

    it('links the fragment solution categories to the created connector', async () => {
      // Given the seeded category, scoped to opencti
      const slug = 'misp-with-categories';
      const fragment = buildManifestFragment(ManifestType.Connector, { slug });
      fragment.solution_categories = [SEEDED_SOLUTION_CATEGORY_NAME];
      // When the fragment is ingested, its platform being 'OpenCTI' in mixed case
      await ManifestFragmentDomain.ingestManifestFragment(fragment);

      // Then the category is linked, so the product lookup is case-insensitive
      const createdDocument = await TestHelper.document.load({ slug });
      _createdDocumentIds.push(createdDocument!.id);

      const links = await TestHelper.objectSolutionCategory.load({
        object_id: createdDocument!
          .id as unknown as ObjectSolutionCategoryObjectId,
      });
      expect(links).toHaveLength(1);
      expect(links[0]!.solution_category_id).toBe(SEEDED_SOLUTION_CATEGORY_ID);
    });

    it('ignores an unknown solution category and still links the known one', async () => {
      // Given a fragment declaring one seeded category and one that does not exist
      const slug = 'misp-unknown-category';
      const fragment = buildManifestFragment(ManifestType.Connector, { slug });
      fragment.solution_categories = [
        SEEDED_SOLUTION_CATEGORY_NAME,
        'Quantum Threat Divination',
      ];
      // When the fragment is ingested
      await ManifestFragmentDomain.ingestManifestFragment(fragment);

      // Then the ingestion succeeds and only the known category is linked
      const createdDocument = await TestHelper.document.load({ slug });
      _createdDocumentIds.push(createdDocument!.id);

      const links = await TestHelper.objectSolutionCategory.load({
        object_id: createdDocument!
          .id as unknown as ObjectSolutionCategoryObjectId,
      });
      expect(links).toHaveLength(1);
      expect(links[0]!.solution_category_id).toBe(SEEDED_SOLUTION_CATEGORY_ID);
    });

    it('throws when integration_type is not connector', async () => {
      // Given
      const slug = 'misp-invalid';
      const fragment = buildManifestFragment('third_party_integration', {
        slug,
      });

      // When
      const call = ManifestFragmentDomain.ingestManifestFragment(fragment);

      // Then
      await expect(call).rejects.toThrow(
        BadRequestErrorCode.IntegrationTypeNotRecognized
      );

      const createdDocument = await TestHelper.document.load({ slug });
      expect(createdDocument).toBeUndefined();
    });

    it('throws when min_version format is invalid', async () => {
      // Given
      const slug = 'misp-invalid-min-version';
      const fragment = buildManifestFragment(ManifestType.Connector, {
        slug,
      });
      fragment.min_version = '>= 7.260507.0';

      // When
      const call = ManifestFragmentDomain.ingestManifestFragment(fragment);

      // Then
      await expect(call).rejects.toThrow(
        BadRequestErrorCode.InvalidManifestVersionFormat
      );

      const createdDocument = await TestHelper.document.load({ slug });
      expect(createdDocument).toBeUndefined();
    });

    it('throws when short_description is longer than 250 characters', async () => {
      // Given
      const slug = 'misp-invalid-short-description';
      const fragment = buildManifestFragment(ManifestType.Connector, {
        slug,
      });
      fragment.short_description = 'a'.repeat(251);

      // When
      const call = ManifestFragmentDomain.ingestManifestFragment(fragment);

      // Then
      await expect(call).rejects.toThrow(
        BadRequestErrorCode.ShortDescriptionTooLong
      );

      const createdDocument = await TestHelper.document.load({ slug });
      expect(createdDocument).toBeUndefined();
    });

    it('throws when license_type is not an allowed value', async () => {
      // Given
      const slug = 'misp-invalid-license-type';
      const fragment = buildManifestFragment(ManifestType.Connector, {
        slug,
      });
      fragment.license_type = 'freemium';

      // When
      const call = ManifestFragmentDomain.ingestManifestFragment(fragment);

      // Then
      await expect(call).rejects.toThrow(
        BadRequestErrorCode.InvalidLicenseType
      );

      const createdDocument = await TestHelper.document.load({ slug });
      expect(createdDocument).toBeUndefined();
    });

    it('throws when a connector exists for the same manifest id with the same version', async () => {
      // Given
      const existingDocument = await TestHelper.document.create({
        slug: 'misp-existing-same',
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        service_instance_id: INTEGRATION_SERVICE_INSTANCE_ID,
        source_type: DocumentSourceType.External,
        version: '7.260309.0-lts.5',
        tags: ['decoupling', 'latest-lts'],
      });
      _createdDocumentIds.push(existingDocument.id);

      await TestHelper.documentMetadata.create({
        document_id: existingDocument.id,
        key: DocumentMetadataKeyCode.ManifestFragmentId as DocumentMetadataKey,
        value: 'abc123',
      });
      await TestHelper.documentMetadata.create({
        document_id: existingDocument.id,
        key: DocumentMetadataKeyCode.VersionPadded as DocumentMetadataKey,
        value: '007.260309.000.LTS.005',
      });

      const slug = 'misp-new-same-version';
      const fragment = buildManifestFragment(ManifestType.Connector, {
        slug,
      });

      // When
      const call = ManifestFragmentDomain.ingestManifestFragment(fragment);

      // Then
      await expect(call).rejects.toThrow(
        BadRequestErrorCode.ConnectorVersionAlreadyExists
      );

      const newDocument = await TestHelper.document.load({ slug });
      expect(newDocument).toBeUndefined();
    });

    it('removes latest-lts from existing connector and creates a new latest-lts connector for same manifest id', async () => {
      // Given
      const existingDocument = await TestHelper.document.create({
        slug: 'misp-existing-lts',
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        service_instance_id: INTEGRATION_SERVICE_INSTANCE_ID,
        source_type: DocumentSourceType.External,
        version: '7.260308.0-lts.4',
        tags: ['decoupling', 'latest-lts'],
      });
      _createdDocumentIds.push(existingDocument.id);

      await TestHelper.documentMetadata.create({
        document_id: existingDocument.id,
        key: DocumentMetadataKeyCode.ManifestFragmentId as DocumentMetadataKey,
        value: 'abc123',
      });
      await TestHelper.documentMetadata.create({
        document_id: existingDocument.id,
        key: DocumentMetadataKeyCode.VersionPadded as DocumentMetadataKey,
        value: '007.260308.000.LTS.004',
      });
      await TestHelper.documentMetadata.create({
        document_id: existingDocument.id,
        key: DocumentMetadataKeyCode.DatasheetUrl as DocumentMetadataKey,
        value: 'https://filigran.io/datasheet',
      });
      await TestHelper.documentMetadata.create({
        document_id: existingDocument.id,
        key: DocumentMetadataKeyCode.BlogpostUrl as DocumentMetadataKey,
        value: 'https://filigran.io/blogpost',
      });
      await TestHelper.documentMetadata.create({
        document_id: existingDocument.id,
        key: DocumentMetadataKeyCode.DemoUrl as DocumentMetadataKey,
        value: 'https://filigran.io/demo',
      });

      const newSlug = 'misp-new-lts';
      const fragment = buildManifestFragment(ManifestType.Connector, {
        slug: newSlug,
      });

      // When
      await ManifestFragmentDomain.ingestManifestFragment(fragment);

      // Then
      const updatedExisting = await TestHelper.document.load({
        id: existingDocument.id,
      });
      expect(updatedExisting).toBeDefined();
      expect(updatedExisting!.tags).toContain('decoupling');
      expect(updatedExisting!.tags).not.toContain('latest-lts');

      const newDocument = await TestHelper.document.load({ slug: newSlug });
      expect(newDocument).toBeDefined();
      _createdDocumentIds.push(newDocument!.id);
      expect(newDocument!.tags).toContain('decoupling');
      expect(newDocument!.tags).toContain('latest-lts');

      const metadataRows = await TestHelper.documentMetadata.loadAll({
        document_id: newDocument!.id,
      });
      const metadataByKey = new Map(
        metadataRows.map((metadata) => [metadata.key as string, metadata.value])
      );
      expect(metadataByKey.get(DocumentMetadataKeyCode.DatasheetUrl)).toBe(
        'https://filigran.io/datasheet'
      );
      expect(metadataByKey.get(DocumentMetadataKeyCode.BlogpostUrl)).toBe(
        'https://filigran.io/blogpost'
      );
      expect(metadataByKey.get(DocumentMetadataKeyCode.DemoUrl)).toBe(
        'https://filigran.io/demo'
      );
    });

    it('removes latest from existing connector and creates a new latest connector for same manifest id', async () => {
      // Given
      const existingDocument = await TestHelper.document.create({
        slug: 'misp-existing-non-lts',
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        service_instance_id: INTEGRATION_SERVICE_INSTANCE_ID,
        source_type: DocumentSourceType.External,
        version: '7.260308.0',
        tags: ['decoupling', 'latest'],
      });
      _createdDocumentIds.push(existingDocument.id);

      await TestHelper.documentMetadata.create({
        document_id: existingDocument.id,
        key: DocumentMetadataKeyCode.ManifestFragmentId as DocumentMetadataKey,
        value: 'abc123',
      });
      await TestHelper.documentMetadata.create({
        document_id: existingDocument.id,
        key: DocumentMetadataKeyCode.VersionPadded as DocumentMetadataKey,
        value: '007.260308.000',
      });

      const newSlug = 'misp-new-non-lts';
      const fragment = buildManifestFragment(ManifestType.Connector, {
        slug: newSlug,
        version: '7.260309.0',
      });

      // When
      await ManifestFragmentDomain.ingestManifestFragment(fragment);

      // Then
      const updatedExisting = await TestHelper.document.load({
        id: existingDocument.id,
      });
      expect(updatedExisting).toBeDefined();
      expect(updatedExisting!.tags).toContain('decoupling');
      expect(updatedExisting!.tags).not.toContain('latest');

      const newDocument = await TestHelper.document.load({ slug: newSlug });
      expect(newDocument).toBeDefined();
      _createdDocumentIds.push(newDocument!.id);
      expect(newDocument!.tags).toContain('decoupling');
      expect(newDocument!.tags).toContain('latest');
      expect(newDocument!.tags).not.toContain('latest-lts');
    });

    it('keeps current latest when incoming version is lower', async () => {
      // Given

      const existingDocument = await TestHelper.document.create({
        slug: 'misp-existing-keep-latest',
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        service_instance_id: INTEGRATION_SERVICE_INSTANCE_ID,
        source_type: DocumentSourceType.External,
        version: '7.260309.0',
        tags: ['decoupling', 'latest'],
      });
      _createdDocumentIds.push(existingDocument.id);

      await TestHelper.documentMetadata.create({
        document_id: existingDocument.id,
        key: DocumentMetadataKeyCode.ManifestFragmentId as DocumentMetadataKey,
        value: 'abc123',
      });
      await TestHelper.documentMetadata.create({
        document_id: existingDocument.id,
        key: DocumentMetadataKeyCode.VersionPadded as DocumentMetadataKey,
        value: '007.260309.000',
      });

      const newSlug = 'misp-new-lower';
      const fragment = buildManifestFragment(ManifestType.Connector, {
        slug: newSlug,
        version: '7.260308.0',
      });

      // When
      await ManifestFragmentDomain.ingestManifestFragment(fragment);

      // Then
      const updatedExisting = await TestHelper.document.load({
        id: existingDocument.id,
      });
      expect(updatedExisting).toBeDefined();
      expect(updatedExisting!.tags).toContain('latest');

      const newDocument = await TestHelper.document.load({ slug: newSlug });
      expect(newDocument).toBeDefined();
      _createdDocumentIds.push(newDocument!.id);
      expect(newDocument!.tags).toContain('decoupling');
      expect(newDocument!.tags).not.toContain('latest');
      expect(newDocument!.tags).not.toContain('latest-lts');
    });
  });

  describe('ingestManifestFragment concurrency', () => {
    it('rejects one of two concurrent ingestions of the very first version of a brand-new connector', async () => {
      // Given: no existing rows to lock, so the DB unique constraint is the backstop
      const slug = 'misp-concurrent-first-insert';
      const manifestId = 'concurrent-first-insert-id';
      const fragmentA = buildManifestFragment(ManifestType.Connector, {
        slug,
        id: manifestId,
      });
      const fragmentB = buildManifestFragment(ManifestType.Connector, {
        slug,
        id: manifestId,
      });

      // When
      const results = await Promise.allSettled([
        ManifestFragmentDomain.ingestManifestFragment(fragmentA),
        ManifestFragmentDomain.ingestManifestFragment(fragmentB),
      ]);

      // Then: only one succeeds
      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');
      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);
      expect((rejected[0] as PromiseRejectedResult).reason.message).toBe(
        BadRequestErrorCode.ConnectorVersionAlreadyExists
      );

      const createdDocument = await TestHelper.document.load({ slug });
      expect(createdDocument).toBeDefined();
      _createdDocumentIds.push(createdDocument!.id);
    });

    it('promotes exactly one connector as latest when two new versions are ingested concurrently for the same connector family', async () => {
      // Given: existing connector tagged latest, so the lock has a row to serialize on
      const manifestId = 'concurrent-promote-id';
      const existingDocument = await TestHelper.document.create({
        slug: 'misp-concurrent-existing',
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        service_instance_id: INTEGRATION_SERVICE_INSTANCE_ID,
        source_type: DocumentSourceType.External,
        version: '7.260305.0',
        tags: ['decoupling', 'latest'],
      });
      _createdDocumentIds.push(existingDocument.id);

      await TestHelper.documentMetadata.create({
        document_id: existingDocument.id,
        key: DocumentMetadataKeyCode.ManifestFragmentId as DocumentMetadataKey,
        value: manifestId,
      });
      await TestHelper.documentMetadata.create({
        document_id: existingDocument.id,
        key: DocumentMetadataKeyCode.VersionPadded as DocumentMetadataKey,
        value: '007.260305.000',
      });

      const slugLower = 'misp-concurrent-lower';
      const slugHigher = 'misp-concurrent-higher';
      const fragmentLower = buildManifestFragment(ManifestType.Connector, {
        slug: slugLower,
        id: manifestId,
        version: '7.260308.0',
      });
      const fragmentHigher = buildManifestFragment(ManifestType.Connector, {
        slug: slugHigher,
        id: manifestId,
        version: '7.260309.0',
      });

      // When
      await Promise.all([
        ManifestFragmentDomain.ingestManifestFragment(fragmentLower),
        ManifestFragmentDomain.ingestManifestFragment(fragmentHigher),
      ]);

      // Then: only one connector carries "latest", and it's the highest version
      const documentLower = await TestHelper.document.load({
        slug: slugLower,
      });
      const documentHigher = await TestHelper.document.load({
        slug: slugHigher,
      });
      expect(documentLower).toBeDefined();
      expect(documentHigher).toBeDefined();
      _createdDocumentIds.push(documentLower!.id, documentHigher!.id);

      const updatedExisting = await TestHelper.document.load({
        id: existingDocument.id,
      });

      const latestCount = [
        updatedExisting,
        documentLower,
        documentHigher,
      ].filter((doc) => doc!.tags?.includes('latest')).length;
      expect(latestCount).toBe(1);
      expect(documentHigher!.tags).toContain('latest');
      expect(documentLower!.tags).not.toContain('latest');
      expect(updatedExisting!.tags).not.toContain('latest');
    });
  });
});
