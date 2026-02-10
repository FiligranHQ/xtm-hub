import { DocumentId } from '../../../model/kanel/public/Document';
import { WithUseCases } from '../../../utils/types';
import {
  loadDocumentWithCountersById,
  loadSeoDocumentWithCountersBySlug,
} from '../document/document.helper';
import { DocumentDomain } from '../document/domain/document.domain';
import {
  Integration,
  INTEGRATION_METADATA_KEYS,
  OPENCTI_INTEGRATION_DOCUMENT_TYPE,
} from './integrations.model';

export const integrationsApp = {
  loadIntegration: async (
    documentId: DocumentId
  ): Promise<WithUseCases<Integration>> => {
    return loadDocumentWithCountersById(documentId, INTEGRATION_METADATA_KEYS);
  },
  loadPublicAccessIntegrations: async (serviceSlug: string) =>
    DocumentDomain.loadSeoDocumentsByServiceSlug(
      OPENCTI_INTEGRATION_DOCUMENT_TYPE,
      serviceSlug,
      INTEGRATION_METADATA_KEYS
    ),

  loadPublicAccessIntegration: async (slug: string) => {
    return loadSeoDocumentWithCountersBySlug<WithUseCases<Integration>>(
      OPENCTI_INTEGRATION_DOCUMENT_TYPE,
      slug,
      INTEGRATION_METADATA_KEYS
    );
  },
};
