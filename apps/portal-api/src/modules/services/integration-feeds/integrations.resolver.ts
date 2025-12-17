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
import { integrationsApp } from './integrations.app';
import { Integrations } from './integrations.model';

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
    integrations: async (_, input) => integrationsApp.loadIntegrations(input),
    integration: async (_, { id }) =>
      integrationsApp.loadIntegration(extractId<DocumentId>(id)),
    publicIntegrations: async (_, input) =>
      integrationsApp.loadPaginatedPublicAccessIntegrations(input),
    publicIntegrationByServiceSlug: async (_, { serviceSlug }) =>
      integrationsApp.loadPublicAccessIntegrations(serviceSlug),
    publicIntegrationBySlug: async (_, { slug }) =>
      integrationsApp.loadPublicAccessIntegration(slug),
  },
};

export default resolvers;
