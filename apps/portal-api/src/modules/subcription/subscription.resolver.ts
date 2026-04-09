import { Resolvers } from '../../__generated__/resolvers-types';

import { OrganizationId } from '../../model/kanel/public/Organization';
import { ServiceCapabilityId } from '../../model/kanel/public/ServiceCapability';
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
    subscription_capability: ({ id }, _) => getSubscriptionCapability(id),
    service_instance: ({ service_instance_id }, _) =>
      loadServiceInstanceBy('id', service_instance_id),
    user_service: ({ id }, _) => getUserService(id),
  },
  SubscriptionCapability: {
    service_capability: ({ id }, _) => getServiceCapability(id),
  },
  Mutation: {
    addSubscription: async (_, { service_instance_id }) => {
      try {
        return await subscriptionApp.subscribeSelectedOrganizationToService({
          serviceInstanceId: service_instance_id,
        });
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
        const serviceInstanceId = service_instance_id;
        const capabilityIds = capability_ids.map((capability_id) =>
          extractId<ServiceCapabilityId>(capability_id)
        );

        await subscriptionApp.subscribeOrganizationToService({
          organizationId,
          serviceInstanceId,
          startDate: start_date,
          endDate: end_date,
          capabilityIds,
        });

        return loadServiceWithSubscriptions(serviceInstanceId);
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.ServiceSubscriptionError
        );
      }
    },
    deleteSubscription: async (_, { subscription_id }) => {
      try {
        const { service_instance_id } =
          await subscriptionApp.deleteSubscription(
            extractId<SubscriptionId>(subscription_id)
          );

        return loadServiceWithSubscriptions(service_instance_id);
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.DeleteSubscriptionError
        );
      }
    },
  },
  Query: {
    subscriptionById: async (_, { subscription_id }) => {
      const subscriptions =
        await loadSubscriptionWithOrganizationAndCapabilitiesBy({
          'Subscription.id': extractId<SubscriptionId>(subscription_id),
        } as SubscriptionMutator);

      return subscriptions[0];
    },
  },
};

export default resolvers;
