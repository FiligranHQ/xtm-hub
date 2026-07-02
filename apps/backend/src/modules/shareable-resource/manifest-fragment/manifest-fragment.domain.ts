import { db } from '../../../../knexfile';
import {
  DocumentImageType,
  DocumentMetadataKeyCode,
  DocumentSourceType,
  IntegrationType,
  ManifestType,
  PortalCapability,
  type ManifestFragmentInput,
  type MutationIngestManifestFragmentsArgs,
} from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import Document from '../../../model/kanel/public/Document';
import { securityGuard } from '../../../security/guard';
import { BadRequestErrorCode } from '../../../utils/error/error.code';
import { DocumentApp } from '../../document/document.app';
import { DocumentUploadsHelper } from '../../document/document.uploads.helper';
import { DocumentChildrenDomain } from '../../document/domain/document.children.domain';
import { DocumentDomain } from '../../document/domain/document.domain';
import { IngestManifestHelper } from '../opencti/integration/ingest-manifest/ingest-manifest.helper';
import {
  INTEGRATION_CONNECTOR_V2_METADATA_KEYS,
  INTEGRATION_SERVICE_INSTANCE_ID,
  OPENCTI_INTEGRATION_DOCUMENT_TYPE,
  type ConnectorV2,
} from '../opencti/integration/integration.model';
import {
  buildConnectorLogoFilename,
  formatConnectorVersion,
  getConnectorDocumentTags,
  getConnectorMetadataFromExisting,
  getLatestTagForConnectorVersion,
  isStrictlyGreaterConnectorVersion,
  validateConnectorMinimumVersion,
} from './manifest-fragment.utils';

type ConnectorWithMetadata = Document & {
  version_padded?: string;
  datasheet_url?: string;
  blogpost_url?: string;
  demo_url?: string;
};

const attachConnectorLogo = async ({
  connector,
  fragment,
}: {
  connector: ConnectorV2;
  fragment: ManifestFragmentInput;
}) => {
  const uploadLogo = IngestManifestHelper.base64ToUpload(
    fragment.logo,
    buildConnectorLogoFilename({
      title: fragment.title,
      version: fragment.version,
    })
  );

  const [logoFile] = await DocumentUploadsHelper.processUploads(
    uploadLogo,
    INTEGRATION_SERVICE_INSTANCE_ID
  );

  if (!logoFile) {
    return;
  }

  await DocumentChildrenDomain.createImageDocuments(
    connector.id,
    INTEGRATION_SERVICE_INSTANCE_ID,
    [logoFile],
    DocumentImageType.Logo,
    DocumentSourceType.External
  );
};

const createConnectorDocument = async ({
  fragment,
  formattedVersion,
  tags,
  metadataFromExisting,
}: {
  fragment: ManifestFragmentInput;
  formattedVersion: string;
  tags: string[];
  metadataFromExisting?: Pick<
    ConnectorWithMetadata,
    'datasheet_url' | 'blogpost_url' | 'demo_url'
  >;
}) => {
  const createdConnector =
    await DocumentApp.createDocumentWithChildrenAndMetadata<ConnectorV2>(
      {
        name: fragment.title,
        slug: fragment.slug,
        description: fragment.description,
        short_description: fragment.short_description,
        use_cases: fragment.use_cases,
        service_instance_id: INTEGRATION_SERVICE_INSTANCE_ID,
        tags,
        source_type: DocumentSourceType.External,
        type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        version: fragment.version,
        version_padded: formattedVersion,
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
        minimum_deployable_version_padded: formatConnectorVersion(
          fragment.min_version
        ),
        datasheet_url: metadataFromExisting?.datasheet_url,
        blogpost_url: metadataFromExisting?.blogpost_url,
        demo_url: metadataFromExisting?.demo_url,
        additional_properties: JSON.stringify(fragment.additional_properties),
        config_schema: JSON.stringify(fragment.config_schema),
      },
      INTEGRATION_CONNECTOR_V2_METADATA_KEYS
    );

  await attachConnectorLogo({
    connector: createdConnector,
    fragment,
  });
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
    const user = requestContext.requireUser();
    await securityGuard.assertUserPortalCapabilities(user, [
      PortalCapability.ManageManifestIngestions,
    ]);
    for (const fragment of manifestFragments) {
      if (fragment.integration_type !== ManifestType.Connector) {
        throw new Error(BadRequestErrorCode.IntegrationTypeNotRecognized);
      }

      validateConnectorMinimumVersion(fragment.min_version);
      const formattedVersion = formatConnectorVersion(fragment.version);
      const latestTag = getLatestTagForConnectorVersion(formattedVersion);

      const existingBatchConnectors =
        (await DocumentDomain.loadDocumentsByMetadata(
          DocumentMetadataKeyCode.IdManifestFragment,
          fragment.id,
          [
            DocumentMetadataKeyCode.VersionPadded,
            DocumentMetadataKeyCode.DatasheetUrl,
            DocumentMetadataKeyCode.BlogpostUrl,
            DocumentMetadataKeyCode.DemoUrl,
          ]
        )) as ConnectorWithMetadata[];

      const hasSameVersion = existingBatchConnectors.some(
        (connector) => connector.version === fragment.version
      );
      if (hasSameVersion) {
        throw new Error(BadRequestErrorCode.ConnectorVersionAlreadyExists);
      }

      const currentLatestConnector = existingBatchConnectors.find((connector) =>
        (connector.tags ?? []).includes(latestTag)
      );

      const metadataFromExisting = getConnectorMetadataFromExisting({
        currentLatestConnector,
        existingBatchConnectors,
      });

      const shouldPromoteAsLatest =
        !currentLatestConnector ||
        isStrictlyGreaterConnectorVersion({
          candidate: formattedVersion,
          current: currentLatestConnector.version_padded ?? '',
        });

      if (existingBatchConnectors.length > 0 && shouldPromoteAsLatest) {
        await removeLatestTagFromExistingBatchConnectors({
          connectors: existingBatchConnectors,
          latestTag,
        });
      }

      const newDocumentTags = getConnectorDocumentTags(
        shouldPromoteAsLatest,
        latestTag
      );

      await createConnectorDocument({
        fragment,
        formattedVersion,
        tags: newDocumentTags,
        metadataFromExisting,
      });
    }

    return { success: true };
  },
};
