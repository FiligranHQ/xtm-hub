import { Resolvers } from '../../../../../__generated__/resolvers-types';
import { IngestManifestApp } from './ingest-manifest.app';

const resolvers: Resolvers = {
  Query: {
    updateOpenCTIManifest: async (_, { tag }) => {
      const result = await IngestManifestApp.updateOpenCTIManifest(tag);

      return {
        success: true,
        warnings: result.warnings,
        invalidUseCasesByConnector: result.invalidUseCasesByConnector,
      };
    },
  },
};

export default resolvers;
