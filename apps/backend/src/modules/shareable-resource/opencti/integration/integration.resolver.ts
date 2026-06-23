import {
  IntegrationType,
  Resolvers,
  ShareableResource,
} from '../../../../__generated__/resolvers-types';
import { logApp } from '../../../../utils/app-logger.util';
import { ServiceInstanceDomain } from '../../../service/instance/service-instance.domain';
import { subscriptionApp } from '../../../subscription/subscription.app';

const resolvers: Resolvers = {
  Integration: {
    __resolveType(feed) {
      const mapping = {
        [IntegrationType.Connector]: 'Connector',
        [IntegrationType.CsvFeed]: 'CsvFeed',
        [IntegrationType.TaxiiFeed]: 'TaxiiFeed',
        [IntegrationType.RssFeed]: 'RssFeed',
        [IntegrationType.Stream]: 'Stream',
        [IntegrationType.ThirdPartyIntegration]: 'ThirdPartyIntegration',
      } as const;

      const resolvedType =
        mapping[feed.integration_type as keyof typeof mapping];
      if (!resolvedType) {
        logApp.error(
          `Unknown resolve type for integration ${feed.id} and integration type ${feed.integration_type}`
        );
      }

      return resolvedType;
    },
    use_cases: ({ id }, _, context) =>
      context.dataLoaders.useCasesByDocumentIdLoader.load(id),
    children_documents: async ({ id }, _, context) =>
      (await context.dataLoaders.imagesByDocumentIdLoader.load(
        id
      )) as unknown as ShareableResource[],
    uploader: ({ id }, _, context) =>
      context.dataLoaders.uploaderLoader.load(id),
    uploader_organization: ({ id }, _, context) =>
      context.dataLoaders.uploaderOrganizationLoader.load(id),
    service_instance: ({ service_instance_id }, _) => {
      if (!service_instance_id) return null;
      return ServiceInstanceDomain.getServiceInstance(service_instance_id);
    },
    subscription: ({ service_instance_id }, _, context) => {
      if (!service_instance_id) return null;
      return subscriptionApp.loadSubscriptionModel(
        context.user,
        service_instance_id
      );
    },
  },
};

export default resolvers;
