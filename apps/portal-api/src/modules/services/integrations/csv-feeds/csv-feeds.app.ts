import { IntegrationsType } from '../../../../__generated__/resolvers-types';
import { DocumentId } from '../../../../model/kanel/public/Document';
import { logApp } from '../../../../utils/app-logger.util';
import { telemetryApp } from '../../../telemetry/telemetry.app';
import { buildCreateEvent } from '../../../telemetry/telemetry.helper';
import { DocumentApp } from '../../document/document.app';
import { loadDocumentWithCountersById } from '../../document/document.helper';
import { Upload } from '../../document/document.uploads.helper';
import {
  CsvFeed,
  INTEGRATION_CSV_FEED_METADATA,
  OPENCTI_INTEGRATION_DOCUMENT_TYPE,
} from '../integrations.model';

export const csvFeedsApp = {
  createCsvFeed: async (input: Partial<CsvFeed>, document: Upload[]) => {
    const doc =
      await DocumentApp.createDocumentWithImageUploadsAndMetadata<CsvFeed>(
        OPENCTI_INTEGRATION_DOCUMENT_TYPE,
        { ...input, integration_type: IntegrationsType.CsvFeed },
        document,
        INTEGRATION_CSV_FEED_METADATA
      );

    try {
      const createEvent = await buildCreateEvent(doc);
      telemetryApp.sendTelemetryEvent(createEvent);
    } catch (error) {
      logApp.error('Unable to send telemetry event for CSV feed creation', {
        error,
      });
    }

    return doc;
  },

  loadCsvFeed: async (documentId: DocumentId) => {
    return loadDocumentWithCountersById(documentId);
  },
};
