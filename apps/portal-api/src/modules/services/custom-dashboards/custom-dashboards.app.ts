import { DocumentId } from '../../../model/kanel/public/Document';
import {
  loadDocumentWithCountersById,
  loadSeoDocumentWithCountersBySlug,
} from '../document/document.helper';
import {
  CUSTOM_DASHBOARD_METADATA_KEYS,
  OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
} from './custom-dashboards.domain';

export const CustomDashboardsApp = {
  loadCustomDashboard: async (documentId: DocumentId) => {
    return loadDocumentWithCountersById(
      documentId,
      CUSTOM_DASHBOARD_METADATA_KEYS
    );
  },

  loadSeoCustomDashboard: async (slug: string) => {
    return loadSeoDocumentWithCountersBySlug(
      OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
      slug,
      CUSTOM_DASHBOARD_METADATA_KEYS
    );
  },
};
