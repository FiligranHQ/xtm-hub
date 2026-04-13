import {
  DocumentMetadataKeyCode,
  IntegrationType,
} from '../../__generated__/resolvers-types';
import { logApp } from '../../utils/app-logger.util';
import { omit } from '../../utils/utils';
import { DocumentApp } from '../document/document.app';
import { DocumentDomain } from '../document/domain/document.domain';
import {
  Connector,
  INTEGRATION_CONNECTOR_METADATA_KEYS,
  OPENCTI_INTEGRATION_DOCUMENT_TYPE,
} from '../document/opencti/integrations/integrations.model';
import { telemetryApp } from '../telemetry/telemetry.app';
import { buildCreateEvent } from '../telemetry/telemetry.helper';
import { base64ToUpload } from './ingest-manifest.helper';
import { ManifestInformation } from './ingest-manifest.model';

export const upsertConnectors = async (manifestInfo: ManifestInformation[]) => {
  const results: Array<Connector> = [];
  const existingConnectors = await DocumentDomain.loadDocumentsByMetadata(
    DocumentMetadataKeyCode.IntegrationType,
    IntegrationType.Connector,
    INTEGRATION_CONNECTOR_METADATA_KEYS as DocumentMetadataKeyCode[]
  );

  const connectorsMappedBySlug: Map<string, Connector> =
    existingConnectors.reduce((acc, current) => {
      acc.set(current.slug, current as Connector);
      return acc;
    }, new Map<string, Connector>());

  for (const connector of manifestInfo) {
    try {
      const uploadLogo = base64ToUpload(
        connector.logo,
        `${connector.name}-logo.png`
      );

      const existingConnector = connectorsMappedBySlug.get(connector.slug);
      if (existingConnector) {
        if (
          !existingConnector.minimum_deployable_version &&
          connector.manager_supported
        ) {
          connector.minimum_deployable_version = connector.product_version;
        }

        if (existingConnector.datasheet_url) {
          connector.datasheet_url = existingConnector.datasheet_url;
        }

        if (existingConnector.blogpost_url) {
          connector.blogpost_url = existingConnector.blogpost_url;
        }

        if (existingConnector.demo_url) {
          connector.demo_url = existingConnector.demo_url;
        }
      }

      const doc = await DocumentApp.upsertDocumentWithExternalImage<Connector>(
        OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        { ...omit(connector, ['logo']) } as Connector,
        uploadLogo,
        INTEGRATION_CONNECTOR_METADATA_KEYS
      );
      const newDocIsCreated = !doc.updated_at;
      if (newDocIsCreated) {
        const createEvent = await buildCreateEvent(doc);
        await telemetryApp.sendTelemetryEvent(createEvent);
      }

      results.push(doc);
    } catch (error) {
      logApp.error(`Failed to upsert connector ${connector.name}:`, error);
      throw error;
    }
  }

  return results;
};
