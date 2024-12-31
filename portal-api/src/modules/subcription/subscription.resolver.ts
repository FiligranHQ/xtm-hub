import { fromGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { db, dbTx } from '../../../knexfile';
import { Resolvers, Subscription } from '../../__generated__/resolvers-types';
import { OrganizationId } from '../../model/kanel/public/Organization';
import {
  SubscriptionId,
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';
import { logApp } from '../../utils/app-logger.util';
import {
  FORBIDDEN_ACCESS,
  ForbiddenAccess,
  UnknownError,
} from '../../utils/error.util';
import { extractId } from '../../utils/utils';
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
          throw ForbiddenAccess('You have already subscribed this service.');
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
        if (error.name.includes(FORBIDDEN_ACCESS)) {
          logApp.warn(
            'Forbidden access while adding subscription: you have already subscribed this service.'
          );
          throw ForbiddenAccess('You have already subscribed this service');
        }
        logApp.error('Error while subscribing the service.', error);
        throw UnknownError('Error while subscribing the service.');
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
          throw ForbiddenAccess(
            'You have already subscribed this organization to this service.'
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
        if (error.name.includes(FORBIDDEN_ACCESS)) {
          logApp.warn(
            "Forbidden access while adding subscription: You've already subscribed this organization to this service."
          );
          throw ForbiddenAccess(
            "You've already subscribed this organization to this service."
          );
        }
        logApp.error('Error while subscribing the service.', error);
        throw UnknownError('Error while subscribing the service.');
      }
    },
    deleteSubscription: async (_, { subscription_id }, context) => {
      try {
        const [subscription] = await loadSubscriptionBy({
          id: extractId(subscription_id),
        } as SubscriptionMutator);

        if (subscription.billing !== 0) {
          throw ForbiddenAccess(
            'You can not delete a subscription with billing.'
          );
        }
        await db<Subscription>(context, 'Subscription')
          .where({ id: fromGlobalId(subscription_id).id })
          .delete('*');

        return loadServiceWithSubscriptions(context, subscription.service_id);
      } catch (error) {
        if (error.name.includes(FORBIDDEN_ACCESS)) {
          logApp.warn(
            'Forbidden access while deleting subscription: you can not delete a subscription with billing.'
          );
          throw ForbiddenAccess(
            'You can not delete a subscription with billing.'
          );
        }
        logApp.error('Error while deleting the subscription.', error);
        throw UnknownError('Error while deleting the subscription.');
      }
    },
  },
};

export default resolvers;
