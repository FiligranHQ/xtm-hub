import { Readable } from 'stream';
import { requestContext } from '../../../context/request.context';
import { MinIOClient } from '../../../thirdparty/minio/client';
import { logApp } from '../../../utils/app-logger.util';
import { formatDateCompact } from '../../../utils/format';
import { formatConnectorVersion } from '../manifest-fragment/manifest-fragment.utils';
import { ConnectorV2 } from '../opencti/integration/integration.model';
import { ManifestContract, ManifestOutput } from './manifest.types';

export const MANIFEST_CATALOG_ID = 'filigran-catalog-id';
export const MANIFEST_CATALOG_NAME = 'OpenCTI Connectors contracts';
export const MANIFEST_CATALOG_DESCRIPTION = '';
export const MANIFEST_SCHEMA_VERSION = '1';

const buildManifestVersion = (version: string, now: Date): string => {
  return `connector-manifest-${version}-${formatDateCompact(now)}`;
};

const safeParseJson = (
  value: string | null | undefined,
  fieldName: string
): Record<string, unknown> => {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as unknown;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      !Array.isArray(parsed)
    ) {
      return parsed as Record<string, unknown>;
    }
    logApp.error(
      `Manifest field "${fieldName}" is not a JSON object, falling back to {}`
    );
    return {};
  } catch {
    logApp.error(
      `Manifest field "${fieldName}" contains invalid JSON, falling back to {}`
    );
    return {};
  }
};

export const ManifestHelper = {
  partitionConnectorsByVersionCompatibility: (
    connectors: ConnectorV2[],
    version: string
  ): { compatible: ConnectorV2[]; incompatible: ConnectorV2[] } => {
    const compatible: ConnectorV2[] = [];
    const incompatible: ConnectorV2[] = [];
    const paddedVersion = formatConnectorVersion(version);

    for (const connector of connectors) {
      const minVersion = connector.minimum_deployable_version_padded;
      if (minVersion && minVersion > paddedVersion) {
        incompatible.push(connector);
      } else {
        compatible.push(connector);
      }
    }

    return { compatible, incompatible };
  },

  buildManifestFileNameWithPath: (
    product: string,
    version: string,
    now: Date = new Date()
  ): string => {
    return `${product}/${version}/connector/manifest/${buildManifestVersion(version, now)}.json`;
  },

  uploadManifest: async (
    manifest: ManifestOutput,
    fileName: string
  ): Promise<void> => {
    const user = requestContext.requireUser();
    const jsonBuffer = Buffer.from(JSON.stringify(manifest));
    const uploadedFile = {
      createReadStream: () => Readable.from(jsonBuffer),
      filename: fileName,
      mimetype: 'application/json',
      encoding: 'utf-8',
    };
    await MinIOClient.uploadFile(uploadedFile, fileName, user.id, fileName);
  },

  buildConnectorManifestOutput: (
    version: string,
    connectors: ConnectorV2[],
    now: Date = new Date(),
    useCasesByConnectorId: Map<string, string[]>
  ): ManifestOutput => {
    const contracts: ManifestContract[] = connectors.map((connector) => ({
      id: connector.manifest_fragment_id,
      title: connector.name ?? '',
      slug: connector.slug ?? '',
      description: connector.description ?? '',
      short_description: connector.short_description ?? '',
      logo: null, // todo #5
      use_cases: useCasesByConnectorId.get(connector.id as string) ?? [],
      verified: connector.verified,
      last_verified_date: connector.last_verified_date,
      subscription_link: connector.subscription_link ?? null,
      source_code: connector.source_code ?? null,
      manager_supported: connector.manager_supported,
      support_version: connector.minimum_deployable_version ?? null,
      version: connector.version ?? null,
      image_name: connector.image_name ?? null,
      image_type: connector.image_type,
      additional_properties: safeParseJson(
        connector.additional_properties,
        'additional_properties'
      ),
      config_schema: safeParseJson(connector.config_schema, 'config_schema'),
    }));

    return {
      id: MANIFEST_CATALOG_ID,
      name: MANIFEST_CATALOG_NAME,
      description: MANIFEST_CATALOG_DESCRIPTION,
      manifest_schema_version: MANIFEST_SCHEMA_VERSION,
      manifest_version: buildManifestVersion(version, now),
      product_version: version,
      contracts,
    };
  },
};
