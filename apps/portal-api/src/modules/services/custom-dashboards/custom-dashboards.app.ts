import { dbTx } from '../../../../knexfile';
import { PortalContext } from '../../../model/portal-context';
import { logApp } from '../../../utils/app-logger.util';
import { telemetryApp } from '../../telemetry/telemetry.app';
import { buildCreateEvent } from '../../telemetry/telemetry.helper';
import { createDocumentWithChildren } from '../document/document.domain';
import { Upload } from '../document/document.helper';
import {
  CUSTOM_DASHBOARD_DOCUMENT_TYPE,
  CUSTOM_DASHBOARD_METADATA,
  CustomDashboard,
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
        CUSTOM_DASHBOARD_DOCUMENT_TYPE,
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
};
