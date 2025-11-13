import {
  IntegrationFeedType,
  Resolvers,
} from '../../../__generated__/resolvers-types';
import { DocumentId } from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
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
import { IntegrationFeed } from './integration-feeds.model';

const resolvers: Resolvers = {
  IntegrationFeed: {
    __resolveType(feed: IntegrationFeed) {
      const mapping = {
        [IntegrationFeedType.Connector]: 'Connector',
        [IntegrationFeedType.CsvFeed]: 'CsvFeed',
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
    service_instance: ({ service_instance_id }, _) =>
      getServiceInstance(service_instance_id as ServiceInstanceId),
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
    publicIntegrationFeeds: async (_, input) =>
      integrationFeedsApp.loadPaginatedPublicAccessIntegrationFeeds(input),
    publicIntegrationFeedByServiceSlug: async (_, { serviceSlug }) =>
      integrationFeedsApp.loadPublicAccessIntegrationFeeds(serviceSlug),
    publicIntegrationFeedBySlug: async (_, { slug }) =>
      integrationFeedsApp.loadPublicAccessIntegrationFeed(slug),
  },
};

export default resolvers;
