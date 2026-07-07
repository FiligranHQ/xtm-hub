import { PortalCapability } from '../../../../../__generated__/resolvers-types';
import { requestContext } from '../../../../../context/request.context';
import { securityGuard } from '../../../../../security/guard';
import { IngestManifestDomain } from './ingest-manifest.domain';
import {
  IngestManifestHelper,
  InvalidConnectorUseCases,
  ManifestExtractionResult,
} from './ingest-manifest.helper';

const getOpenCTIConnectorsManifest = (tag: string) =>
  `https://raw.githubusercontent.com/OpenCTI-Platform/connectors/tags/${tag}/manifest.json`;

export const IngestManifestApp = {
  async updateOpenCTIManifest(tag: string): Promise<
    ManifestExtractionResult & {
      warnings: string[];
      invalidUseCasesByConnector: InvalidConnectorUseCases[];
    }
  > {
    const user = requestContext.requireUser();

    await securityGuard.assertUserPortalCapabilities(user, [
      PortalCapability.ManageConnectorsIngestions,
    ]);

    const manifest = await IngestManifestHelper.fetchManifest(
      getOpenCTIConnectorsManifest(tag)
    );
    const result = IngestManifestHelper.extractManifestInformation(manifest);
    const {
      sanitizedContracts,
      warnings,
      invalidUseCases,
      invalidUseCasesByConnector,
    } = await IngestManifestHelper.filterUnknownUseCases(result.validContracts);

    if (sanitizedContracts.length > 0) {
      void IngestManifestDomain.upsertConnectors(sanitizedContracts);
    }

    const validationWarnings = result.errors.map(
      (err) =>
        `${err.contractTitle ?? 'Unknown'} (${err.contractSlug ?? 'Unknown'}): ${err.error}`
    );

    const unknownUseCaseWarnings = warnings.map(
      (warning) =>
        `${warning.contractTitle ?? 'Unknown'} (${warning.contractSlug ?? 'Unknown'}): ${warning.warning}`
    );

    const aggregatedInvalidUseCasesWarning =
      invalidUseCases.length > 0
        ? [`Incorrect use case(s): ${invalidUseCases.join(', ')}`]
        : [];

    return {
      ...result,
      validContracts: sanitizedContracts,
      invalidUseCasesByConnector,
      warnings: [
        ...validationWarnings,
        ...unknownUseCaseWarnings,
        ...aggregatedInvalidUseCasesWarning,
      ],
    };
  },
};
