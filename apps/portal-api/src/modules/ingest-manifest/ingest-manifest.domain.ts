import { dbTx } from '../../../knexfile';
import { PortalContext } from '../../model/portal-context';
import { omit } from '../../utils/utils';
import { upsertDocumentWithChildren } from '../services/document/document.domain';
import {
  Connector,
  CSV_FEED_CONNECTOR_METADATA,
  OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
} from '../services/integration-feeds/integration-feeds.model';
import { ManifestInformation } from './ingest-manifest.model';

export const upsertConnectors = async (
  context: PortalContext,
  manifestInfo: ManifestInformation[]
) => {
  const results: Array<Connector> = [];

  for (const connector of manifestInfo) {
    const trx = await dbTx();
    try {
      const doc = await upsertDocumentWithChildren<Connector>(
        OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
        { ...omit(connector, ['logo']) } as Connector,
        [],
        CSV_FEED_CONNECTOR_METADATA,
        context,
        trx
      );
      await trx.commit();
      results.push(doc);
    } catch (error) {
      await trx.rollback();
      console.error(`Failed to upsert connector ${connector.name}:`, error);
      throw error;
    }
  }

  return results;
};
