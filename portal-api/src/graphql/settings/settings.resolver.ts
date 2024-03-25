import { Resolvers } from '../../__generated__/resolvers-types';

const resolvers: Resolvers = {
  Query: {
    settings: () => {
      return {
        platform_providers: [
          {
            name: 'local',
            type: 'FORM',
            provider: 'local',
          },
          {
            name: 'Corporate login',
            type: 'SSO',
            provider: 'saml',
          },
        ],
      };
    },
  },
};

export default resolvers;
