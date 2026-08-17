import { Resolvers } from '../../../../__generated__/resolvers-types';
import { mapToGraphQLError } from '../../../../utils/error/error.mapping';
import { SeoServiceInstanceApp } from './seo-service-instance.app';

const resolvers: Resolvers = {
  Query: {
    seoServiceInstanceMetadata: (_, args) =>
      SeoServiceInstanceApp.loadSeoServiceInstancesBy(args),
  },
  Mutation: {
    editSeoServiceInstance: async (_, args) => {
      try {
        return await SeoServiceInstanceApp.editSeoServiceInstanceBy(args);
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
  },
};

export default resolvers;
