import { Resolvers } from '../../__generated__/resolvers-types';
import { IngestManifestApp } from './ingest-manifest.app';

const resolvers: Resolvers = {
  Query: {
    refreshOpenCTIManifest: () => IngestManifestApp.refreshOpenCTIManifest(),
  },
};

export default resolvers;
