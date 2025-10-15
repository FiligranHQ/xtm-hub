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
  OPENAEV_SCENARIO_DOCUMENT_TYPE,
  OPENAEV_SCENARIO_METADATA,
  OpenAEVScenario,
} from './openaev-scenarios.domain';

export const OpenAEVScenariosApp = {
  createOpenAEVScenario: async (
    context: PortalContext,
    input: Partial<OpenAEVScenario>,
    document: Upload[]
  ) => {
    const trx = await dbTx();
    try {
      const doc = await createDocumentWithChildren<OpenAEVScenario>(
        OPENAEV_SCENARIO_DOCUMENT_TYPE,
        input,
        document,
        OPENAEV_SCENARIO_METADATA,
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

  loadOpenAEVScenario: async (
    context: PortalContext,
    documentId: DocumentId
  ) => {
    return loadDocumentWithCountersById(
      context,
      documentId,
      OPENAEV_SCENARIO_METADATA
    );
  },

  loadSeoOpenAEVScenario: async (slug: string) => {
    return loadSeoDocumentWithCountersBySlug(
      OPENAEV_SCENARIO_DOCUMENT_TYPE,
      slug,
      OPENAEV_SCENARIO_METADATA
    );
  },
};
