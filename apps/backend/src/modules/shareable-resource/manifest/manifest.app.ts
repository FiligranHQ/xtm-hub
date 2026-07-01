import {
  DocumentMetadataKeyCode,
  IntegrationType,
  ManifestType,
} from '../../../__generated__/resolvers-types';
import { logApp } from '../../../utils/app-logger.util';
import { isLtsVersion } from '../../../utils/versioning';
import { DocumentDomain } from '../../document/domain/document.domain';
import {
  TAG_DECOUPLING,
  TAG_LATEST,
  TAG_LATEST_LTS,
} from '../manifest-fragment/manifest-fragment.utils';
import { INTEGRATION_CONNECTOR_V2_METADATA_KEYS } from '../opencti/integration/integration.model';
import { ManifestKey } from './manifest.consts';
import { ManifestDomain } from './manifest.domain';

export const ManifestApp = {
  processManifestQueue: async (manifest?: ManifestKey) => {
    logApp.info('Processing manifest queue');
    const rows =
      await ManifestDomain.loadPendingManifestsForProcessing(manifest);
    logApp.info(`Locked ${rows.length} manifest(s) for processing`);

    for (const row of rows) {
      try {
        await ManifestApp.generateManifest({
          platformIdentifier: row.product,
          version: row.version,
          type: row.type,
        });
      } catch (error) {
        logApp.error('Unable to process manifest', { error, manifest: row });
      }
    }
  },

  generateManifest: async ({ version, type }: ManifestKey) => {
    if (type != ManifestType.Connector) {
      logApp.error('UnsupportedManifestType', { type });
      return;
    }
    const tag = isLtsVersion(version) ? TAG_LATEST_LTS : TAG_LATEST;
    const connectors = await DocumentDomain.loadDocumentsByMetadata(
      DocumentMetadataKeyCode.IntegrationType,
      IntegrationType.Connector,
      INTEGRATION_CONNECTOR_V2_METADATA_KEYS as DocumentMetadataKeyCode[],
      { active: true, is_decommissioned: false, tags: [tag, TAG_DECOUPLING] }
    );
    logApp.info(
      `Found ${connectors.length} connector(s) v2 with tag "${tag}" for version ${version}`
    );
  },
};
