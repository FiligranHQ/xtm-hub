import { dbTx } from '../../../../knexfile';
import { PortalContext } from '../../../model/portal-context';
import { logApp } from '../../../utils/app-logger.util';
import { telemetryApp } from '../../telemetry/telemetry.app';
import { buildCreateEvent } from '../../telemetry/telemetry.helper';
import { createDocumentWithChildren } from '../document/document.domain';
import { Upload } from '../document/document.helper';
import {
  CSV_FEED_DOCUMENT_TYPE,
  CSV_FEED_METADATA,
  CsvFeed,
} from './csv-feeds.domain';

export const csvFeedsApp = {
  createCsvFeed: async (
    context: PortalContext,
    input: Partial<CsvFeed>,
    document: Upload[]
  ) => {
    const trx = await dbTx();
    try {
      const doc = await createDocumentWithChildren<CsvFeed>(
        CSV_FEED_DOCUMENT_TYPE,
        { ...input, integration_type: 'csv_feed' },
        document,
        CSV_FEED_METADATA,
        context,
        trx
      );
      await trx.commit();

      try {
        const createEvent = await buildCreateEvent(
          context,
          context.user.selected_organization_id,
          context.user.id,
          doc
        );
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
};
