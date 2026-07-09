import { SettingsContext } from '@/components/settings/EnvPortalContext';
import { FeatureFlag } from '@graphql/generated';
import { useContext } from 'react';

export const useIsFeatureEnabled = (requiredFlag: FeatureFlag) => {
  const { settings } = useContext(SettingsContext);
  return (settings?.platform_feature_flags ?? []).some((flag) =>
    [requiredFlag as string].includes(flag)
  );
};
