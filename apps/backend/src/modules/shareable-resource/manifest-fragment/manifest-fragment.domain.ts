import {
  DocumentSourceType,
  IntegrationType,
  ManifestType,
  type ManifestFragmentInput,
  type MutationIngestManifestFragmentsArgs,
} from '../../../__generated__/resolvers-types';
import { BadRequestErrorCode } from '../../../utils/error/error.code';
import { DocumentApp } from '../../document/document.app';
import {
  INTEGRATION_CONNECTOR_V2_METADATA_KEYS,
  INTEGRATION_SERVICE_INSTANCE_ID,
  OPENCTI_INTEGRATION_DOCUMENT_TYPE,
  type ConnectorV2,
} from '../opencti/integration/integration.model';

const createConnectorDocument = async (fragment: ManifestFragmentInput) => {
  await DocumentApp.createDocumentWithChildrenAndMetadata<ConnectorV2>(
    {
      name: fragment.title,
      slug: fragment.slug,
      description: fragment.description,
      short_description: fragment.short_description,
      service_instance_id: INTEGRATION_SERVICE_INSTANCE_ID,
      tags: ['Decoupling'],
      source_type: DocumentSourceType.External,
      type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
      version: fragment.version,
      id_manifest: fragment.id,
      image_name: fragment.image_name,
      image_type: fragment.image_type,
      integration_type: IntegrationType.Connector,
      verified: fragment.verified ?? false,
      source_code: fragment.source_code,
      subscription_link: fragment.subscription_link,
      manager_supported: fragment.manager_supported,
      minimum_deployable_version: fragment.min_version,
      additional_properties: JSON.stringify(fragment.additional_properties),
      config_schema: JSON.stringify(fragment.config_schema),
    },
    INTEGRATION_CONNECTOR_V2_METADATA_KEYS
  );
};

export const ManifestFragmentDomain = {
  ingestManifestFragments: async ({
    manifestFragments,
  }: MutationIngestManifestFragmentsArgs): Promise<{ success: boolean }> => {
    for (const fragment of manifestFragments) {
      if (fragment.integration_type !== ManifestType.Connector) {
        throw new Error(BadRequestErrorCode.IntegrationTypeNotRecognized);
      }
      await createConnectorDocument(fragment);
    }

    return { success: true };
  },
};
