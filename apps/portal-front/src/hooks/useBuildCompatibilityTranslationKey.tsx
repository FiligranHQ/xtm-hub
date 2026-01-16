import { isCompatibleWithSemanticVersion } from '@/utils/semantic-versioning';
import { useRegisteredPlatformsFragment$data } from '@generated/useRegisteredPlatformsFragment.graphql';
import { useMemo } from 'react';

interface Props {
  platforms: useRegisteredPlatformsFragment$data[];
  requiredProductVersion?: string | null;
}

export const useBuildCompatibilityTranslationKey = ({
  platforms,
  requiredProductVersion,
}: Props): {
  platformToBeUpdated: string;
  incompatiblePlatformsCount: number;
} => {
  const { platformToBeUpdated, incompatiblePlatformsCount } = useMemo(() => {
    if (!requiredProductVersion) {
      return {
        platformToBeUpdated: '',
        incompatiblePlatformsCount: 0,
      };
    }

    const incompatiblePlatforms = platforms.filter(
      (platform) =>
        !isCompatibleWithSemanticVersion(
          platform.version,
          requiredProductVersion
        )
    );

    const platformToBeUpdated = incompatiblePlatforms
      .map((platform) => platform.title)
      .join(', ');

    return {
      platformToBeUpdated,
      incompatiblePlatformsCount: incompatiblePlatforms.length,
    };
  }, [platforms, requiredProductVersion]);

  return { platformToBeUpdated, incompatiblePlatformsCount };
};
