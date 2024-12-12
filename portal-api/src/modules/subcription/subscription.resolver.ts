import { fromGlobalId } from 'graphql-relay/node/node.js';
import { GraphQLError } from 'graphql/error/index.js';
import { v4 as uuidv4 } from 'uuid';
import { db, dbTx } from '../../../knexfile';
import { Resolvers, Subscription } from '../../__generated__/resolvers-types';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';
import { logApp } from '../../utils/app-logger.util';
import {
  grantServiceAccessUsers,
  loadServiceWithSubscriptions,
} from '../services/services.domain';
import { addAdminAccess } from '../user_service/user_service.domain';
import {
  checkSubscriptionExists,
  fillSubscription,
} from './subscription.domain';
import { loadSubscriptionBy } from './subscription.helper';

const resolvers: Resolvers = {
  Mutation: {
    addSubscription: async (_, { service_id }, context) => {
      const trx = await dbTx();

      // Check the subscription does not already exist :
      try {
        const subscription = await checkSubscriptionExists(
          context,
          context.user.selected_organization_id,
          fromGlobalId(service_id).id
        );

        if (subscription) {
          throw new GraphQLError('You have already subscribed this service.', {
            extensions: { code: '[Subscription] addSubscription' },
          });
        }

        const subscriptionData = {
          id: uuidv4(),
          service_id: fromGlobalId(service_id).id,
          organization_id: context.user.selected_organization_id,
          start_date: new Date(),
          end_date: undefined,
          billing: 100,
          status: 'ACCEPTED',
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

        await addAdminAccess(
          context,
          context.user.id as UserId,
          filledSubscription.id as SubscriptionId
        );

        // TODO If Service is AUTO_JOIN
        // await grantServiceAccessUsers(
        //   context,
        //   context.user.selected_organization_id as OrganizationId,
        //   context.user.id,
        //   filledSubscription.id
        // );

        await trx.commit();
        return {
          ...filledSubscription.service,
          subscribed: true,
          capabilities: ['ACCESS_SERVICE', 'MANAGE_ACCESS'],
        };
      } catch (error) {
        await trx.rollback();
        logApp.error('Error while subscribing the service.', error);
        throw error;
      }
    },
    addSubscriptionInService: async (
      _,
      { service_id, organization_id },
      context
    ) => {
      const trx = await dbTx();

      // Check the subscription does not already exist :
      try {
        const subscription = await checkSubscriptionExists(
          context,
          fromGlobalId(organization_id).id ??
            context.user.selected_organization_id,
          fromGlobalId(service_id).id
        );
        if (subscription) {
          throw new Error(
            `You've already subscribed this organization to this service.`
          );
        }

        const subscriptionData = {
          id: uuidv4(),
          service_id: fromGlobalId(service_id).id,
          organization_id:
            fromGlobalId(organization_id).id ??
            context.user.selected_organization_id,
          start_date: new Date(),
          end_date: undefined,
          billing: 0,
          status: 'ACCEPTED',
        };

        const [addedSubscription] = await db<Subscription>(
          context,
          'Subscription'
        )
          .insert(subscriptionData)
          .returning('*');

        await grantServiceAccessUsers(
          context,
          (fromGlobalId(organization_id).id ??
            context.user.selected_organization_id) as OrganizationId,
          context.user.id,
          addedSubscription.id
        );

        await trx.commit();
        return loadServiceWithSubscriptions(
          context,
          fromGlobalId(service_id).id
        );
      } catch (error) {
        await trx.rollback();
        logApp.error('Error while subscribing the service.', error);
        throw error;
      }
    },
    deleteSubscription: async (_, { subscription_id }, context) => {
      const [subscription] = await loadSubscriptionBy(
        'id',
        fromGlobalId(subscription_id).id
      );

      if (subscription.billing !== 0) {
        throw new Error('You can not delete a subscription with billing.');
      }
      await db<Subscription>(context, 'Subscription')
        .where({ id: fromGlobalId(subscription_id).id })
        .delete('*');

      return loadServiceWithSubscriptions(context, subscription.service_id);
    },
  },
};

export default resolvers;
