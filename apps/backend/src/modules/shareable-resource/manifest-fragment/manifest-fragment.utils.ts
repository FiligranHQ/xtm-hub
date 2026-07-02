import { BadRequestErrorCode } from '../../../utils/error/error.code';

const connectorVersionRegex = /^(\d+)\.(\d+)\.(\d+)(?:-lts\.(\d+))?$/i;
const TAG_LATEST = 'latest';
const TAG_LATEST_LTS = 'latest-lts';

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
  return candidate > current;
};
