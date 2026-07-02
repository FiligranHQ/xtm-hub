import { db } from '../../../../knexfile';
import {
  DocumentMetadataKeyCode,
  DocumentSourceType,
  IntegrationType,
  ManifestType,
  type ManifestFragmentInput,
  type MutationIngestManifestFragmentsArgs,
} from '../../../__generated__/resolvers-types';
import Document from '../../../model/kanel/public/Document';
import { BadRequestErrorCode } from '../../../utils/error/error.code';
import { DocumentApp } from '../../document/document.app';
import { DocumentDomain } from '../../document/domain/document.domain';
import {
  INTEGRATION_CONNECTOR_V2_METADATA_KEYS,
  INTEGRATION_SERVICE_INSTANCE_ID,
  OPENCTI_INTEGRATION_DOCUMENT_TYPE,
  type ConnectorV2,
} from '../opencti/integration/integration.model';
import {
  formatConnectorVersion,
  getLatestTagForConnectorVersion,
  isStrictlyGreaterConnectorVersion,
  validateConnectorMinimumVersion,
} from './manifest-fragment.utils';

const TAG_DECOUPLING = 'decoupling';

const createConnectorDocument = async ({
  fragment,
  formattedVersion,
  tags,
}: {
  fragment: ManifestFragmentInput;
  formattedVersion: string;
  tags: string[];
}) => {
  await DocumentApp.createDocumentWithChildrenAndMetadata<ConnectorV2>(
    {
      name: fragment.title,
      slug: fragment.slug,
      description: fragment.description,
      short_description: fragment.short_description,
      service_instance_id: INTEGRATION_SERVICE_INSTANCE_ID,
      tags,
      source_type: DocumentSourceType.External,
      type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
      version: formattedVersion,
      id_manifest_fragment: fragment.id,
      last_verified_date: fragment.last_verified_date,
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

const removeLatestTagFromExistingBatchConnectors = async ({
  connectors,
  latestTag,
}: {
  connectors: Document[];
  latestTag: string;
}) => {
  for (const connector of connectors) {
    const tags = connector.tags ?? [];
    if (!tags.includes(latestTag)) {
      continue;
    }

    const updatedTags = tags.filter((tag) => tag !== latestTag);
    await db<Document>('Document')
      .where({ id: connector.id })
      .update({ tags: updatedTags, updated_at: new Date() });
  }
};

export const ManifestFragmentDomain = {
  ingestManifestFragments: async ({
    manifestFragments,
  }: MutationIngestManifestFragmentsArgs): Promise<{ success: boolean }> => {
    for (const fragment of manifestFragments) {
      if (fragment.integration_type !== ManifestType.Connector) {
        throw new Error(BadRequestErrorCode.IntegrationTypeNotRecognized);
      }

      validateConnectorMinimumVersion(fragment.min_version);
      const formattedVersion = formatConnectorVersion(fragment.version);
      const latestTag = getLatestTagForConnectorVersion(formattedVersion);

      const existingBatchConnectors =
        await DocumentDomain.loadDocumentsByMetadata(
          DocumentMetadataKeyCode.IdManifestFragment,
          fragment.id
        );

      const hasSameVersion = existingBatchConnectors.some(
        (connector) => connector.version === formattedVersion
      );
      if (hasSameVersion) {
        throw new Error(BadRequestErrorCode.ConnectorVersionAlreadyExists);
      }

      const currentLatestConnector = existingBatchConnectors.find((connector) =>
        (connector.tags ?? []).includes(latestTag)
      );

      const shouldPromoteAsLatest =
        !currentLatestConnector ||
        isStrictlyGreaterConnectorVersion({
          candidate: formattedVersion,
          current: currentLatestConnector.version ?? '',
        });

      if (existingBatchConnectors.length > 0 && shouldPromoteAsLatest) {
        await removeLatestTagFromExistingBatchConnectors({
          connectors: existingBatchConnectors,
          latestTag,
        });
      }

      const newDocumentTags = shouldPromoteAsLatest
        ? [TAG_DECOUPLING, latestTag]
        : [TAG_DECOUPLING];

      await createConnectorDocument({
        fragment,
        formattedVersion,
        tags: newDocumentTags,
      });
    }

    return { success: true };
  },
};
