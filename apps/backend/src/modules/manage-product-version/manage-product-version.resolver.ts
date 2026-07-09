import { ManifestType, Resolvers } from '../../__generated__/resolvers-types';
import { ManifestApp } from '../shareable-resource/manifest/manifest.app';

const resolvers: Resolvers = {
  Mutation: {
    newProductVersion: async (_, { product, version }) => {
      await ManifestApp.requestManifestGeneration({
        product,
        version,
        type: ManifestType.Connector,
      });

      return {
        success: true,
      };
    },
  },
};

export default resolvers;
