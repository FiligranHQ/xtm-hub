import { SYSTEM_USER_CONTEXT } from '../../portal.const';
import { upsertConnectors } from './ingest-manifest.domain';
import {
  extractManifestInformation,
  fetchManifest,
} from './ingest-manifest.helper';

const OpenCTIConnectorsManifest =
  'https://raw.githubusercontent.com/OpenCTI-Platform/connectors/master/manifest.json';

export const IngestManifestApp = {
  async refreshOpenCTIManifest() {
    const manifest = await fetchManifest(OpenCTIConnectorsManifest);

    // TODO need to create system_user_context from directive on checking token
    upsertConnectors(SYSTEM_USER_CONTEXT, extractManifestInformation(manifest));
    return true;
  },
};
