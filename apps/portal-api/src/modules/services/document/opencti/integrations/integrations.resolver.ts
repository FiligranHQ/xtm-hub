import {
  IntegrationType,
  Resolvers,
} from '../../../../../__generated__/resolvers-types';
import { ServiceInstanceId } from '../../../../../model/kanel/public/ServiceInstance';
import { logApp } from '../../../../../utils/app-logger.util';
import { useCaseDomain } from '../../../../settings/useCase/use-case.domain';
import { subscriptionApp } from '../../../../subcription/subscription.app';
import { getServiceInstance } from '../../../service-instance.domain';
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
};

export default resolvers;
