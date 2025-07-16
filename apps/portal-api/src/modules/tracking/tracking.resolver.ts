import { Resolvers } from '../../__generated__/resolvers-types';
import { listen } from '../../pub';

const resolvers: Resolvers = {
  Subscription: {
    ActionTracking: {
      subscribe: (_, __, context) => ({
        [Symbol.asyncIterator]: () => listen(context, ['ActionTracking']),
      }),
    },
  },
};

export default resolvers;
