import {
  IntegrationType,
  Resolvers,
  ShareableResource,
} from '../../../../__generated__/resolvers-types';
import { logApp } from '../../../../utils/app-logger.util';

const resolvers: Resolvers = {
  Integration: {
    __resolveType(feed) {
      const mapping = {
        [IntegrationType.Connector]: 'Connector',
        [IntegrationType.CsvFeed]: 'CsvFeed',
        [IntegrationType.TaxiiFeed]: 'TaxiiFeed',
        [IntegrationType.RssFeed]: 'RssFeed',
        [IntegrationType.Stream]: 'Stream',
        [IntegrationType.ThirdPartyIntegration]: 'ThirdPartyIntegration',
      } as const;

      const resolvedType =
        mapping[feed.integration_type as keyof typeof mapping];
      if (!resolvedType) {
        logApp.error(
          `Unknown resolve type for integration ${feed.id} and integration type ${feed.integration_type}`
        );
      }

      return resolvedType;
    },
    solution_category: ({ id }, _, context) =>
      context.dataLoaders.solutionCategoryByDocumentIdLoader.load(id),
    children_documents: async ({ id }, _, context) =>
      (await context.dataLoaders.imagesByDocumentIdLoader.load(
        id
      )) as unknown as ShareableResource[],
  },
};

export default resolvers;
