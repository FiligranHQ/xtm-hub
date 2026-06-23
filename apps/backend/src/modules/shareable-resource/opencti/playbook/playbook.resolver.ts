import {
  Resolvers,
  ShareableResource,
} from '../../../../__generated__/resolvers-types';
import { ServiceInstanceDomain } from '../../../service/instance/service-instance.domain';
import { subscriptionApp } from '../../../subscription/subscription.app';

const resolvers: Resolvers = {
  OpenCTIPlaybook: {
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
