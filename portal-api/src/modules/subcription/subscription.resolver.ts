import { fromGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { db, dbTx } from '../../../knexfile';
import { Resolvers, Subscription } from '../../__generated__/resolvers-types';

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
import { loadOrganizationBy } from '../organizations/organizations.domain';
import {
  loadServiceInstanceBy,
  loadServiceWithSubscriptions,
} from '../services/service-instance.domain';
import { addCapabilitiesToSubscription } from '../user_service/service-capability/subscription-capability.domain';
import { addAdminAccess } from '../user_service/user_service.domain';
import {
  checkSubscriptionExists,
  fillSubscription,
  getServiceCapability,
  getSubscriptionCapability,
  getUserService,
} from './subscription.domain';
import { loadSubscriptionBy } from './subscription.helper';

const resolvers: Resolvers = {
  SubscriptionModel: {
    subscription_capability: ({ id }, _, context) =>
      getSubscriptionCapability(context, id),
    service_instance: ({ service_instance_id }, _, context) =>
      loadServiceInstanceBy(context, 'id', service_instance_id),
    user_service: ({ id }, _, context) => getUserService(context, id),
  },
  SubscriptionCapability: {
    service_capability: ({ id }, _, context) =>
      getServiceCapability(context, id),
  },
  Mutation: {
    addSubscription: async (_, { service_instance_id }, context) => {
      const trx = await dbTx();

      // Check the subscription does not already exist :
      try {
        const subscription = await checkSubscriptionExists(
          context,
          context.user.selected_organization_id,
          fromGlobalId(service_instance_id).id
        );

        if (subscription) {
          throw ForbiddenAccess('ALREADY_SUBSCRIBED');
        }

        const subscriptionData = {
          id: uuidv4(),
          service_instance_id: fromGlobalId(service_instance_id).id,
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

        const selectedOrga = await loadOrganizationBy(
          context,
          'id',
          context.user.selected_organization_id
        );

        await addAdminAccess(
          context,
          context.user.id as UserId,
          filledSubscription.id as SubscriptionId,
          selectedOrga.personal_space
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
          ...filledSubscription.service_instance,
          subscribed: true,
          capabilities: ['ACCESS_SERVICE', 'MANAGE_ACCESS'],
        };
      } catch (error) {
        await trx.rollback();
        if (error.name.includes(FORBIDDEN_ACCESS)) {
          logApp.warn(
            'Forbidden access while adding subscription: you have already subscribed this service.'
          );
          throw ForbiddenAccess('ALREADY_SUBSCRIBED');
        }
        throw UnknownError('SERVICE_SUBSCRIPTION_ERROR', { detail: error });
      }
    },
    addSubscriptionInService: async (
      _,
      {
        service_instance_id,
        organization_id,
        capability_ids,
        start_date,
        end_date,
      },
      context
    ) => {
      const trx = await dbTx();

      // Check the subscription does not already exist :
      try {
        const subscription = await checkSubscriptionExists(
          context,
          fromGlobalId(organization_id).id ??
            context.user.selected_organization_id,
          fromGlobalId(service_instance_id).id
        );
        if (subscription) {
          throw ForbiddenAccess('ALREADY_SUBSCRIBED_ORGANIZATION_ERROR');
        }

        const subscriptionData = {
          id: uuidv4(),
          service_instance_id: fromGlobalId(service_instance_id).id,
          organization_id:
            fromGlobalId(organization_id).id ??
            context.user.selected_organization_id,
          start_date: start_date,
          end_date: end_date,
          billing: 0,
          status: 'ACCEPTED',
        };

        const [addedSubscription] = await db<Subscription>(
          context,
          'Subscription'
        )
          .insert(subscriptionData)
          .returning('*');

        await addCapabilitiesToSubscription(
          context,
          capability_ids,
          addedSubscription.id as SubscriptionId
        );

        await trx.commit();
        return loadServiceWithSubscriptions(
          context,
          fromGlobalId(service_instance_id).id
        );
      } catch (error) {
        await trx.rollback();
        if (error.name.includes(FORBIDDEN_ACCESS)) {
          logApp.warn(
            "Forbidden access while adding subscription: You've already subscribed this organization to this service."
          );
          throw ForbiddenAccess('ALREADY_SUBSCRIBED_ORGANIZATION_ERROR');
        }
        throw UnknownError('SERVICE_SUBSCRIPTION_ERROR', { detail: error });
      }
    },
    deleteSubscription: async (_, { subscription_id }, context) => {
      try {
        const [subscription] = await loadSubscriptionBy(context, {
          'Subscription.id': extractId<SubscriptionId>(subscription_id),
        } as SubscriptionMutator);

        // TODO: to be rethought when billing is used in XTM
        // if (subscription.billing !== 0) {
        //   throw ForbiddenAccess('ERROR_SUBSCRIPTION_WITH_BILLING');
        // }

        await db<Subscription>(context, 'Subscription')
          .where({ id: fromGlobalId(subscription_id).id })
          .delete('*');

        return loadServiceWithSubscriptions(
          context,
          subscription.service_instance_id
        );
      } catch (error) {
        if (error.name.includes(FORBIDDEN_ACCESS)) {
          logApp.warn(
            'Forbidden access while deleting subscription: you can not delete a subscription with billing.'
          );
          throw ForbiddenAccess('ERROR_SUBSCRIPTION_WITH_BILLING');
        }
        throw UnknownError('DELETE_SUBSCRIPTION_ERROR', { detail: error });
      }
    },
  },
  Query: {
    subscriptionById: async (_, { subscription_id }, context) => {
      const subscriptions = await loadSubscriptionBy(context, {
        'Subscription.id': extractId<SubscriptionId>(subscription_id),
      } as SubscriptionMutator);

      return subscriptions[0];
    },
  },
};

export default resolvers;
