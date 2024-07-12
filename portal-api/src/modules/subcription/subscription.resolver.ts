import { Resolvers, Subscription } from '../../__generated__/resolvers-types';
import {
  addOrganizationUsersRights,
  checkSubscriptionExists,
  loadSubscriptions,
  loadSubscriptionsByOrganization,
} from './subscription.domain';
import { v4 as uuidv4 } from 'uuid';
import { fromGlobalId } from 'graphql-relay/node/node.js';
import { db, dbTx } from '../../../knexfile';
import { insertUserService } from '../user_service/user_service.domain';
import { insertCapa } from './service_capability.domain';
import { loadOrganizationBy } from '../organizations/organizations';
import { loadServiceBy } from '../services/services.domain';

const resolvers: Resolvers = {
  Query: {
    subscriptions: async (_, { first, after, orderMode, orderBy }, context) => {
      return loadSubscriptions(context, { first, after, orderMode, orderBy });
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
      { service_id, organization_id, user_id },
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
        };

        const [addedSubscription] = await db<Subscription>(
          context,
          'Subscription'
        )
          .insert(subscriptionData)
          .returning('*');
        addedSubscription.organization = await loadOrganizationBy(
          'id',
          addedSubscription.organization_id
        );
        addedSubscription.service = await loadServiceBy(
          context,
          'id',
          addedSubscription.service_id
        );

        const [addedUserService] = await insertUserService(
          context,
          fromGlobalId(user_id).id,
          addedSubscription.id
        );

        const initialServiceCapabilities = [
          'ADMIN_SUBSCRIPTION',
          'MANAGE_ACCESS',
          'ACCESS_SERVICE',
        ];
        initialServiceCapabilities.map(async (capa) => {
          await insertCapa(context, addedUserService.id, capa);
        });

        await addOrganizationUsersRights(
          context,
          fromGlobalId(organization_id).id,
          fromGlobalId(user_id).id,
          addedSubscription.id
        );

        return addedSubscription;
      } catch (error) {
        await trx.rollback();
        console.log('Error while subscribing the service.', error);
        throw error;
      }
    },
  },
};

export default resolvers;
