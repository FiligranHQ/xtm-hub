import config from 'config';
import { Resolvers } from '../../__generated__/resolvers-types';

const resolvers: Resolvers = {
  Query: {
    settings: () => {
      return {
        platform_providers: config.get('login_settings'),
        base_url_front: config.get('base_url_front'),
      };
    },
  },
};

export default resolvers;
