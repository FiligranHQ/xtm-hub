import {
  extractManifestInformation,
  fetchManifest,
} from './ingest-manifest.helper';

const OpenCTIConnectorsManifest =
  'https://raw.githubusercontent.com/OpenCTI-Platform/connectors/master/manifest.json';

export const IngestManifestApp = {
  async refreshOpenCTIManifest() {
    const manifest = await fetchManifest(OpenCTIConnectorsManifest);
    extractManifestInformation(manifest);
    return true;
  },
};
