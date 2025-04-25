import { dbTx } from '../../../../knexfile';
import { Resolvers } from '../../../__generated__/resolvers-types';
import { UnknownError } from '../../../utils/error.util';
import { getLabels, getUploader } from '../document/document.domain';
import { createFileInMinIO } from '../document/document.helper';
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
      const dashboard = await loadSeoCustomDashboardBySlug(slug);
      return dashboard;
    },
  },
  Mutation: {
    createCustomDashboard: async (_, { input, document }, context) => {
      const trx = await dbTx();
      try {
        const files = await Promise.all(
          document.map((document) => createFileInMinIO(document, context))
        );
        const customDashboard = await createCustomDashboard(
          input,
          files,
          context,
          trx
        );
        await trx.commit();

        return customDashboard;
      } catch (error) {
        await trx.rollback();
        throw UnknownError('CUSTOM_DASHBOARD_CREATION_ERROR', {
          detail: error,
        });
      }
    },
  },
};

export default resolvers;
