import { Resolvers } from '../../../__generated__/resolvers-types';
import { ManifestApp } from './manifest.app';

const resolvers: Resolvers = {
  Query: {},
  Mutation: {
    generateManifest: async (_, { product, version, type }) => {
      await ManifestApp.requestManifestGeneration({ product, version, type });

      return {
        success: true,
      };
    },
  },
};

export default resolvers;
