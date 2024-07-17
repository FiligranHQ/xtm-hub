import { Resolvers, Subscription } from '../../__generated__/resolvers-types';
import {
  addOrganizationUsersRights,
  checkSubscriptionExists,
  fillSubscription,
  loadSubscriptions,
  loadSubscriptionsByOrganization,
} from './subscription.domain';
import { v4 as uuidv4 } from 'uuid';
import { fromGlobalId } from 'graphql-relay/node/node.js';
import { db, dbTx } from '../../../knexfile';
import { insertUserService } from '../user_service/user_service.domain';
import { insertCapa } from './service_capability.domain';
import { extractId } from '../../utils/utils';

const resolvers: Resolvers = {
  Query: {
    subscriptions: async (_, { first, after, orderMode, orderBy }, context) => {
      return loadSubscriptions(context, {
        first,
        after,
        orderMode,
        orderBy,
      });
    },
    subscriptionsByOrganization: async (
      _,
      { first, after, orderMode, orderBy },
      context
    ) => {
      return loadSubscriptionsByOrganization(context, {
        first,
        after,
        orderMode,
        orderBy,
      });
    },
  },
  Mutation: {
    addSubscription: async (
      _,
      { service_id, organization_id, user_id, status },
      context
    ) => {
      const trx = await dbTx();
      // Check the subscription does not already exist :

      try {
        const subscription = await checkSubscriptionExists(
          fromGlobalId(organization_id).id,
          fromGlobalId(service_id).id
        );
        if (subscription) {
          throw new Error(`You have already subscribed this service.`);
        }

        const subscriptionData = {
          id: uuidv4(),
          service_id: fromGlobalId(service_id).id,
          organization_id: fromGlobalId(organization_id).id,
          start_date: new Date(),
          end_date: undefined,
          status: status,
        };

        const [addedSubscription] = await db<Subscription>(
          context,
          'Subscription'
        )
          .insert(subscriptionData)
          .returning('*');

        const filledSubscription = await fillSubscription(
          context,
          addedSubscription
        );

        const [addedUserService] = await insertUserService(
          context,
          fromGlobalId(user_id).id,
          filledSubscription.id
        );

        const initialServiceCapabilities = [
          'ADMIN_SUBSCRIPTION',
          'MANAGE_ACCESS',
          'ACCESS_SERVICE',
        ];
        initialServiceCapabilities.map(async (capa) => {
          await insertCapa(context, addedUserService.id, capa);
        });

        if (filledSubscription.service.type === 'SUBSCRIPTABLE_DIRECT') {
          await addOrganizationUsersRights(
            context,
            fromGlobalId(organization_id).id,
            fromGlobalId(user_id).id,
            filledSubscription.id
          );
        }

        return filledSubscription;
      } catch (error) {
        await trx.rollback();
        console.log('Error while subscribing the service.', error);
        throw error;
      }
    },
    editSubscription: async (_, { id, input }, context) => {
      const trx = await dbTx();
      try {
        const organization_id = extractId(input.organization_id);
        const service_id = extractId(input.service_id);
        const update = {
          id,
          organization_id,
          service_id,
          status: input.status,
        };
        const [updatedSubscription] = await db<Subscription>(
          context,
          'Subscription'
        )
          .where({ id })
          .update(update)
          .returning('*');
        return await fillSubscription(context, updatedSubscription);
      } catch (error) {
        await trx.rollback();
        console.error('Error while editing the subscription', error);
        throw error;
      }
    },
  },
};

export default resolvers;
