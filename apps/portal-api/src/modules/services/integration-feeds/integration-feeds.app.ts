import {
  IntegrationFeedConnection,
  QueryIntegrationFeedsArgs,
  QueryPublicIntegrationFeedsArgs,
} from '../../../__generated__/resolvers-types';
import { DocumentId } from '../../../model/kanel/public/Document';
import { PortalContext } from '../../../model/portal-context';
import { WithLabels } from '../../../utils/types';
import {
  loadParentDocumentsByServiceInstance,
  loadSeoDocuments,
  loadSeoDocumentsByServiceSlug,
} from '../document/document.domain';
import {
  loadDocumentWithCountersById,
  loadSeoDocumentWithCountersBySlug,
} from '../document/document.helper';
import {
  INTEGRATION_FEED_METADATA,
  IntegrationFeed,
  OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
} from './integration-feeds.model';

export const integrationFeedsApp = {
  loadIntegrationFeeds: async (
    context: PortalContext,
    input: QueryIntegrationFeedsArgs
  ) => {
    return loadParentDocumentsByServiceInstance<IntegrationFeedConnection>(
      OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
      input,
      INTEGRATION_FEED_METADATA
    );
  },
  loadIntegrationFeed: async (
    context: PortalContext,
    documentId: DocumentId
  ): Promise<WithLabels<IntegrationFeed>> => {
    return loadDocumentWithCountersById(
      context,
      documentId,
      INTEGRATION_FEED_METADATA
    );
  },
  loadPublicAccessIntegrationFeeds: async (serviceSlug: string) =>
    loadSeoDocumentsByServiceSlug(
      OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
      serviceSlug,
      INTEGRATION_FEED_METADATA
    ),

  loadPaginatedPublicAccessIntegrationFeeds: async (
    input: QueryPublicIntegrationFeedsArgs
  ) => {
    const { slug, ...opts } = input;
    return loadSeoDocuments<IntegrationFeedConnection>(
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
