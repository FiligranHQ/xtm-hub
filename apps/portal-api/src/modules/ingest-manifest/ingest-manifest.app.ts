import { BadRequestError } from '../../utils/error/error.util';
import { upsertConnectors } from './ingest-manifest.domain';
import {
  extractManifestInformation,
  fetchManifest,
  ManifestExtractionResult,
} from './ingest-manifest.helper';

const OpenCTIConnectorsManifest =
  'https://raw.githubusercontent.com/OpenCTI-Platform/connectors/master/manifest.json';

export const IngestManifestApp = {
  async refreshOpenCTIManifest(): Promise<ManifestExtractionResult> {
    const manifest = await fetchManifest(OpenCTIConnectorsManifest);
    const result = extractManifestInformation(manifest);

    if (result.validContracts.length > 0) {
      await upsertConnectors(result.validContracts);
    }

    // If there are errors, throw a GraphQL error with details
    if (result.errors.length > 0) {
      const errorDetails = result.errors
        .map(
          (err) =>
            `${err.contractTitle} (${err.contractSlug}): ${err.error}`
        )
        .join('; ');

      throw BadRequestError(
        `Manifest ingestion completed with ${result.errors.length} validation error(s): ${errorDetails}`,
        {
          detail: `Successfully processed ${result.validContracts.length} valid contracts, but ${result.errors.length} contracts had validation errors: ${result.errors}`,
        }
      );
    }

    return result;
  },
};
