import { afterEach, describe, expect, it } from 'vitest';
import { TestHelper } from '../../../../tests/helper/test.helper';
import {
  DocumentMetadataKeyCode,
  DocumentSourceType,
  ManifestType,
  type MutationIngestManifestFragmentsArgs,
} from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import { SYSTEM_USER_CONTEXT } from '../../../portal.const';
import { BadRequestErrorCode } from '../../../utils/error/error.code';
import {
  INTEGRATION_SERVICE_INSTANCE_ID,
  OPENCTI_INTEGRATION_DOCUMENT_TYPE,
} from '../opencti/integration/integration.model';
import { ManifestFragmentDomain } from './manifest-fragment.domain';

describe('manifestFragmentDomain', () => {
  let _createdSlug: string | undefined;

  afterEach(async () => {
    if (!_createdSlug) {
      return;
    }

    const createdDocument = await TestHelper.document.load({
      slug: _createdSlug,
    });
    if (createdDocument) {
      await TestHelper.documentMetadata.delete({
        document_id: createdDocument.id,
      });
      await TestHelper.document.delete({ id: createdDocument.id });
    }

    _createdSlug = undefined;
  });

  const buildManifestFragments = (
    integrationType: string,
    slug = `misp-${Date.now()}`
  ): MutationIngestManifestFragmentsArgs => {
    return {
      manifestFragments: [
        {
          id: 'abc123',
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
          min_version: '>= 7.260507.0',
          version: '7.260309.0-lts.5',
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

      const slug = `misp-integration-${Date.now()}`;
      _createdSlug = slug;
      const args = buildManifestFragments(ManifestType.Connector, slug);

      // When
      const result = await ManifestFragmentDomain.ingestManifestFragments(args);

      // Then
      expect(result).toMatchObject({ success: true });

      const createdDocument = await TestHelper.document.load({ slug });

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
      expect(createdDocument!.tags).toContain('Decoupling');

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

      const slug = `misp-invalid-${Date.now()}`;
      _createdSlug = slug;
      const args = buildManifestFragments('third_party_integration', slug);

      // When
      const call = ManifestFragmentDomain.ingestManifestFragments(args);

      // Then
      await expect(call).rejects.toThrow(
        BadRequestErrorCode.IntegrationTypeNotRecognized
      );

      const createdDocument = await TestHelper.document.load({ slug });
      expect(createdDocument).toBeUndefined();
    });
  });
});
