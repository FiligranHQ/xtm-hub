import { dbTx } from '../../../../knexfile';
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
import { loadSubscriptionByServiceInstanceAndSelectedOrganization } from '../../subcription/subscription.domain';
import {
  deleteDocument,
  getLabels,
  getUploader,
  getUploaderOrganization,
  loadDocumentById,
  loadImagesByDocumentId,
  loadParentDocumentsByServiceInstance,
  loadSeoDocumentBySlug,
  loadSeoDocumentsByServiceSlug,
  updateDocumentWithChildren,
} from '../document/document.domain';
import { getServiceInstance } from '../service-instance.domain';
import { CustomDashboardsApp } from './custom-dashboards.app';
import {
  CUSTOM_DASHBOARD_DOCUMENT_TYPE,
  CUSTOM_DASHBOARD_METADATA,
  CustomDashboard,
} from './custom-dashboards.domain';

const resolvers: Resolvers = {
  CustomDashboard: {
    labels: ({ id }, _, context) => getLabels(context, id, { unsecured: true }),
    children_documents: ({ id }) => loadImagesByDocumentId(id),
    uploader: ({ id }, _, context) =>
      getUploader(context, id, { unsecured: true }),
    uploader_organization: ({ id }, _, context) =>
      getUploaderOrganization(context, id, { unsecured: true }),
    service_instance: ({ service_instance_id }, _, context) =>
      getServiceInstance(context, service_instance_id),
    subscription: ({ service_instance_id }, _, context) =>
      loadSubscriptionByServiceInstanceAndSelectedOrganization(
        context,
        service_instance_id
      ),
  },
  Query: {
    seoCustomDashboardsByServiceSlug: async (_, { serviceSlug }, context) => {
      const dashboards = await loadSeoDocumentsByServiceSlug(
        CUSTOM_DASHBOARD_DOCUMENT_TYPE,
        serviceSlug,
        CUSTOM_DASHBOARD_METADATA
      );
      for (const dashboard of dashboards) {
        dashboard.children_documents = await loadImagesByDocumentId(
          dashboard.id
        );
        dashboard.uploader = await getUploader(context, dashboard.id, {
          unsecured: true,
        });
        dashboard.labels = await getLabels(context, dashboard.id, {
          unsecured: true,
        });
      }
      return dashboards;
    },
    seoCustomDashboardBySlug: async (_, { slug }) => {
      return loadSeoDocumentBySlug(
        CUSTOM_DASHBOARD_DOCUMENT_TYPE,
        slug,
        CUSTOM_DASHBOARD_METADATA
      );
    },
    customDashboards: async (_, input, context) => {
      return loadParentDocumentsByServiceInstance<CustomDashboardConnection>(
        CUSTOM_DASHBOARD_DOCUMENT_TYPE,
        context,
        input,
        CUSTOM_DASHBOARD_METADATA
      );
    },
    customDashboard: async (_, { id }, context) =>
      loadDocumentById(
        context,
        extractId<DocumentId>(id),
        CUSTOM_DASHBOARD_METADATA
      ),
  },
  Mutation: {
    createCustomDashboard: async (_, { input, document }, context) => {
      const trx = await dbTx();
      try {
        return await CustomDashboardsApp.createCustomDashboard(
          context,
          input,
          document
        );
      } catch (error) {
        await trx.rollback();
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
    updateCustomDashboard: async (_, input, context) => {
      const trx = await dbTx();
      try {
        const doc = await updateDocumentWithChildren<CustomDashboard>(
          CUSTOM_DASHBOARD_DOCUMENT_TYPE,
          extractId<DocumentId>(input.documentId),
          input,
          CUSTOM_DASHBOARD_METADATA,
          context,
          trx
        );
        await trx.commit();
        return doc;
      } catch (error) {
        await trx.rollback();
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
      const trx = await dbTx();
      try {
        const doc = await deleteDocument<CustomDashboard>(
          context,
          extractId<DocumentId>(id),
          context.serviceInstanceId as ServiceInstanceId,
          true,
          trx
        );
        await trx.commit();
        return doc;
      } catch (error) {
        await trx.rollback();

        throw mapToGraphQLError(error, UnknownErrorCode.DeleteDocumentError);
      }
    },
  },
};

export default resolvers;
