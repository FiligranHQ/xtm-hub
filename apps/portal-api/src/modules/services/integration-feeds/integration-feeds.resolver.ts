import { Resolvers } from '../../../__generated__/resolvers-types';
import { DocumentId } from '../../../model/kanel/public/Document';
import { extractId } from '../../../utils/utils';
import { labelsDomain } from '../../settings/labels/labels.domain';
import { subscriptionApp } from '../../subcription/subscription.app';
import {
  getUploader,
  getUploaderOrganization,
  loadImagesByDocumentId,
} from '../document/document.domain';
import { getServiceInstance } from '../service-instance.domain';
import { integrationFeedsApp } from './integration-feeds.app';
import {
  INTEGRATION_FEED_CONNECTORS_TYPE,
  INTEGRATION_FEED_CSV_FEED_TYPE,
  IntegrationFeed,
} from './integration-feeds.model';

const resolvers: Resolvers = {
  IntegrationFeed: {
    __resolveType(feed: IntegrationFeed) {
      const mapping = {
        [INTEGRATION_FEED_CONNECTORS_TYPE]: 'Connector',
        [INTEGRATION_FEED_CSV_FEED_TYPE]: 'CsvFeed',
      };

      return mapping[feed.integration_type];
    },
    labels: ({ id }) =>
      labelsDomain.loadLabelsByDocumentId(id, { unsecured: true }),
    children_documents: ({ id }) => loadImagesByDocumentId(id),
    uploader: ({ id }, _, context) =>
      getUploader(context, id, { unsecured: true }),
    uploader_organization: ({ id }, _, context) =>
      getUploaderOrganization(context, id, { unsecured: true }),
    service_instance: ({ service_instance_id }, _, context) =>
      getServiceInstance(context, service_instance_id),
    subscription: ({ service_instance_id }, _, context) =>
      subscriptionApp.loadSubscriptionModel(context, service_instance_id),
  },
  Query: {
    integrationFeeds: async (_, input, context) =>
      integrationFeedsApp.loadIntegrationFeeds(context, input),

    integrationFeed: async (_, { id }, context) =>
      integrationFeedsApp.loadIntegrationFeed(
        context,
        extractId<DocumentId>(id)
      ),
  },
};

export default resolvers;
