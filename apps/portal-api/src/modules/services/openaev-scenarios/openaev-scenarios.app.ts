import { DocumentId } from '../../../model/kanel/public/Document';
import {
  loadDocumentWithCountersById,
  loadSeoDocumentWithCountersBySlug,
} from '../document/document.helper';
import {
  OPENAEV_SCENARIO_DOCUMENT_TYPE,
  OPENAEV_SCENARIO_METADATA_KEYS,
} from './openaev-scenarios.domain';

export const OpenAEVScenariosApp = {
  loadOpenAEVScenario: async (documentId: DocumentId) => {
    return loadDocumentWithCountersById(
      documentId,
      OPENAEV_SCENARIO_METADATA_KEYS
    );
  },

  loadSeoOpenAEVScenario: async (slug: string) => {
    return loadSeoDocumentWithCountersBySlug(
      OPENAEV_SCENARIO_DOCUMENT_TYPE,
      slug,
      OPENAEV_SCENARIO_METADATA_KEYS
    );
  },
};
