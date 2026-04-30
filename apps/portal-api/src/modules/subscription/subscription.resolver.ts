import {
  Resolvers,
  SubscriptionModel,
} from '../../__generated__/resolvers-types';

import { OrganizationId } from '../../model/kanel/public/Organization';
import { ServiceCapabilityId } from '../../model/kanel/public/ServiceCapability';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import {
  SubscriptionId,
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import { UnknownErrorCode } from '../../utils/error/error.code';
import { mapToGraphQLError } from '../../utils/error/error.mapping';
import { createRelayIdScalar } from '../../utils/scalar.util';
import { extractId } from '../../utils/utils';
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
      loadServiceInstanceBy({ id: service_instance_id as ServiceInstanceId }),
    user_service: ({ id }, _) => getUserService(id),
    organization: ({ organization_id }, _) =>
      loadOrganizationBy({ id: organization_id as OrganizationId }),
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
        const capabilityIds = input.capability_ids.map((capability_id) =>
          extractId<ServiceCapabilityId>(capability_id)
        );

        return (await subscriptionApp.subscribeOrganizationToService({
          organizationId,
          serviceInstanceId,
          startDate: input.start_date,
          endDate: input.end_date,
          capabilityIds,
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
