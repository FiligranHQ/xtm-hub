import { Resolvers, Subscription } from '../../__generated__/resolvers-types';
import { loadSubscriptions } from './subscription.domain';
import { db } from '../../../knexfile';
import { v4 as uuidv4 } from 'uuid';
import { fromGlobalId } from 'graphql-relay/node/node.js';

const resolvers: Resolvers = {
  Query: {
    subscriptions: async (_, { first, after, orderMode, orderBy }, context) => {
      console.log('ici');
      return loadSubscriptions(context, { first, after, orderMode, orderBy });
    },
  },
  Mutation: {
    addSubscription: async (_, { service_id, organization_id }, context) => {
      const data = {
        id: uuidv4(),
        service_id: fromGlobalId(service_id).id.toString(),
        organization_id: fromGlobalId(
          fromGlobalId(organization_id).id.toString()
        ).id,
        start_date: new Date(),
        end_date: undefined,
      };
      const [addedSubscription] = await db<Subscription>(
        context,
        'Subscription'
      )
        .insert(data)
        .returning('*');
      return addedSubscription;
    },
  },
};

export default resolvers;
