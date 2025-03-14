import { Resolvers } from '../../../__generated__/resolvers-types';
import { getLabels, getUploader } from '../document/document.domain';
import {
  loadImagesByCustomDashboardId,
  loadSeoCustomDashboardsByServiceSlug,
} from './custom-dashboards.domain';

const resolvers: Resolvers = {
  SeoCustomDashboard: {
    images: ({ id }, _, context) => loadImagesByCustomDashboardId(context, id),
    uploader: ({ id }, _, context) => getUploader(context, id),
    labels: ({ id }, _, context) => getLabels(context, id),
  },
  Query: {
    seoCustomDashboardsByServiceSlug: async (_, { serviceSlug }, context) => {
      const dashboards = await loadSeoCustomDashboardsByServiceSlug(
        context,
        serviceSlug
      );
      for (const dashboard of dashboards) {
        dashboard.images = await loadImagesByCustomDashboardId(
          context,
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
