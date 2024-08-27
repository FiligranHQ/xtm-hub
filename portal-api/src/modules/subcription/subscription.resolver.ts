import { Resolvers, Subscription } from '../../__generated__/resolvers-types';
import {
  addOrganizationUsersRights,
  checkSubscriptionExists,
  fillSubscription,
  loadSubscriptionBy,
  loadSubscriptions,
  loadSubscriptionsByOrganization,
} from './subscription.domain';
import { v4 as uuidv4 } from 'uuid';
import { fromGlobalId } from 'graphql-relay/node/node.js';
import { db, dbTx } from '../../../knexfile';
import { insertUserService } from '../user_service/user_service.domain';
import { insertCapa } from './service_capability.domain';
import { loadServiceBy } from '../services/services.domain';
import { UserServiceId } from '../../model/kanel/public/UserService';
import { UserId } from '../../model/kanel/public/User';
import { SubscriptionId } from '../../model/kanel/public/Subscription';

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
      return await loadSubscriptionsByOrganization(context, {
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
      { service_id, organization_id, user_id, billing },
      context
    ) => {
      const trx = await dbTx();

      // Check the subscription does not already exist :
      try {
        const subscription = await checkSubscriptionExists(
          context.user.organization_id,
          fromGlobalId(service_id).id
        );
        if (subscription) {
          throw new Error(`You have already subscribed this service.`);
        }

        const service = await loadServiceBy(
          context,
          'id',
          fromGlobalId(service_id).id
        );

        const subscriptionData = {
          id: uuidv4(),
          service_id: fromGlobalId(service_id).id,
          organization_id: context.user.organization_id,
          start_date: new Date(),
          end_date: undefined,
          billing: billing ?? 100,
          status:
            service.subscription_service_type === 'SUBSCRIPTABLE_DIRECT'
              ? 'ACCEPTED'
              : 'REQUESTED',
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

        const [addedUserService] = await insertUserService(context, {
          id: uuidv4() as UserServiceId,
          user_id: context.user.id as UserId,
          subscription_id: filledSubscription.id as SubscriptionId,
          service_personal_data: null,
        });

        const initialServiceCapabilities = [
          'ADMIN_SUBSCRIPTION',
          'MANAGE_ACCESS',
          'ACCESS_SERVICE',
        ];
        initialServiceCapabilities.map(async (capa) => {
          await insertCapa(context, addedUserService.id, capa);
        });

        if (
          filledSubscription.service.subscription_service_type ===
          'SUBSCRIPTABLE_DIRECT'
        ) {
          await addOrganizationUsersRights(
            context,
            context.user.organization_id,
            context.user.id,
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
        // Retrieve subscription
        const [retrievedSubscription] = await loadSubscriptionBy('id', id);
        const update = {
          id,
          organization_id: retrievedSubscription.organization_id,
          service_id: retrievedSubscription.service_id,
          status: input.status ? input.status : retrievedSubscription.status,
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
