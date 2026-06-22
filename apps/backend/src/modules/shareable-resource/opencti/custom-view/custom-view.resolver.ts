import { Resolvers } from '../../../../__generated__/resolvers-types';
import { DocumentChildrenDomain } from '../../../document/domain/document.children.domain';
import { DocumentDomain } from '../../../document/domain/document.domain';
import { ServiceInstanceDomain } from '../../../service/instance/service-instance.domain';
import { subscriptionApp } from '../../../subscription/subscription.app';
import { useCaseDomain } from '../../../use-case/use-case.domain';

const parseEntityTypes = (entityTypes: unknown): string[] => {
  if (!entityTypes) return [];
  if (Array.isArray(entityTypes)) return entityTypes as string[];
  try {
    const parsed = JSON.parse(entityTypes as string);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const resolvers: Resolvers = {
  CustomView: {
    use_cases: ({ id }) => useCaseDomain.loadUseCasesByDocumentId(id),
    entity_types: ({ entity_types }) => parseEntityTypes(entity_types),
    children_documents: ({ id }) =>
      DocumentChildrenDomain.loadImagesByDocumentId(id),
    uploader: ({ id }, _) => DocumentDomain.loadUploader(id),
    uploader_organization: ({ id }, _) =>
      DocumentDomain.loadUploaderOrganization(id),
    service_instance: ({ service_instance_id }, _) => {
      if (!service_instance_id) return null;
      return ServiceInstanceDomain.getServiceInstance(service_instance_id);
    },
    subscription: async ({ service_instance_id }, _, context) => {
      if (!service_instance_id) return null;
      return subscriptionApp.loadSubscriptionModel(
        context.user,
        service_instance_id
      );
    },
  },
};

export default resolvers;
