import { isCompatibleWithSemanticVersion } from '@/utils/semantic-versioning';
import { useRegisteredPlatformsFragment$data } from '@generated/useRegisteredPlatformsFragment.graphql';
import { useMemo } from 'react';

interface Props {
  platforms: useRegisteredPlatformsFragment$data[];
  requiredProductVersion?: string;
}

export const useBuildCompatibilityTranslationKey = ({
  platforms,
  requiredProductVersion,
}: Props): {
  translationKey: 'Required' | 'Optional' | undefined;
} => {
  const translationKey = useMemo(() => {
    if (!requiredProductVersion) {
      return undefined;
    }

    const compatiblePlatformsCount = platforms.reduce(
      (acc, platform) =>
        isCompatibleWithSemanticVersion(
          platform.version,
          requiredProductVersion
        )
          ? acc + 1
          : acc,
      0
    );

    if (compatiblePlatformsCount === platforms.length) {
      return;
    }

    return platforms.length === 1 || compatiblePlatformsCount === 0
      ? 'Required'
      : 'Optional';
  }, [platforms, requiredProductVersion]);

  return { translationKey };
};
