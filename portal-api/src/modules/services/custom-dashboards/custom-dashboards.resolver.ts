import { dbTx } from '../../../../knexfile';
import {
  CustomDashboardConnection,
  Resolvers,
} from '../../../__generated__/resolvers-types';
import { DocumentId } from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { AlreadyExistsError, UnknownError } from '../../../utils/error.util';
import { extractId } from '../../../utils/utils';
import { loadSubscription } from '../../subcription/subscription.domain';
import {
  createDocumentWithChildren,
  deleteDocument,
  getLabels,
  getUploader,
  getUploaderOrganization,
  loadDocumentById,
  loadParentDocumentsByServiceInstance,
  updateDocumentWithChildren,
} from '../document/document.domain';
import {
  createFileInMinIO,
  MinioFile,
  Upload,
  waitForUploads,
} from '../document/document.helper';
import { getServiceInstance } from '../service-instance.domain';
import {
  CUSTOM_DASHBOARD_METADATA,
  CustomDashboard,
  loadImagesByCustomDashboardId,
  loadSeoCustomDashboardBySlug,
  loadSeoCustomDashboardsByServiceSlug,
} from './custom-dashboards.domain';

const resolvers: Resolvers = {
  SeoCustomDashboard: {
    children_documents: ({ id }) => loadImagesByCustomDashboardId(id),
    uploader: ({ id }, _, context) =>
      getUploader(context, id, {
        unsecured: true,
      }),
    labels: ({ id }, _, context) =>
      getLabels(context, id, {
        unsecured: true,
      }),
  },
  CustomDashboard: {
    labels: ({ id }, _, context) => getLabels(context, id, { unsecured: true }),
    children_documents: ({ id }) => loadImagesByCustomDashboardId(id),
    uploader: ({ id }, _, context) =>
      getUploader(context, id, { unsecured: true }),
    uploader_organization: ({ id }, _, context) =>
      getUploaderOrganization(context, id, { unsecured: true }),
    service_instance: ({ service_instance_id }, _, context) =>
      getServiceInstance(context, service_instance_id),
    subscription: ({ service_instance_id }, _, context) =>
      loadSubscription(context, service_instance_id),
  },
  Query: {
    seoCustomDashboardsByServiceSlug: async (_, { serviceSlug }, context) => {
      const dashboards =
        await loadSeoCustomDashboardsByServiceSlug(serviceSlug);
      for (const dashboard of dashboards) {
        dashboard.children_documents = await loadImagesByCustomDashboardId(
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
      return loadSeoCustomDashboardBySlug(slug);
    },
    customDashboards: async (_, input, context) => {
      return loadParentDocumentsByServiceInstance<CustomDashboardConnection>(
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
      try {
        await waitForUploads(document);
        const files = await Promise.all(
          document.map((doc: Upload) => createFileInMinIO(doc, context))
        );
        return await createDocumentWithChildren<CustomDashboard>(
          'custom_dashboard',
          input,
          files,
          CUSTOM_DASHBOARD_METADATA,
          context
        );
      } catch (error) {
        if (error.message?.includes('document_type_slug_unique')) {
          throw AlreadyExistsError('CUSTOM_DASHBOARD_UNIQUE_SLUG_ERROR', {
            detail: error,
          });
        }
        throw UnknownError('CUSTOM_DASHBOARD_INSERTION_ERROR', {
          detail: error,
        });
      }
    },
    updateCustomDashboard: async (
      _,
      { input, documentId, document, updateDocument, images },
      context
    ) => {
      try {
        let documentFile: MinioFile | undefined;
        let newImages: MinioFile[] = [];
        if (document && document.length > 0) {
          await waitForUploads(document);
          const files = await Promise.all(
            document.map((doc: Upload) => createFileInMinIO(doc, context))
          );
          if (updateDocument) {
            documentFile = files.shift();
          }
          newImages = files;
        }

        return await updateDocumentWithChildren<CustomDashboard>(
          'custom_dashboard',
          extractId<DocumentId>(documentId),
          input,
          {
            documentFile,
            newImages,
            existingImages: images.map((imageId) =>
              extractId<DocumentId>(imageId)
            ),
          },
          CUSTOM_DASHBOARD_METADATA,
          context
        );
      } catch (error) {
        if (error.message?.includes('document_type_slug_unique')) {
          throw AlreadyExistsError('CUSTOM_DASHBOARD_UNIQUE_SLUG_ERROR', {
            detail: error,
          });
        }
        throw UnknownError('CUSTOM_DASHBOARD_UPDATE_ERROR', {
          detail: error,
        });
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

        throw UnknownError('DELETE_DOCUMENT_ERROR', { detail: error });
      }
    },
  },
};

export default resolvers;
