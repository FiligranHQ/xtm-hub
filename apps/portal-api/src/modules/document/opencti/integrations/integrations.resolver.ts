import {
  IntegrationType,
  Resolvers,
} from '../../../../__generated__/resolvers-types';
import { logApp } from '../../../../utils/app-logger.util';
import { getServiceInstance } from '../../../services/service-instance.domain';
import { subscriptionApp } from '../../../subscription/subscription.app';
import { useCaseDomain } from '../../../use-case/use-case.domain';
import { DocumentChildrenDomain } from '../../domain/document.children.domain';
import { DocumentDomain } from '../../domain/document.domain';
import { Integration } from './integrations.model';

const resolvers: Resolvers = {
  Integration: {
    __resolveType(feed: Integration) {
      const mapping = {
        [IntegrationType.Connector]: 'Connector',
        [IntegrationType.CsvFeed]: 'CsvFeed',
        [IntegrationType.TaxiiFeed]: 'TaxiiFeed',
        [IntegrationType.RssFeed]: 'RssFeed',
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
      getServiceInstance(service_instance_id),
    subscription: ({ service_instance_id }, _, context) =>
      subscriptionApp.loadSubscriptionModel(context.user, service_instance_id),
  },
};

export default resolvers;
