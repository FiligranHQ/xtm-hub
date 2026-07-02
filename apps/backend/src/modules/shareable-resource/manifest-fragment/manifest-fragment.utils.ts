import { BadRequestErrorCode } from '../../../utils/error/error.code';

const connectorVersionRegex = /^(\d+)\.(\d+)\.(\d+)(?:-lts\.(\d+))?$/i;
const TAG_LATEST = 'latest';
const TAG_LATEST_LTS = 'latest-lts';
export const TAG_DECOUPLING = 'decoupling';

export type ConnectorMetadataSnapshot = {
  datasheet_url?: string;
  blogpost_url?: string;
  demo_url?: string;
};

export const formatConnectorVersion = (version: string): string => {
  const match = version.match(connectorVersionRegex);
  if (!match) {
    throw new Error(BadRequestErrorCode.InvalidConnectorVersionFormat);
  }

  const major = (match[1] ?? '0').padStart(3, '0');
  const datePart = (match[2] ?? '0').padStart(6, '0');
  const patch = (match[3] ?? '0').padStart(3, '0');

  const hasLtsSuffix = /-lts/i.test(version);
  if (!hasLtsSuffix) {
    return `${major}.${datePart}.${patch}`;
  }

  const ltsPatch = (match[4] ?? '0').padStart(3, '0');
  return `${major}.${datePart}.${patch}.LTS.${ltsPatch}`;
};

export const validateConnectorMinimumVersion = (minVersion: string): void => {
  formatConnectorVersion(minVersion);
};

export const getLatestTagForConnectorVersion = (
  formattedVersion: string
): string => {
  return formattedVersion.includes('.LTS.') ? TAG_LATEST_LTS : TAG_LATEST;
};

export const isStrictlyGreaterConnectorVersion = ({
  candidate,
  current,
}: {
  candidate: string;
  current: string;
}): boolean => {
  if (!current) return true;
  return candidate > current;
};

export const getConnectorMetadataFromExisting = ({
  currentLatestConnector,
  existingBatchConnectors,
}: {
  currentLatestConnector?: ConnectorMetadataSnapshot;
  existingBatchConnectors: ConnectorMetadataSnapshot[];
}): ConnectorMetadataSnapshot | undefined => {
  const metadataFromExisting = {
    datasheet_url:
      currentLatestConnector?.datasheet_url ??
      existingBatchConnectors.find((connector) => connector.datasheet_url)
        ?.datasheet_url,
    blogpost_url:
      currentLatestConnector?.blogpost_url ??
      existingBatchConnectors.find((connector) => connector.blogpost_url)
        ?.blogpost_url,
    demo_url:
      currentLatestConnector?.demo_url ??
      existingBatchConnectors.find((connector) => connector.demo_url)?.demo_url,
  };

  if (
    !metadataFromExisting.datasheet_url &&
    !metadataFromExisting.blogpost_url &&
    !metadataFromExisting.demo_url
  ) {
    return undefined;
  }

  return metadataFromExisting;
};

export const getConnectorDocumentTags = (
  shouldPromoteAsLatest: boolean,
  latestTag: string
): string[] => {
  return shouldPromoteAsLatest ? [TAG_DECOUPLING, latestTag] : [TAG_DECOUPLING];
};

export const buildConnectorLogoFilename = ({
  title,
  version,
}: {
  title: string;
  version: string;
}): string => {
  return `${title}-${version}-logo.png`;
};
