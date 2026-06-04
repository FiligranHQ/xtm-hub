import {
  Resolvers,
  ServiceInstance,
  SubscriptionModel,
} from '../../__generated__/resolvers-types';

import {
  SubscriptionId,
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import { SubscriptionCapabilityId } from '../../model/kanel/public/SubscriptionCapability';
import {
  NotFoundErrorCode,
  UnknownErrorCode,
} from '../../utils/error/error.code';
import { mapToGraphQLError } from '../../utils/error/error.mapping';
import { NotFoundError } from '../../utils/error/error.util';
import { createRelayIdScalar } from '../../utils/scalar.util';
import { OrganizationDomain } from '../organization-management/organization/organization.domain';
import { loadServiceInstanceBy } from '../service/instance/service-instance.domain';
import { subscriptionApp } from './subscription.app';
import { SubscriptionDomain } from './subscription.domain';
import { loadSubscriptionWithOrganizationAndCapabilitiesBy } from './subscription.helper';

const resolvers: Resolvers = {
  SubscriptionId: createRelayIdScalar<SubscriptionId>('Subscription'),
  SubscriptionModel: {
    subscription_capability: ({ id }, _) =>
      SubscriptionDomain.getSubscriptionCapability(id as SubscriptionId),
    service_instance: async ({ service_instance_id }, _) => {
      const instance = await loadServiceInstanceBy({ id: service_instance_id });
      if (!instance)
        throw NotFoundError(NotFoundErrorCode.ServiceInstanceNotFound);
      return instance as unknown as ServiceInstance;
    },
    user_service: ({ id }, _) =>
      SubscriptionDomain.getUserService(id as SubscriptionId),
    organization: ({ organization_id }, _) =>
      OrganizationDomain.loadOrganizationBy({ id: organization_id }),
  },
  SubscriptionCapability: {
    service_capability: ({ id }, _) =>
      SubscriptionDomain.getServiceCapability(id as SubscriptionCapabilityId),
  },
  Mutation: {
    createSubscriptions: async (_, { input }) => {
      try {
        return (await subscriptionApp.subscribeOrganizationsToService({
          organizationIds: input.organization_id,
          serviceInstanceId: input.service_instance_id,
          startDate: input.start_date,
          endDate: input.end_date,
          capabilityIds: input.capability_ids ?? [],
        })) as unknown as SubscriptionModel[];
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.ServiceSubscriptionError
        );
      }
    },
    deleteSubscriptions: async (_, { subscription_ids }) => {
      try {
        return (await subscriptionApp.deleteSubscriptions(
          subscription_ids
        )) as unknown as SubscriptionModel[];
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.DeleteSubscriptionError
        );
      }
    },
    updateSubscription: async (_, { subscription_id, input }) => {
      try {
        return (await subscriptionApp.updateSubscription({
          id: subscription_id,
          startDate: input.start_date,
          endDate: input.end_date,
          capabilityIds: input.capability_ids ?? undefined,
        })) as unknown as SubscriptionModel;
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.ServiceSubscriptionError
        );
      }
    },
  },
  Query: {
    subscriptionById: async (_, { subscription_id }) => {
      const subscriptions =
        await loadSubscriptionWithOrganizationAndCapabilitiesBy({
          'Subscription.id': subscription_id,
        } as SubscriptionMutator);

      return subscriptions[0];
    },
    subscriptions: async (_, opt) => {
      return subscriptionApp.loadSubscriptions(opt);
    },
  },
};

export default resolvers;
