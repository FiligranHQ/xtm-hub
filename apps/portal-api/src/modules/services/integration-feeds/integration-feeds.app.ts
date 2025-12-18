import {
  IntegrationFeedConnection,
  QueryIntegrationFeedsArgs,
  QueryPublicIntegrationFeedsArgs,
} from '../../../__generated__/resolvers-types';
import { DocumentId } from '../../../model/kanel/public/Document';
import { WithLabels } from '../../../utils/types';
import {
  loadDocumentWithCountersById,
  loadSeoDocumentWithCountersBySlug,
} from '../document/document.helper';
import { DocumentDomain } from '../document/domain/document.domain';
import {
  INTEGRATION_FEED_METADATA,
  IntegrationFeed,
  OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
} from './integration-feeds.model';

export const integrationFeedsApp = {
  loadIntegrationFeeds: async (input: QueryIntegrationFeedsArgs) => {
    return DocumentDomain.loadParentDocumentsByServiceInstance<IntegrationFeedConnection>(
      OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
      input,
      INTEGRATION_FEED_METADATA
    );
  },
  loadIntegrationFeed: async (
    documentId: DocumentId
  ): Promise<WithLabels<IntegrationFeed>> => {
    return loadDocumentWithCountersById(documentId, INTEGRATION_FEED_METADATA);
  },
  loadPublicAccessIntegrationFeeds: async (serviceSlug: string) =>
    DocumentDomain.loadSeoDocumentsByServiceSlug(
      OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
      serviceSlug,
      INTEGRATION_FEED_METADATA
    ),

  loadPaginatedPublicAccessIntegrationFeeds: async (
    input: QueryPublicIntegrationFeedsArgs
  ) => {
    const { slug, ...opts } = input;
    return DocumentDomain.loadPaginatedSeoDocumentsByServiceSlug<IntegrationFeedConnection>(
      OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
      slug,
      opts,
      INTEGRATION_FEED_METADATA
    );
  },

  loadPublicAccessIntegrationFeed: async (slug: string) => {
    return loadSeoDocumentWithCountersBySlug<WithLabels<IntegrationFeed>>(
      OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
      slug,
      INTEGRATION_FEED_METADATA
    );
  },
};
