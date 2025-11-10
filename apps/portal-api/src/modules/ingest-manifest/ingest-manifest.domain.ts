import { dbTx } from '../../../knexfile';
import { omit } from '../../utils/utils';
import { upsertDocumentWithChildren } from '../services/document/document.domain';
import {
  Connector,
  INTEGRATION_FEED_CONNECTOR_METADATA,
  OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
} from '../services/integration-feeds/integration-feeds.model';
import { telemetryApp } from '../telemetry/telemetry.app';
import { buildCreateEvent } from '../telemetry/telemetry.helper';
import { base64ToUpload } from './ingest-manifest.helper';
import { ManifestInformation } from './ingest-manifest.model';

export const upsertConnectors = async (manifestInfo: ManifestInformation[]) => {
  const results: Array<Connector> = [];

  for (const connector of manifestInfo) {
    const trx = await dbTx();
    try {
      const uploadLogo = base64ToUpload(
        connector.logo,
        `${connector.name}-logo.png`
      );
      const doc = await upsertDocumentWithChildren<Connector>(
        OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
        { ...omit(connector, ['logo']) } as Connector,
        uploadLogo,
        INTEGRATION_FEED_CONNECTOR_METADATA,
        trx
      );
      await trx.commit();
      const newDocIsCreated = !doc.updated_at;
      if (newDocIsCreated) {
        const createEvent = await buildCreateEvent(doc);
        telemetryApp.sendTelemetryEvent(createEvent);
      }

      results.push(doc);
    } catch (error) {
      await trx.rollback();
      console.error(`Failed to upsert connector ${connector.name}:`, error);
      throw error;
    }
  }

  return results;
};
