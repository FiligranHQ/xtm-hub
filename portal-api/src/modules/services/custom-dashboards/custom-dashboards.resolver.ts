import {
  CustomDashboardConnection,
  Resolvers,
} from '../../../__generated__/resolvers-types';
import { DocumentId } from '../../../model/kanel/public/Document';
import { UnknownError } from '../../../utils/error.util';
import { extractId } from '../../../utils/utils';
import { loadSubscription } from '../../subcription/subscription.domain';
import {
  getLabels,
  getUploader,
  getUploaderOrganization,
  loadDocumentById,
  loadParentDocumentsByServiceInstance,
} from '../document/document.domain';
import {
  createFileInMinIO,
  Upload,
  waitForUploads,
} from '../document/document.helper';
import { getServiceInstance } from '../service-instance.domain';
import {
  createCustomDashboard,
  CUSTOM_DASHBOARD_METADATA,
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
    labels: ({ id }, _, context) => getLabels(context, id),
    children_documents: ({ id }) => loadImagesByCustomDashboardId(id),
    uploader: ({ id }, _, context) => getUploader(context, id),
    uploader_organization: ({ id }, _, context) =>
      getUploaderOrganization(context, id),
    service_instance: ({ id }, _, context) => getServiceInstance(context, id),
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
        return createCustomDashboard(input, files, context);
      } catch (error) {
        throw UnknownError('CUSTOM_DASHBOARD_INSERTION_ERROR', {
          detail: error,
        });
      }
    },
  },
};

export default resolvers;
