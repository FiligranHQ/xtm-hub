import {
  CustomDashboardConnection,
  Resolvers,
} from '../../../__generated__/resolvers-types';
import { UnknownError } from '../../../utils/error.util';
import {
  getLabels,
  getUploader,
  loadParentDocumentsByServiceInstance,
} from '../document/document.domain';
import {
  createFileInMinIO,
  Upload,
  waitForUploads,
} from '../document/document.helper';
import {
  createCustomDashboard,
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
        ['product_version']
      );
    },
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
