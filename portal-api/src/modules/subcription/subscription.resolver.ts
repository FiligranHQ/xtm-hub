import { Resolvers, Subscription } from '../../__generated__/resolvers-types';
import {
  checkSubscriptionExists,
  loadSubscriptions,
  loadSubscriptionsByOrganization,
} from './subscription.domain';
import { v4 as uuidv4 } from 'uuid';
import { fromGlobalId } from 'graphql-relay/node/node.js';
import { db } from '../../../knexfile';

const resolvers: Resolvers = {
  Query: {
    subscriptions: async (_, { first, after, orderMode, orderBy }, context) => {
      return loadSubscriptions(context, { first, after, orderMode, orderBy });
    },
    subscriptionsByOrganization: async (
      _,
      { first, after, orderMode, orderBy, organization_id },
      context
    ) => {
      console.log('organization_id', organization_id);
      console.log(
        'fromGlobalId organization_id',
        fromGlobalId(organization_id)
      );
      console.log(
        'fromGlobalId fromGlobalId organization_id',
        fromGlobalId(fromGlobalId(organization_id).id).id
      );
      return loadSubscriptionsByOrganization(
        context,
        { first, after, orderMode, orderBy },
        fromGlobalId(fromGlobalId(organization_id).id).id
      );
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
      // Check the subscription does not already exist :
      const subscription = await checkSubscriptionExists(
        fromGlobalId(fromGlobalId(organization_id).id.toString()).id,
        fromGlobalId(service_id).id.toString()
      );
      if (subscription) {
        throw new Error(`You have already subscribed this service.`);
      }
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
