import { Resolvers, Subscription } from '../../__generated__/resolvers-types';
import {
  checkSubscriptionExists,
  fillSubscription,
  fillUserServiceData,
  loadSubscriptions,
  loadSubscriptionsByOrganization,
  loadSubscriptionsByService,
} from './subscription.domain';
import { v4 as uuidv4 } from 'uuid';
import { fromGlobalId } from 'graphql-relay/node/node.js';
import { db, dbTx } from '../../../knexfile';
import { addAdminAccess } from '../user_service/user_service.domain';
import { UserId } from '../../model/kanel/public/User';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import {
  loadSubscriptionBy,
  loadUnsecureSubscriptionBy,
  loadUsersBySubscriptionForAWX,
} from './subscription.helper';
import {
  grantServiceAccessUsers,
  loadServiceBy,
} from '../services/services.domain';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { ServiceId } from '../../model/kanel/public/Service';
import { GraphQLError } from 'graphql/error/index.js';
import { AWXAction } from '../../managers/awx/awx.model';
import { launchAWXWorkflow } from '../../managers/awx/awx-configuration';
import { aw } from 'vitest/dist/chunks/reporters.WnPwkmgA';

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
    subscriptionsByServiceId: async (_, { service_id }, context) => {
      return await loadSubscriptionsByService(
        context,
        fromGlobalId(service_id).id
      );
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
    addSubscription: async (_, { service_id }, context) => {
      const trx = await dbTx();

      // Check the subscription does not already exist :
      try {
        const subscription = await checkSubscriptionExists(
          context.user.organization_id,
          fromGlobalId(service_id).id
        );

        const service = await loadServiceBy(
          context,
          'id',
          fromGlobalId(service_id).id
        );
        if (service.type === 'COMMUNITY') {
          throw new GraphQLError(
            'You cannot subscribe directly to an community.',
            {
              extensions: { code: '[Subscription] addSubscription' },
            }
          );
        }

        if (subscription) {
          throw new GraphQLError('You have already subscribed this service.', {
            extensions: { code: '[Subscription] addSubscription' },
          });
        }

        const subscriptionData = {
          id: uuidv4(),
          service_id: fromGlobalId(service_id).id,
          organization_id: context.user.organization_id,
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
        await grantServiceAccessUsers(
          context,
          context.user.organization_id as OrganizationId,
          context.user.id,
          filledSubscription.id
        );

        await trx.commit();
        return {
          ...filledSubscription.service,
          subscribed: true,
          capabilities: [
            'ACCESS_SERVICE',
            'MANAGE_ACCESS',
            'ADMIN_SUBSCRIPTION',
          ],
        };
      } catch (error) {
        await trx.rollback();
        console.log('Error while subscribing the service.', error);
        throw error;
      }
    },
    addSubscriptionInCommunity: async (
      _,
      { service_id, organization_id },
      context
    ) => {
      const trx = await dbTx();

      // Check the subscription does not already exist :
      try {
        const subscription = await checkSubscriptionExists(
          fromGlobalId(organization_id).id ?? context.user.organization_id,
          fromGlobalId(service_id).id
        );
        if (subscription) {
          throw new Error(`You have already subscribed this service.`);
        }

        const subscriptionData = {
          id: uuidv4(),
          service_id: fromGlobalId(service_id).id,
          organization_id:
            fromGlobalId(organization_id).id ?? context.user.organization_id,
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

        const userServices = await grantServiceAccessUsers(
          context,
          (fromGlobalId(organization_id).id ??
            context.user.organization_id) as OrganizationId,
          context.user.id,
          addedSubscription.id
        );

        const userServiceData = await fillUserServiceData(
          userServices,
          fromGlobalId(service_id).id as ServiceId
        );

        await launchAWXWorkflow({
          type: AWXAction.COMMUNITY_ADD_USERS,
          input: {
            id: fromGlobalId(service_id).id,
            users: userServiceData.map(({ user }) => ({
              email: user.email,
              admin: false,
            })),
          },
        });

        await trx.commit();
        return userServiceData;
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
        const [retrievedSubscription] = await loadUnsecureSubscriptionBy({
          id: id as SubscriptionId,
        });
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
        await trx.commit();
        return await fillSubscription(context, updatedSubscription);
      } catch (error) {
        await trx.rollback();
        console.error('Error while editing the subscription', error);
        throw error;
      }
    },
    deleteSubscription: async (_, { subscription_id }, context) => {
      const [subscription] = await loadSubscriptionBy(
        'id',
        fromGlobalId(subscription_id).id
      );
      //Need to save users in variable before deleting subscription
      const users = await loadUsersBySubscriptionForAWX(subscription.id);

      if (subscription.billing !== 0) {
        throw new Error('You can not delete a subscription with billing.');
      }
      const [deletedSubscription] = await db<Subscription>(
        context,
        'Subscription'
      )
        .where({ id: fromGlobalId(subscription_id).id })
        .delete('*');

      console.log('deleteSubscription users', users);
      await launchAWXWorkflow({
        type: AWXAction.COMMUNITY_REMOVE_USERS,
        input: {
          id: subscription.service_id,
          users,
        },
      });
      return deletedSubscription;
    },
  },
};

export default resolvers;
