import {
  IntegrationsType,
  Resolvers,
} from '../../../__generated__/resolvers-types';
import { DocumentId } from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { extractId } from '../../../utils/utils';
import { labelsDomain } from '../../settings/labels/labels.domain';
import { subscriptionApp } from '../../subcription/subscription.app';
import { DocumentChildrenDomain } from '../document/domain/document.children.domain';
import {
  getUploader,
  loadUploaderOrganization,
} from '../document/domain/document.domain';
import { getServiceInstance } from '../service-instance.domain';
import { integrationFeedsApp } from './integration-feeds.app';
import { Integrations } from './integration-feeds.model';

const resolvers: Resolvers = {
  Integrations: {
    __resolveType(feed: Integrations) {
      const mapping = {
        [IntegrationsType.Connector]: 'Connector',
        [IntegrationsType.CsvFeed]: 'CsvFeed',
      };

      return mapping[feed.integration_type];
    },
    labels: ({ id }) => labelsDomain.loadLabelsByDocumentId(id),
    children_documents: ({ id }) =>
      DocumentChildrenDomain.loadImagesByDocumentId(id),
    uploader: ({ id }, _) => getUploader(id),
    uploader_organization: ({ id }, _) => loadUploaderOrganization(id),
    service_instance: ({ service_instance_id }, _) =>
      getServiceInstance(service_instance_id as ServiceInstanceId),
    subscription: ({ service_instance_id }, _, context) =>
      subscriptionApp.loadSubscriptionModel(context, service_instance_id),
  },
  Query: {
    integrations: async (_, input) =>
      integrationFeedsApp.loadIntegrations(input),
    integration: async (_, { id }) =>
      integrationFeedsApp.loadIntegration(extractId<DocumentId>(id)),
    publicIntegrations: async (_, input) =>
      integrationFeedsApp.loadPaginatedPublicAccessIntegrationFeeds(input),
    publicIntegrationByServiceSlug: async (_, { serviceSlug }) =>
      integrationFeedsApp.loadPublicAccessIntegrationFeeds(serviceSlug),
    publicIntegrationBySlug: async (_, { slug }) =>
      integrationFeedsApp.loadPublicAccessIntegrationFeed(slug),
  },
};

export default resolvers;
