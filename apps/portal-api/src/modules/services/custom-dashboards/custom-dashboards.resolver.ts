import {
  CustomDashboardConnection,
  Resolvers,
} from '../../../__generated__/resolvers-types';
import { DocumentId } from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { ErrorCode, UnknownErrorCode } from '../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { AlreadyExistsError } from '../../../utils/error/error.util';
import { extractId } from '../../../utils/utils';
import { labelsDomain } from '../../settings/labels/labels.domain';
import { subscriptionApp } from '../../subcription/subscription.app';
import { DocumentApp } from '../document/document.app';
import { DocumentChildrenDomain } from '../document/domain/document.children.domain';
import { DocumentDomain } from '../document/domain/document.domain';
import { getServiceInstance } from '../service-instance.domain';
import { CustomDashboardsApp } from './custom-dashboards.app';
import {
  CUSTOM_DASHBOARD_METADATA,
  CustomDashboard,
  OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
} from './custom-dashboards.domain';

const resolvers: Resolvers = {
  CustomDashboard: {
    labels: ({ id }) =>
      labelsDomain.loadLabelsByDocumentId(id, { unsecured: true }),
    children_documents: ({ id }) =>
      DocumentChildrenDomain.loadImagesByDocumentId(id),
    uploader: ({ id }, _) =>
      DocumentDomain.loadUploader(id, { unsecured: true }),
    uploader_organization: ({ id }, _) =>
      DocumentDomain.loadUploaderOrganization(id, { unsecured: true }),
    service_instance: ({ service_instance_id }, _) =>
      getServiceInstance(service_instance_id as ServiceInstanceId),
    subscription: async ({ service_instance_id }, _, context) =>
      subscriptionApp.loadSubscriptionModel(context, service_instance_id),
  },
  Query: {
    seoCustomDashboardsByServiceSlug: async (_, { serviceSlug }) => {
      const dashboards = await DocumentDomain.loadSeoDocumentsByServiceSlug(
        OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
        serviceSlug,
        CUSTOM_DASHBOARD_METADATA
      );
      for (const dashboard of dashboards) {
        dashboard.children_documents =
          await DocumentChildrenDomain.loadImagesByDocumentId(dashboard.id);
        dashboard.uploader = await DocumentDomain.loadUploader(dashboard.id, {
          unsecured: true,
        });
        dashboard.labels = await labelsDomain.loadLabelsByDocumentId(
          dashboard.id,
          {
            unsecured: true,
          }
        );
      }
      return dashboards;
    },
    seoCustomDashboardBySlug: async (_, { slug }) => {
      return CustomDashboardsApp.loadSeoCustomDashboard(slug);
    },
    customDashboards: async (_, input) => {
      return DocumentDomain.loadParentDocumentsByServiceInstance<CustomDashboardConnection>(
        OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
        input,
        CUSTOM_DASHBOARD_METADATA
      );
    },
    customDashboard: async (_, { id }) =>
      CustomDashboardsApp.loadCustomDashboard(extractId<DocumentId>(id)),
  },
  Mutation: {
    createCustomDashboard: async (_, { input, document }) => {
      try {
        return CustomDashboardsApp.createCustomDashboard(input, document);
      } catch (error) {
        if (error.message?.includes('document_type_slug_unique')) {
          throw AlreadyExistsError(ErrorCode.CustomDashboardUniqueSlugError, {
            detail: error,
          });
        }

        throw mapToGraphQLError(
          error,
          UnknownErrorCode.CustomDashboardInsertionError
        );
      }
    },
    updateCustomDashboard: async (_, input) => {
      try {
        return DocumentApp.updateDocumentWithChildren<CustomDashboard>(
          OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE,
          extractId<DocumentId>(input.documentId),
          input,
          CUSTOM_DASHBOARD_METADATA
        );
      } catch (error) {
        if (error.message?.includes('document_type_slug_unique')) {
          throw AlreadyExistsError(ErrorCode.CustomDashboardUniqueSlugError, {
            detail: error,
          });
        }

        throw mapToGraphQLError(
          error,
          UnknownErrorCode.CustomDashboardUpdateError
        );
      }
    },
    deleteCustomDashboard: async (_, { id }, context) => {
      try {
        return DocumentApp.deleteDocument<CustomDashboard>(
          extractId<DocumentId>(id),
          context.serviceInstanceId as ServiceInstanceId,
          true
        );
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.DeleteDocumentError);
      }
    },
  },
};

export default resolvers;
