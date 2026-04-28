import { FeatureFlagEnum } from '@generated/models/FeatureFlag.enum';
import { useContext } from 'react';
import { SettingsContext } from '../components/settings/EnvPortalContext';

export const useIsFeatureEnabled = (requiredFlag: FeatureFlagEnum) => {
  const { settings } = useContext(SettingsContext);
  return (settings?.platform_feature_flags ?? []).some((flag) =>
    [requiredFlag as string].includes(flag)
  );
};
