import { Resolvers } from '../../../__generated__/resolvers-types';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { useCaseDomain } from '../../settings/useCase/use-case.domain';
import { subscriptionApp } from '../../subcription/subscription.app';
import { DocumentChildrenDomain } from '../document/domain/document.children.domain';
import { DocumentDomain } from '../document/domain/document.domain';
import { getServiceInstance } from '../service-instance.domain';
import { CustomDashboardsApp } from './custom-dashboards.app';
import {
  CUSTOM_DASHBOARD_METADATA_KEYS,
  OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
} from './custom-dashboards.domain';

const resolvers: Resolvers = {
  CustomDashboard: {
    use_cases: ({ id }) => useCaseDomain.loadUseCasesByDocumentId(id),
    children_documents: ({ id }) =>
      DocumentChildrenDomain.loadImagesByDocumentId(id),
    uploader: ({ id }, _) => DocumentDomain.loadUploader(id),
    uploader_organization: ({ id }, _) =>
      DocumentDomain.loadUploaderOrganization(id),
    service_instance: ({ service_instance_id }, _) =>
      getServiceInstance(service_instance_id as ServiceInstanceId),
    subscription: async ({ service_instance_id }, _, context) =>
      subscriptionApp.loadSubscriptionModel(context.user, service_instance_id),
  },
  Query: {
    seoCustomDashboardsByServiceSlug: async (_, { serviceSlug }) => {
      const dashboards = await DocumentDomain.loadSeoDocumentsByServiceSlug(
        OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
        serviceSlug,
        CUSTOM_DASHBOARD_METADATA_KEYS
      );
      for (const dashboard of dashboards) {
        dashboard.children_documents =
          await DocumentChildrenDomain.loadImagesByDocumentId(dashboard.id);
        dashboard.uploader = await DocumentDomain.loadUploader(dashboard.id);
        dashboard.use_cases = await useCaseDomain.loadUseCasesByDocumentId(
          dashboard.id
        );
      }
      return dashboards;
    },
    seoCustomDashboardBySlug: async (_, { slug }) => {
      return CustomDashboardsApp.loadSeoCustomDashboard(slug);
    },
  },
};

export default resolvers;
