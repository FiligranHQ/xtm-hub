import { Resolvers } from '../../../../../__generated__/resolvers-types';
import { IngestManifestApp } from './ingest-manifest.app';

const resolvers: Resolvers = {
  Query: {
    updateOpenCTIManifest: async (_, { tag }) => {
      // Error handling is now done in the app layer
      await IngestManifestApp.updateOpenCTIManifest(tag);

      return {
        success: true,
      };
    },
  },
};

export default resolvers;
