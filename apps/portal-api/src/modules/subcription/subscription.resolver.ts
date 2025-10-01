import { fromGlobalId } from 'graphql-relay/node/node.js';
import { db } from '../../../knexfile';
import { Resolvers, Subscription } from '../../__generated__/resolvers-types';

import { OrganizationId } from '../../model/kanel/public/Organization';
import { ServiceCapabilityId } from '../../model/kanel/public/ServiceCapability';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import {
  SubscriptionId,
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import { UnknownErrorCode } from '../../utils/error/error.code';
import { mapToGraphQLError } from '../../utils/error/error.mapping';
import { extractId } from '../../utils/utils';
import {
  loadServiceInstanceBy,
  loadServiceWithSubscriptions,
} from '../services/service-instance.domain';
import { subscriptionApp } from './subscription.app';
import {
  getServiceCapability,
  getSubscriptionCapability,
  getUserService,
} from './subscription.domain';
import { loadSubscriptionWithOrganizationAndCapabilitiesBy } from './subscription.helper';

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
      const serviceInstanceId =
        extractId<ServiceInstanceId>(service_instance_id);
      try {
        return await subscriptionApp.subscribeSelectedOrganizationToService(
          context,
          {
            serviceInstanceId,
          }
        );
      } catch (error) {
        throw mapToGraphQLError(error);
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
      try {
        const organizationId =
          extractId<OrganizationId>(organization_id) ??
          context.user.selected_organization_id;
        const serviceInstanceId =
          extractId<ServiceInstanceId>(service_instance_id);
        const capabilityIds = capability_ids.map((capability_id) =>
          extractId<ServiceCapabilityId>(capability_id)
        );

        await subscriptionApp.subscribeOrganizationToService(context, {
          organizationId,
          serviceInstanceId,
          startDate: start_date,
          endDate: end_date,
          capabilityIds,
        });

        return loadServiceWithSubscriptions(
          context,
          fromGlobalId(service_instance_id).id
        );
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.ServiceSubscriptionError
        );
      }
    },
    deleteSubscription: async (_, { subscription_id }, context) => {
      try {
        const [subscription] =
          await loadSubscriptionWithOrganizationAndCapabilitiesBy(context, {
            'Subscription.id': extractId<SubscriptionId>(subscription_id),
          } as SubscriptionMutator);

        // TODO: to be rethought when billing is used in XTM
        // if (subscription.billing !== 0) {
        //     logApp.warn(
        //       'Forbidden access while deleting subscription: you can not delete a subscription with billing.'
        //     );
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
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.DeleteSubscriptionError
        );
      }
    },
  },
  Query: {
    subscriptionById: async (_, { subscription_id }, context) => {
      const subscriptions =
        await loadSubscriptionWithOrganizationAndCapabilitiesBy(context, {
          'Subscription.id': extractId<SubscriptionId>(subscription_id),
        } as SubscriptionMutator);

      return subscriptions[0];
    },
  },
};

export default resolvers;
