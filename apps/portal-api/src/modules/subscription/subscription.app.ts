import { v4 as uuidv4 } from 'uuid';
import { paginate } from '../../../knexfile';
import {
  SubscriptionConnection,
  SubscriptionModel,
} from '../../__generated__/resolvers-types';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { ServiceCapabilityId } from '../../model/kanel/public/ServiceCapability';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import Subscription, {
  SubscriptionId,
} from '../../model/kanel/public/Subscription';
import { UserLoadUserBy } from '../../model/user';
import { logApp } from '../../utils/app-logger.util';
import { ErrorCode } from '../../utils/error/error.code';
import { addCapabilitiesToSubscription } from '../security-management/service-capability/subscription-capability.domain';
import {
  createSubscription,
  loadSubscriptionBy,
  SubscriptionDomain,
} from './subscription.domain';

export const subscriptionApp = {
  loadSubscriptionModel: async (
    user: UserLoadUserBy,
    service_instance_id: ServiceInstanceId
  ): Promise<SubscriptionModel> => {
    const subscription = await loadSubscriptionBy({
      service_instance_id,
      organization_id: user.selected_organization_id,
    });

    return subscription as unknown as SubscriptionModel;
  },

  subscribeOrganizationToService: async ({
    organizationId,
    serviceInstanceId,
    startDate,
    endDate,
    capabilityIds,
  }: {
    organizationId: OrganizationId;
    serviceInstanceId: ServiceInstanceId;
    startDate: Date;
    endDate: Date;
    capabilityIds: ServiceCapabilityId[];
  }): Promise<Subscription | undefined> => {
    await assertOrganizationIsNotAlreadySubscribed({
      serviceInstanceId,
      organizationId,
    });

    const subscriptionData = {
      id: uuidv4() as SubscriptionId,
      service_instance_id: serviceInstanceId,
      organization_id: organizationId,
      start_date: startDate,
      end_date: endDate,
    };

    const createdSubscription = await createSubscription(subscriptionData);
    await addCapabilitiesToSubscription(createdSubscription.id, capabilityIds);
    return createdSubscription;
  },

  deleteSubscription: async (id: SubscriptionId): Promise<Subscription> => {
    return SubscriptionDomain.deleteSubscription(id);
  },

  loadSubscriptions: async (opts) => {
    const { filters, searchTerm, orderBy } = opts;
    return paginate<Subscription, SubscriptionConnection>('Subscription', {
      ...opts,
      orderBy: `Subscription.${orderBy}`,
      filters,
      searchTerm,
    });
  },
};

const assertOrganizationIsNotAlreadySubscribed = async ({
  serviceInstanceId,
  organizationId,
}: {
  serviceInstanceId: ServiceInstanceId;
  organizationId: OrganizationId;
}) => {
  const subscription = await loadSubscriptionBy({
    organization_id: organizationId,
    service_instance_id: serviceInstanceId,
  });

  if (subscription) {
    logApp.warn(
      'Forbidden access while adding subscription: you have already subscribed this service.'
    );

    throw new Error(ErrorCode.AlreadySubscribed);
  }
};
