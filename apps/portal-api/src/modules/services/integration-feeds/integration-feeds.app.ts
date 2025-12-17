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
  INTEGRATION_FEED_METADATA,
  Integrations,
  OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
} from './integration-feeds.model';

export const integrationFeedsApp = {
  loadIntegrations: async (input: QueryIntegrationsArgs) => {
    return loadParentDocumentsByServiceInstance<IntegrationsConnection>(
      OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
      input,
      INTEGRATION_FEED_METADATA
    );
  },
  loadIntegration: async (
    documentId: DocumentId
  ): Promise<WithLabels<Integrations>> => {
    return loadDocumentWithCountersById(documentId, INTEGRATION_FEED_METADATA);
  },
  loadPublicAccessIntegrationFeeds: async (serviceSlug: string) =>
    loadSeoDocumentsByServiceSlug(
      OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
      serviceSlug,
      INTEGRATION_FEED_METADATA
    ),

  loadPaginatedPublicAccessIntegrationFeeds: async (
    input: QueryPublicIntegrationsArgs
  ) => {
    const { slug, ...opts } = input;
    return loadPaginatedSeoDocumentsByServiceSlug<IntegrationsConnection>(
      OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
      slug,
      opts,
      INTEGRATION_FEED_METADATA
    );
  },

  loadPublicAccessIntegrationFeed: async (slug: string) => {
    return loadSeoDocumentWithCountersBySlug<WithLabels<Integrations>>(
      OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
      slug,
      INTEGRATION_FEED_METADATA
    );
  },
};
