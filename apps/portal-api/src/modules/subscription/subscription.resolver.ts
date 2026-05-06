import {
  Resolvers,
  SubscriptionModel,
} from '../../__generated__/resolvers-types';

import {
  SubscriptionId,
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import { UnknownErrorCode } from '../../utils/error/error.code';
import { mapToGraphQLError } from '../../utils/error/error.mapping';
import { createRelayIdScalar } from '../../utils/scalar.util';
import { loadOrganizationBy } from '../organization-management/organization/organization.domain';
import { loadServiceInstanceBy } from '../service/instance/service-instance.domain';
import { subscriptionApp } from './subscription.app';
import {
  getServiceCapability,
  getSubscriptionCapability,
  getUserService,
} from './subscription.domain';
import { loadSubscriptionWithOrganizationAndCapabilitiesBy } from './subscription.helper';

const resolvers: Resolvers = {
  SubscriptionId: createRelayIdScalar<SubscriptionId>('Subscription'),
  SubscriptionModel: {
    subscription_capability: ({ id }, _) => getSubscriptionCapability(id),
    service_instance: ({ service_instance_id }, _) =>
      loadServiceInstanceBy({ id: service_instance_id }),
    user_service: ({ id }, _) => getUserService(id),
    organization: ({ organization_id }, _) =>
      loadOrganizationBy({ id: organization_id }),
  },
  SubscriptionCapability: {
    service_capability: ({ id }, _) => getServiceCapability(id),
  },
  Mutation: {
    createSubscription: async (_, { input }, context) => {
      try {
        const organizationId =
          input.organization_id ?? context.user.selected_organization_id;
        const serviceInstanceId = input.service_instance_id;

        return (await subscriptionApp.subscribeOrganizationToService({
          organizationId,
          serviceInstanceId,
          startDate: input.start_date,
          endDate: input.end_date,
          capabilityIds: input.capability_ids,
        })) as unknown as SubscriptionModel;
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.ServiceSubscriptionError
        );
      }
    },
    deleteSubscription: async (_, { subscription_id }) => {
      try {
        return (await subscriptionApp.deleteSubscription(
          subscription_id
        )) as unknown as SubscriptionModel;
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
