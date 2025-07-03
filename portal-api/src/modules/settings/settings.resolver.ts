import config from 'config';
import { Resolvers } from '../../__generated__/resolvers-types';
import portalConfig from '../../config';

const resolvers: Resolvers = {
  Query: {
    settings: () => {
      return {
        platform_providers: config.get('login_settings'),
        base_url_front: config.get('base_url_front'),
        environment: config.get('environment'),
        platform_feature_flags: portalConfig.enabled_features,
      };
    },
  },
};

export default resolvers;
