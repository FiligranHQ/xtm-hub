import { Resolvers } from '../../__generated__/resolvers-types';
import { loadUsersBySubscription } from './user_service.domain';

const resolvers: Resolvers = {
  Query: {
    serviceUsers: async (_, { id }, context) => {
      return loadUsersBySubscription(context, id);
    },
  },
};

export default resolvers;
