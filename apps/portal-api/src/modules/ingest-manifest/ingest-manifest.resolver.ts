import { Resolvers } from '../../__generated__/resolvers-types';
import { isFeatureEnabled } from '../../utils/feature-flag.util';
import { IngestManifestApp } from './ingest-manifest.app';

const resolvers: Resolvers = {
  Query: {
    refreshOpenCTIManifest: async () => {
      if (!isFeatureEnabled('CONNECTORS_INTEGRATION_FEEDS')) {
        return false;
      }

      // Error handling is now done in the app layer
      await IngestManifestApp.refreshOpenCTIManifest();

      return true;
    },
  },
};

export default resolvers;
