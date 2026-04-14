import config from 'config';
import { FeatureFlag, Resolvers } from '../../__generated__/resolvers-types';
import portalConfig from '../../config';
import {logApp} from '../../utils/app-logger.util';

const resolveFeatureFlags = (): FeatureFlag[] => {
  const enabledFeatures = portalConfig.enabled_features;
  const allFlags = Object.values(FeatureFlag);

  if(enabledFeatures.includes('*')){
    return allFlags;
  }

  return enabledFeatures.filter((feature): feature is FeatureFlag => {
    const isValid = (allFlags as string[]).includes(feature);
    if(!isValid) {
      logApp.warn(
        `[FEATURE-FLAG] Unknown feature flag in config: "${feature}"`
      );
    }
    return isValid;
  });
};

const resolvers: Resolvers = {
  Query: {
    settings: () => {
      return {
        platform_providers: config.get('login_settings'),
        base_url_front: config.get('base_url_front'),
        environment: config.get('environment'),
        platform_feature_flags: resolveFeatureFlags(),
      };
    },
  },
};

export default resolvers;
