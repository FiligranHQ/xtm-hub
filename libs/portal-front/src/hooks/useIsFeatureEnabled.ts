import { SettingsContext } from '@/components/settings/env-portal-context';
import { FeatureFlag } from '@/utils/constant';
import { useContext } from 'react';

export const useIsFeatureEnabled = (requiredFlag: FeatureFlag) => {
  const { settings } = useContext(SettingsContext);
  return (settings?.platform_feature_flags ?? []).some((flag) =>
    ['*', requiredFlag].includes(flag)
  );
};
