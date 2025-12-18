import {
  IntegrationsConnection,
  QueryIntegrationsArgs,
  QueryPublicIntegrationsArgs,
} from '../../../__generated__/resolvers-types';
import { DocumentId } from '../../../model/kanel/public/Document';
import { WithLabels } from '../../../utils/types';
import {
  loadDocumentWithCountersById,
  loadSeoDocumentWithCountersBySlug,
} from '../document/document.helper';
import {
  loadPaginatedSeoDocumentsByServiceSlug,
  loadParentDocumentsByServiceInstance,
  loadSeoDocumentsByServiceSlug,
} from '../document/domain/document.domain';
import {
  INTEGRATION_METADATA,
  Integrations,
  OPENCTI_INTEGRATION_DOCUMENT_TYPE,
} from './integrations.model';

export const integrationsApp = {
  loadIntegrations: async (input: QueryIntegrationsArgs) => {
    return loadParentDocumentsByServiceInstance<IntegrationsConnection>(
      OPENCTI_INTEGRATION_DOCUMENT_TYPE,
      input,
      INTEGRATION_METADATA
    );
  },
  loadIntegration: async (
    documentId: DocumentId
  ): Promise<WithLabels<Integrations>> => {
    return loadDocumentWithCountersById(documentId, INTEGRATION_METADATA);
  },
  loadPublicAccessIntegrations: async (serviceSlug: string) =>
    loadSeoDocumentsByServiceSlug(
      OPENCTI_INTEGRATION_DOCUMENT_TYPE,
      serviceSlug,
      INTEGRATION_METADATA
    ),

  loadPaginatedPublicAccessIntegrations: async (
    input: QueryPublicIntegrationsArgs
  ) => {
    const { slug, ...opts } = input;
    return loadPaginatedSeoDocumentsByServiceSlug<IntegrationsConnection>(
      OPENCTI_INTEGRATION_DOCUMENT_TYPE,
      slug,
      opts,
      INTEGRATION_METADATA
    );
  },

  loadPublicAccessIntegration: async (slug: string) => {
    return loadSeoDocumentWithCountersBySlug<WithLabels<Integrations>>(
      OPENCTI_INTEGRATION_DOCUMENT_TYPE,
      slug,
      INTEGRATION_METADATA
    );
  },
};
