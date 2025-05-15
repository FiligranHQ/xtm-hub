import config from 'config';
import { logApp } from './app-logger.util';

interface FeatureFlag {
  id: string;
  enabled: boolean;
}

export enum FeatureFlagId {
  RESET_PASSWORD = 'reset-password',
  AUTH0_CLIENT = 'auth0-client',
}

export const getFeatureFlagConfig = (): FeatureFlag[] => {
  let feature_flags: FeatureFlag[] = [];
  try {
    feature_flags = config.get('feature_flags');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    logApp.warn('feature_flags key is missing in config');
  }

  return feature_flags;
};

export const isFeatureEnabled = (id: string) => {
  const featureFlags = getFeatureFlagConfig();
  return featureFlags.some((flag) => flag.id === id && flag.enabled);
};
