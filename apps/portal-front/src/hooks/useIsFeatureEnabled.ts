import { SettingsContext } from '@/components/settings/env-portal-context';
import { FeatureFlagEnum } from '@generated/models/FeatureFlag.enum';
import { useContext } from 'react';

export const useIsFeatureEnabled = (requiredFlag: FeatureFlagEnum) => {
  const { settings } = useContext(SettingsContext);
  return (settings?.platform_feature_flags ?? []).some((flag) =>
    [requiredFlag as string].includes(flag)
  );
};
