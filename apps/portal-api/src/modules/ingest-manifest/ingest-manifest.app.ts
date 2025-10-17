import { upsertConnectors } from './ingest-manifest.domain';
import {
  extractManifestInformation,
  fetchManifest,
} from './ingest-manifest.helper';

const OpenCTIConnectorsManifest =
  'https://raw.githubusercontent.com/OpenCTI-Platform/connectors/master/manifest.json';

export const IngestManifestApp = {
  async refreshOpenCTIManifest(): Promise<boolean> {
    const manifest = await fetchManifest(OpenCTIConnectorsManifest);
    await upsertConnectors(extractManifestInformation(manifest));
    return true;
  },
};
