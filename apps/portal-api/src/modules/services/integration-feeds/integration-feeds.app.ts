import {
  IntegrationFeedConnection,
  QueryIntegrationFeedsArgs,
} from '../../../__generated__/resolvers-types';
import { DocumentId } from '../../../model/kanel/public/Document';
import { PortalContext } from '../../../model/portal-context';
import { WithLabels } from '../../../utils/types';
import { loadParentDocumentsByServiceInstance } from '../document/document.domain';
import { loadDocumentWithCountersById } from '../document/document.helper';
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
      context,
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
};
