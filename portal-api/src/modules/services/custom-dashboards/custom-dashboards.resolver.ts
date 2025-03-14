import { Resolvers } from '../../../__generated__/resolvers-types';
import { getLabels, getUploader } from '../document/document.domain';
import {
  loadImagesByCustomDashboardId,
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
  Query: {
    seoCustomDashboardsByServiceSlug: async (_, { serviceSlug }, context) => {
      const dashboards = await loadSeoCustomDashboardsByServiceSlug(
        context,
        serviceSlug
      );
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
  },
};

export default resolvers;
