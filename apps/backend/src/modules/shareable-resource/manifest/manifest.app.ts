import { logApp } from '../../../utils/app-logger.util';
import { ManifestKey } from './manifest.consts';
import { ManifestDomain } from './manifest.domain';

export const ManifestApp = {
  processManifestQueue: async (manifest?: ManifestKey) => {
    logApp.info('Processing manifest queue');
    const rows =
      await ManifestDomain.loadPendingManifestsForProcessing(manifest);
    logApp.info(`Locked ${rows.length} manifest(s) for processing`);
  },
};
