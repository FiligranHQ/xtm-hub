import { DocumentId } from '../../../model/kanel/public/Document';
import { logApp } from '../../../utils/app-logger.util';
import { telemetryApp } from '../../telemetry/telemetry.app';
import { buildCreateEvent } from '../../telemetry/telemetry.helper';
import { DocumentApp } from '../document/document.app';
import {
  loadDocumentWithCountersById,
  loadSeoDocumentWithCountersBySlug,
} from '../document/document.helper';
import { Upload } from '../document/document.uploads.helper';
import {
  OPENAEV_SCENARIO_DOCUMENT_TYPE,
  OPENAEV_SCENARIO_METADATA,
  OpenAEVScenario,
} from './openaev-scenarios.domain';

export const OpenAEVScenariosApp = {
  createOpenAEVScenario: async (
    input: Partial<OpenAEVScenario>,
    document: Upload[]
  ) => {
    const doc = await DocumentApp.createDocumentWithChildren<OpenAEVScenario>(
      OPENAEV_SCENARIO_DOCUMENT_TYPE,
      input,
      document,
      OPENAEV_SCENARIO_METADATA
    );

    try {
      const createEvent = await buildCreateEvent(doc);
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
  },

  loadOpenAEVScenario: async (documentId: DocumentId) => {
    return loadDocumentWithCountersById(documentId, OPENAEV_SCENARIO_METADATA);
  },

  loadSeoOpenAEVScenario: async (slug: string) => {
    return loadSeoDocumentWithCountersBySlug(
      OPENAEV_SCENARIO_DOCUMENT_TYPE,
      slug,
      OPENAEV_SCENARIO_METADATA
    );
  },
};
