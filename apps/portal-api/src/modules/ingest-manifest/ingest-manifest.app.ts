import { fetchManifest } from './ingest-manifest.helper';

const OpenCTIConnectorsManifest =
  'https://raw.githubusercontent.com/OpenCTI-Platform/connectors/master/manifest.json';

export const IngestManifestApp = {
  async refreshOpenCTIManifest() {
    await fetchManifest(OpenCTIConnectorsManifest);
    return true;
  },
};
