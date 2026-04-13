import { Resolvers } from '../../../../__generated__/resolvers-types';
import { getServiceInstance } from '../../../services/service-instance.domain';
import { subscriptionApp } from '../../../subscription/subscription.app';
import { useCaseDomain } from '../../../use-case/use-case.domain';
import { DocumentChildrenDomain } from '../../domain/document.children.domain';
import { DocumentDomain } from '../../domain/document.domain';

const resolvers: Resolvers = {
  OpenAEVScenario: {
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
