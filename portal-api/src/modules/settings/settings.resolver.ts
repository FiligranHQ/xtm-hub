import config from 'config';
import { Resolvers } from '../../__generated__/resolvers-types';
import { getFeatureFlagConfig } from '../../utils/feature-flag';

const resolvers: Resolvers = {
  Query: {
    settings: () => {
      return {
        platform_providers: config.get('login_settings'),
        base_url_front: config.get('base_url_front'),
        environment: config.get('environment'),
        feature_flags: getFeatureFlagConfig(),
      };
    },
  },
};

export default resolvers;
