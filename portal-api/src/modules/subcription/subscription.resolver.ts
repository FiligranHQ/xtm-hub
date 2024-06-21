import { Resolvers } from '../../__generated__/resolvers-types';
import { loadSubscriptions } from './subscription.domain';

const resolvers: Resolvers = {
  Query: {
    subscriptions: async (_, { first, after, orderMode, orderBy }, context) => {
      console.log('ici');
      return loadSubscriptions(context, { first, after, orderMode, orderBy });
    },
  },
  Mutation: {
    // addSubscriptions: async (_, { name }, context) => {
    //   const data = { id: uuidv4(), name };
    //   const [addSubscription] = await db<Subscription>(context, 'Subscription')
    //     .insert(data)
    //     .returning('*');
    //   return addSubscription;
    // },
  },
};

export default resolvers;
