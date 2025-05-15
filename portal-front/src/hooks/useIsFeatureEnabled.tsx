import { SettingsContext } from '@/components/settings/env-portal-context';
import { useContext } from 'react';

export const useIsFeatureEnabled = (id: string): boolean => {
  const { settings } = useContext(SettingsContext);
  if (!Array.isArray(settings?.feature_flags)) {
    return false;
  }

  return settings.feature_flags.some((flag) => flag?.id === id && flag.enabled);
};
