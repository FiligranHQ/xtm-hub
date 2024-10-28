import config from 'config';
import { Resolvers } from '../../__generated__/resolvers-types';

const resolvers: Resolvers = {
  Query: {
    settings: () => {
      return {
        platform_providers: config.get('login_settings'),
      };
    },
  },
};

export default resolvers;
