import { loadSeoDocumentWithCountersBySlug } from '../document/document.helper';
import {
  OPENAEV_SCENARIO_DOCUMENT_TYPE,
  OPENAEV_SCENARIO_METADATA_KEYS,
} from './openaev-scenarios.domain';

export const OpenAEVScenariosApp = {
  loadSeoOpenAEVScenario: async (slug: string) => {
    return loadSeoDocumentWithCountersBySlug(
      OPENAEV_SCENARIO_DOCUMENT_TYPE,
      slug,
      OPENAEV_SCENARIO_METADATA_KEYS
    );
  },
};
