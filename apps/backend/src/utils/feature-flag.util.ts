import config from 'config';
import { FeatureFlag } from '../__generated__/resolvers-types';
import { logApp } from './app-logger.util';
import { ForbiddenAccess } from './error/error.util';

export const resolveFeatureFlags = (
  enabledFeatures: string[]
): FeatureFlag[] => {
  const allFlags = Object.values(FeatureFlag);

  if (enabledFeatures.includes('*')) {
    return allFlags;
  }

  return enabledFeatures.filter((feature): feature is FeatureFlag => {
    const isValid = (allFlags as string[]).includes(feature);
    if (!isValid) {
      logApp.warn(
        `[FEATURE-FLAG] Unknown feature flag in config: "${feature}"`
      );
    }
    return isValid;
  });
};

export const isFeatureEnabled = (requiredFlag: FeatureFlag) => {
  const isEnabled = (config.get<string[]>('enabled_features') ?? []).some(
    (flag) => ['*', requiredFlag].includes(flag)
  );

  if (!isEnabled) {
    throw ForbiddenAccess(`Feature '${requiredFlag}' is not enabled.`);
  }

  return true;
};
