import { dbTx } from '../../../../../knexfile';
import { DocumentId } from '../../../../model/kanel/public/Document';
import { PortalContext } from '../../../../model/portal-context';
import { logApp } from '../../../../utils/app-logger.util';
import { WithLabels } from '../../../../utils/types';
import { telemetryApp } from '../../../telemetry/telemetry.app';
import { buildCreateEvent } from '../../../telemetry/telemetry.helper';
import { createDocumentWithChildren } from '../../document/document.domain';
import {
  loadDocumentWithCountersById,
  loadSeoDocumentWithCountersBySlug,
  Upload,
} from '../../document/document.helper';
import {
  CSV_FEED_METADATA,
  CsvFeed,
  INTEGRATION_FEED_CSV_FEED_TYPE,
  OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
} from '../integration-feeds.model';

export const csvFeedsApp = {
  createCsvFeed: async (
    context: PortalContext,
    input: Partial<CsvFeed>,
    document: Upload[]
  ) => {
    const trx = await dbTx();
    try {
      const doc = await createDocumentWithChildren<CsvFeed>(
        OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
        { ...input, integration_type: INTEGRATION_FEED_CSV_FEED_TYPE },
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

  loadCsvFeed: async (context: PortalContext, documentId: DocumentId) => {
    return loadDocumentWithCountersById(context, documentId);
  },

  loadSeoCsvFeed: async (slug: string): Promise<CsvFeed> => {
    return loadSeoDocumentWithCountersBySlug<WithLabels<CsvFeed>>(
      OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
      slug,
      CSV_FEED_METADATA
    );
  },
};
