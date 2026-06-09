import { PlatformIdentifier } from '../../__generated__/resolvers-types';
import { RequiredPlatformVersions } from '../../utils/required-platform-version';
import { doesVersionSatisfy, isValidVersion } from '../../utils/versioning';

export const doesPlatformSupportNewsFeed = (
  identifier: PlatformIdentifier,
  version?: string | null
): boolean => {
  const requiredVersion = RequiredPlatformVersions.NewsFeedSupport[identifier];
  if (!requiredVersion) return true;
  if (!version || !isValidVersion(version)) return false;
  return doesVersionSatisfy({ givenVersion: version, requiredVersion });
};
