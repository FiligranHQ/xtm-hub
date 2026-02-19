import { DocumentDomain } from '../document/domain/document.domain';
import {
  INTEGRATION_METADATA_KEYS,
  OPENCTI_INTEGRATION_DOCUMENT_TYPE,
} from './integrations.model';

export const integrationsApp = {
  loadPublicAccessIntegrations: async (serviceSlug: string) =>
    DocumentDomain.loadSeoDocumentsByServiceSlug(
      OPENCTI_INTEGRATION_DOCUMENT_TYPE,
      serviceSlug,
      INTEGRATION_METADATA_KEYS
    ),
};
