import { ShareableResourceType } from '@/utils/shareable-resources/shareable-resources.types';
import {
  LicenseType,
  PlatformContract,
  PlatformIdentifier,
} from '@graphql/generated';

export const getPlatformIdentifier = (type: string): PlatformIdentifier => {
  return type === ShareableResourceType.OPENAEV_SCENARIO
    ? PlatformIdentifier.Openaev
    : PlatformIdentifier.Opencti;
};

export const isEeCapableContract = (
  contract: PlatformContract | string | null | undefined
): boolean =>
  contract === PlatformContract.Ee || contract === PlatformContract.Trial;

/**
 * A `Commercial` document (e.g. a connector) only works against an
 * Enterprise Edition platform. Used to gate one-click deploy so a
 * Commercial resource isn't proposed on a CE-only platform.
 */
export const requiresEnterpriseEdition = (
  licenseType: LicenseType | string | null | undefined
): boolean => licenseType === LicenseType.Commercial;
