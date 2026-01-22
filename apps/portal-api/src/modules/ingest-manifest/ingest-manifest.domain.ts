import { omit } from '../../utils/utils';
import { DocumentApp } from '../services/document/document.app';
import {
  Connector,
  INTEGRATION_CONNECTOR_METADATA_KEYS,
  OPENCTI_INTEGRATION_DOCUMENT_TYPE,
} from '../services/integrations/integrations.model';
import { telemetryApp } from '../telemetry/telemetry.app';
import { buildCreateEvent } from '../telemetry/telemetry.helper';
import { base64ToUpload } from './ingest-manifest.helper';
import { ManifestInformation } from './ingest-manifest.model';

export const upsertConnectors = async (manifestInfo: ManifestInformation[]) => {
  const results: Array<Connector> = [];

  for (const connector of manifestInfo) {
    try {
      const uploadLogo = base64ToUpload(
        connector.logo,
        `${connector.name}-logo.png`
      );
      const doc = await DocumentApp.upsertDocument<Connector>(
        OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        { ...omit(connector, ['logo']) } as Connector,
        uploadLogo,
        INTEGRATION_CONNECTOR_METADATA_KEYS
      );
      const newDocIsCreated = !doc.updated_at;
      if (newDocIsCreated) {
        const createEvent = await buildCreateEvent(doc);
        telemetryApp.sendTelemetryEvent(createEvent);
      }

      results.push(doc);
    } catch (error) {
      console.error(`Failed to upsert connector ${connector.name}:`, error);
      throw error;
    }
  }

  return results;
};
