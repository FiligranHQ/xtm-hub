import { Resolvers } from '../../__generated__/resolvers-types';
import { isFeatureEnabled } from '../../utils/feature-flag.util';
import { IngestManifestApp } from './ingest-manifest.app';

const resolvers: Resolvers = {
  Query: {
    updateOpenCTIManifest: async (_, { tag }) => {
      if (!isFeatureEnabled('CONNECTORS_INTEGRATION_FEEDS')) {
        return {
          success: false,
        };
      }

      // Error handling is now done in the app layer
      await IngestManifestApp.updateOpenCTIManifest(tag);

      return {
        success: true,
      };
    },
  },
};

export default resolvers;
