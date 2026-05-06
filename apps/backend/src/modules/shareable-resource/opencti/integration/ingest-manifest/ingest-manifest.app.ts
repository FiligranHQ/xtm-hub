import { PortalCapability } from '../../../../../__generated__/resolvers-types';
import { requestContext } from '../../../../../context/request.context';
import { securityGuard } from '../../../../../security/guard';
import { BadRequestError } from '../../../../../utils/error/error.util';
import { upsertConnectors } from './ingest-manifest.domain';
import {
  extractManifestInformation,
  fetchManifest,
  ManifestExtractionResult,
} from './ingest-manifest.helper';

const getOpenCTIConnectorsManifest = (tag: string) =>
  `https://raw.githubusercontent.com/OpenCTI-Platform/connectors/tags/${tag}/manifest.json`;

export const IngestManifestApp = {
  async updateOpenCTIManifest(tag: string): Promise<ManifestExtractionResult> {
    const { user } = requestContext.require();

    await securityGuard.assertUserPortalCapabilities(user, [
      PortalCapability.ManageConnectorsIngestions,
    ]);

    const manifest = await fetchManifest(getOpenCTIConnectorsManifest(tag));
    const result = extractManifestInformation(manifest);

    if (result.validContracts.length > 0) {
      void upsertConnectors(result.validContracts);
    }

    // If there are errors, throw a GraphQL error with details
    if (result.errors.length > 0) {
      const errorDetails = result.errors
        .map(
          (err) => `${err.contractTitle} (${err.contractSlug}): ${err.error}`
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
