import { afterEach, describe, expect, it } from 'vitest';
import { TestHelper } from '../../../../tests/helper/test.helper';
import {
  DocumentMetadataKeyCode,
  DocumentSourceType,
  ManifestType,
  type MutationIngestManifestFragmentsArgs,
} from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import type { DocumentMetadataKey } from '../../../model/kanel/public/DocumentMetadata';
import { SYSTEM_USER_CONTEXT } from '../../../portal.const';
import { BadRequestErrorCode } from '../../../utils/error/error.code';
import {
  INTEGRATION_SERVICE_INSTANCE_ID,
  OPENCTI_INTEGRATION_DOCUMENT_TYPE,
} from '../opencti/integration/integration.model';
import { ManifestFragmentDomain } from './manifest-fragment.domain';

describe('manifestFragmentDomain', () => {
  let _createdDocumentIds: string[] = [];

  afterEach(async () => {
    if (_createdDocumentIds.length === 0) {
      return;
    }

    for (const documentId of _createdDocumentIds) {
      await TestHelper.documentMetadata.delete({
        document_id: documentId as never,
      });
      await TestHelper.document.delete({ id: documentId as never });
    }

    _createdDocumentIds = [];
  });

  const buildManifestFragments = (
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
  ): MutationIngestManifestFragmentsArgs => {
    return {
      manifestFragments: [
        {
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
        },
      ],
    };
  };

  describe('ingestManifestFragments', () => {
    it('accepts a fragment when integration_type is connector and returns success', async () => {
      // Given
      requestContext.set({ user: SYSTEM_USER_CONTEXT.user });

      const slug = 'misp-integration';
      const args = buildManifestFragments(ManifestType.Connector, { slug });

      // When
      const result = await ManifestFragmentDomain.ingestManifestFragments(args);

      // Then
      expect(result).toMatchObject({ success: true });

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
        version: '007.260309.000.LTS.005',
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
        metadataByKey.get(DocumentMetadataKeyCode.IdManifestFragment)
      ).toBe(args.manifestFragments[0]?.id);
      expect(metadataByKey.get(DocumentMetadataKeyCode.Verified)).toBe(
        String(args.manifestFragments[0]?.verified)
      );
      expect(metadataByKey.get(DocumentMetadataKeyCode.LastVerifiedDate)).toBe(
        args.manifestFragments[0]?.last_verified_date
      );
      expect(metadataByKey.get(DocumentMetadataKeyCode.IntegrationType)).toBe(
        args.manifestFragments[0]?.integration_type
      );
      expect(metadataByKey.get(DocumentMetadataKeyCode.SourceCode)).toBe(
        args.manifestFragments[0]?.source_code
      );
      expect(metadataByKey.get(DocumentMetadataKeyCode.ManagerSupported)).toBe(
        String(args.manifestFragments[0]?.manager_supported)
      );
      expect(
        metadataByKey.get(DocumentMetadataKeyCode.MinimumDeployableVersion)
      ).toBe(args.manifestFragments[0]?.min_version);
      expect(
        metadataByKey.get(DocumentMetadataKeyCode.AdditionalProperties)
      ).toBe(JSON.stringify(args.manifestFragments[0]?.additional_properties));
      expect(metadataByKey.get(DocumentMetadataKeyCode.ConfigSchema)).toBe(
        JSON.stringify(args.manifestFragments[0]?.config_schema)
      );
    });

    it('throws when integration_type is not connector', async () => {
      // Given
      requestContext.set({ user: SYSTEM_USER_CONTEXT.user });

      const slug = 'misp-invalid';
      const args = buildManifestFragments('third_party_integration', { slug });

      // When
      const call = ManifestFragmentDomain.ingestManifestFragments(args);

      // Then
      await expect(call).rejects.toThrow(
        BadRequestErrorCode.IntegrationTypeNotRecognized
      );

      const createdDocument = await TestHelper.document.load({ slug });
      expect(createdDocument).toBeUndefined();
    });

    it('throws when min_version format is invalid', async () => {
      // Given
      requestContext.set({ user: SYSTEM_USER_CONTEXT.user });

      const slug = 'misp-invalid-min-version';
      const args = buildManifestFragments(ManifestType.Connector, { slug });
      args.manifestFragments[0]!.min_version = '>= 7.260507.0';

      // When
      const call = ManifestFragmentDomain.ingestManifestFragments(args);

      // Then
      await expect(call).rejects.toThrow(
        BadRequestErrorCode.InvalidConnectorVersionFormat
      );

      const createdDocument = await TestHelper.document.load({ slug });
      expect(createdDocument).toBeUndefined();
    });

    it('throws when a connector exists for the same manifest id with the same version', async () => {
      // Given
      requestContext.set({ user: SYSTEM_USER_CONTEXT.user });

      const existingDocument = await TestHelper.document.create({
        slug: 'misp-existing-same',
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        service_instance_id: INTEGRATION_SERVICE_INSTANCE_ID,
        source_type: DocumentSourceType.External,
        version: '007.260309.000.LTS.005',
        tags: ['decoupling', 'latest-lts'],
      });
      _createdDocumentIds.push(existingDocument.id);

      await TestHelper.documentMetadata.create({
        document_id: existingDocument.id,
        key: DocumentMetadataKeyCode.IdManifestFragment as DocumentMetadataKey,
        value: 'abc123',
      });

      const slug = 'misp-new-same-version';
      const args = buildManifestFragments(ManifestType.Connector, { slug });

      // When
      const call = ManifestFragmentDomain.ingestManifestFragments(args);

      // Then
      await expect(call).rejects.toThrow(
        BadRequestErrorCode.ConnectorVersionAlreadyExists
      );

      const newDocument = await TestHelper.document.load({ slug });
      expect(newDocument).toBeUndefined();
    });

    it('removes latest-lts from existing connector and creates a new latest-lts connector for same manifest id', async () => {
      // Given
      requestContext.set({ user: SYSTEM_USER_CONTEXT.user });

      const existingDocument = await TestHelper.document.create({
        slug: 'misp-existing-lts',
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        service_instance_id: INTEGRATION_SERVICE_INSTANCE_ID,
        source_type: DocumentSourceType.External,
        version: '007.260308.000.LTS.004',
        tags: ['decoupling', 'latest-lts'],
      });
      _createdDocumentIds.push(existingDocument.id);

      await TestHelper.documentMetadata.create({
        document_id: existingDocument.id,
        key: DocumentMetadataKeyCode.IdManifestFragment as DocumentMetadataKey,
        value: 'abc123',
      });

      const newSlug = 'misp-new-lts';
      const args = buildManifestFragments(ManifestType.Connector, {
        slug: newSlug,
      });

      // When
      await ManifestFragmentDomain.ingestManifestFragments(args);

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
    });

    it('removes latest from existing connector and creates a new latest connector for same manifest id', async () => {
      // Given
      requestContext.set({ user: SYSTEM_USER_CONTEXT.user });

      const existingDocument = await TestHelper.document.create({
        slug: 'misp-existing-non-lts',
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        service_instance_id: INTEGRATION_SERVICE_INSTANCE_ID,
        source_type: DocumentSourceType.External,
        version: '007.260308.000',
        tags: ['decoupling', 'latest'],
      });
      _createdDocumentIds.push(existingDocument.id);

      await TestHelper.documentMetadata.create({
        document_id: existingDocument.id,
        key: DocumentMetadataKeyCode.IdManifestFragment as DocumentMetadataKey,
        value: 'abc123',
      });

      const newSlug = 'misp-new-non-lts';
      const args = buildManifestFragments(ManifestType.Connector, {
        slug: newSlug,
        version: '7.260309.0',
      });

      // When
      await ManifestFragmentDomain.ingestManifestFragments(args);

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
      requestContext.set({ user: SYSTEM_USER_CONTEXT.user });

      const existingDocument = await TestHelper.document.create({
        slug: 'misp-existing-keep-latest',
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        service_instance_id: INTEGRATION_SERVICE_INSTANCE_ID,
        source_type: DocumentSourceType.External,
        version: '007.260309.000',
        tags: ['decoupling', 'latest'],
      });
      _createdDocumentIds.push(existingDocument.id);

      await TestHelper.documentMetadata.create({
        document_id: existingDocument.id,
        key: DocumentMetadataKeyCode.IdManifestFragment as DocumentMetadataKey,
        value: 'abc123',
      });

      const newSlug = 'misp-new-lower';
      const args = buildManifestFragments(ManifestType.Connector, {
        slug: newSlug,
        version: '7.260308.0',
      });

      // When
      await ManifestFragmentDomain.ingestManifestFragments(args);

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
});
