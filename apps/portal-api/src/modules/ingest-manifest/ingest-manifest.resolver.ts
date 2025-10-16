import { Resolvers } from '../../__generated__/resolvers-types';
import { isFeatureEnabled } from '../../utils/feature-flag.util';
import { IngestManifestApp } from './ingest-manifest.app';

const resolvers: Resolvers = {
  Query: {
    refreshOpenCTIManifest: (_, __, context) =>
      isFeatureEnabled('CONNECTORS_INTEGRATION_FEEDS')
        ? IngestManifestApp.refreshOpenCTIManifest(context)
        : false,
  },
};

export default resolvers;
