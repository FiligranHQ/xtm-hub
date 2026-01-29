import {
  IntegrationType,
  Resolvers,
} from '../../../__generated__/resolvers-types';
import { DocumentId } from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { logApp } from '../../../utils/app-logger.util';
import { extractId } from '../../../utils/utils';
import { useCaseDomain } from '../../settings/useCase/use-case.domain';
import { subscriptionApp } from '../../subcription/subscription.app';
import { DocumentChildrenDomain } from '../document/domain/document.children.domain';
import { DocumentDomain } from '../document/domain/document.domain';
import { getServiceInstance } from '../service-instance.domain';
import { integrationsApp } from './integrations.app';
import { Integration } from './integrations.model';

const resolvers: Resolvers = {
  Integration: {
    __resolveType(feed: Integration) {
      const mapping = {
        [IntegrationType.Connector]: 'Connector',
        [IntegrationType.CsvFeed]: 'CsvFeed',
        [IntegrationType.TaxiiFeed]: 'TaxiiFeed',
        [IntegrationType.Stream]: 'Stream',
        [IntegrationType.ThirdPartyIntegration]: 'ThirdPartyIntegration',
      };

      const resolvedType = mapping[feed.integration_type];
      if (!resolvedType) {
        logApp.error(
          `Unknown resolve type for integration ${feed.id} and integration type ${feed.integration_type}`
        );
      }

      return resolvedType;
    },
    use_cases: ({ id }) => useCaseDomain.loadUseCasesByDocumentId(id),
    children_documents: ({ id }) =>
      DocumentChildrenDomain.loadImagesByDocumentId(id),
    uploader: ({ id }, _) => DocumentDomain.loadUploader(id),
    uploader_organization: ({ id }, _) =>
      DocumentDomain.loadUploaderOrganization(id),
    service_instance: ({ service_instance_id }, _) =>
      getServiceInstance(service_instance_id as ServiceInstanceId),
    subscription: ({ service_instance_id }, _, context) =>
      subscriptionApp.loadSubscriptionModel(context.user, service_instance_id),
  },
  Query: {
    integrations: async (_, input) => integrationsApp.loadIntegrations(input),
    integration: async (_, { id }) =>
      integrationsApp.loadIntegration(extractId<DocumentId>(id)),
    publicIntegrations: async (_, input) =>
      integrationsApp.loadPaginatedPublicAccessIntegrations(input),
    publicIntegrationsByServiceSlug: async (_, { serviceSlug }) =>
      integrationsApp.loadPublicAccessIntegrations(serviceSlug),
    publicIntegrationBySlug: async (_, { slug }) =>
      integrationsApp.loadPublicAccessIntegration(slug),
  },
};

export default resolvers;
