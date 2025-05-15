import config from 'config';

interface FeatureFlag {
  id: string;
  enabled: boolean;
}

export enum FeatureFlagId {
  RESET_PASSWORD = 'reset-password',
  AUTH0_CLIENT = 'auth0-client',
}

export const isFeatureEnabled = (id: string) => {
  const featureFlags = config.get<FeatureFlag[]>('feature_flags');
  return featureFlags.some((flag) => flag.id === id && flag.enabled);
};
