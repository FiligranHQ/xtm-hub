import { Resolvers } from '../../../__generated__/resolvers-types';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { useCaseDomain } from '../../settings/useCase/use-case.domain';
import { subscriptionApp } from '../../subcription/subscription.app';
import { DocumentChildrenDomain } from '../document/domain/document.children.domain';
import { DocumentDomain } from '../document/domain/document.domain';
import { getServiceInstance } from '../service-instance.domain';

const resolvers: Resolvers = {
  OpenAEVScenario: {
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
