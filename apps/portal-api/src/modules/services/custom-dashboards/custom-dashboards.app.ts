import { dbTx } from '../../../../knexfile';
import { DocumentId } from '../../../model/kanel/public/Document';
import { PortalContext } from '../../../model/portal-context';
import { logApp } from '../../../utils/app-logger.util';
import { telemetryApp } from '../../telemetry/telemetry.app';
import { buildCreateEvent } from '../../telemetry/telemetry.helper';
import { createDocumentWithChildren } from '../document/document.domain';
import {
  loadDocumentWithCountersById,
  loadSeoDocumentWithCountersBySlug,
  Upload,
} from '../document/document.helper';
import {
  CUSTOM_DASHBOARD_METADATA,
  CustomDashboard,
  OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
} from './custom-dashboards.domain';

export const CustomDashboardsApp = {
  createCustomDashboard: async (
    context: PortalContext,
    input: Partial<CustomDashboard>,
    document: Upload[]
  ) => {
    const trx = await dbTx();
    try {
      const doc = await createDocumentWithChildren<CustomDashboard>(
        OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
        input,
        document,
        CUSTOM_DASHBOARD_METADATA,
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
        logApp.error(
          'Unable to send telemetry event for openAEV scenario creation',
          {
            error,
          }
        );
      }

      return doc;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  },

  loadCustomDashboard: async (
    context: PortalContext,
    documentId: DocumentId
  ) => {
    return loadDocumentWithCountersById(
      context,
      documentId,
      CUSTOM_DASHBOARD_METADATA
    );
  },

  loadSeoCustomDashboard: async (slug: string) => {
    return loadSeoDocumentWithCountersBySlug(
      OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
      slug,
      CUSTOM_DASHBOARD_METADATA
    );
  },
};
