import { dbTx } from '../../../../../knexfile';
import { IntegrationFeedType } from '../../../../__generated__/resolvers-types';
import { DocumentId } from '../../../../model/kanel/public/Document';
import { logApp } from '../../../../utils/app-logger.util';
import { telemetryApp } from '../../../telemetry/telemetry.app';
import { buildCreateEvent } from '../../../telemetry/telemetry.helper';
import { loadDocumentWithCountersById } from '../../document/document.helper';
import { Upload } from '../../document/document.uploads.helper';
import { createDocumentWithChildren } from '../../document/domain/document.domain';
import {
  CsvFeed,
  INTEGRATION_FEED_CSV_FEED_METADATA,
  OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
} from '../integration-feeds.model';

export const csvFeedsApp = {
  createCsvFeed: async (input: Partial<CsvFeed>, document: Upload[]) => {
    const trx = await dbTx();
    try {
      const doc = await createDocumentWithChildren<CsvFeed>(
        OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
        { ...input, integration_type: IntegrationFeedType.CsvFeed },
        document,
        INTEGRATION_FEED_CSV_FEED_METADATA,
        trx
      );
      await trx.commit();

      try {
        const createEvent = await buildCreateEvent(doc);
        telemetryApp.sendTelemetryEvent(createEvent);
      } catch (error) {
        logApp.error('Unable to send telemetry event for CSV feed creation', {
          error,
        });
      }

      return doc;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  },

  loadCsvFeed: async (documentId: DocumentId) => {
    return loadDocumentWithCountersById(documentId);
  },
};
