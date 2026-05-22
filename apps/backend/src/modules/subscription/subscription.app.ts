import { v4 as uuidv4 } from 'uuid';
import { paginate } from '../../../knexfile';
import {
  SubscriptionConnection,
  SubscriptionModel,
} from '../../__generated__/resolvers-types';
import { withTransaction } from '../../context/database.context';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { ServiceCapabilityId } from '../../model/kanel/public/ServiceCapability';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import Subscription, {
  SubscriptionId,
} from '../../model/kanel/public/Subscription';
import { UserLoadUserBy } from '../../model/user';
import { logApp } from '../../utils/app-logger.util';
import { ErrorCode } from '../../utils/error/error.code';
import {
  addCapabilitiesToSubscription,
  replaceCapabilitiesForSubscription,
} from '../security-management/subscription-capability/subscription-capability.domain';
import {
  createSubscription,
  loadSubscriptionBy,
  SubscriptionDomain,
  updateSubscriptionBy,
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

  subscribeOrganizationsToService: async ({
    organizationIds,
    serviceInstanceId,
    startDate,
    endDate,
    capabilityIds,
  }: {
    organizationIds: OrganizationId[];
    serviceInstanceId: ServiceInstanceId;
    startDate: Date;
    endDate: Date;
    capabilityIds: ServiceCapabilityId[];
  }): Promise<Subscription[] | undefined> => {
    const createdSubscriptions: Subscription[] = [];
    return withTransaction(async () => {
      for (const organizationId of organizationIds) {
        await assertOrganizationIsNotAlreadySubscribed({
          serviceInstanceId,
          organizationId,
        });

        const createdSubscription = await createSubscription({
          id: uuidv4() as SubscriptionId,
          service_instance_id: serviceInstanceId,
          organization_id: organizationId,
          start_date: startDate,
          end_date: endDate,
        });

        await addCapabilitiesToSubscription(
          createdSubscription.id,
          capabilityIds
        );
        createdSubscriptions.push(createdSubscription);
      }

      return createdSubscriptions;
    });
  },

  deleteSubscriptions: async (
    ids: SubscriptionId[]
  ): Promise<Subscription[]> => {
    return SubscriptionDomain.deleteSubscriptions(ids);
  },

  updateSubscription: async ({
    id,
    startDate,
    endDate,
    capabilityIds,
  }: {
    id: SubscriptionId;
    startDate?: Date;
    endDate?: Date;
    capabilityIds?: ServiceCapabilityId[];
  }): Promise<Subscription> => {
    return withTransaction(async () => {
      const data: Partial<Subscription> = {};
      if (startDate !== undefined) data.start_date = startDate;
      if (endDate !== undefined) data.end_date = endDate;

      let updatedSubscription: Subscription;
      if (Object.keys(data).length > 0) {
        const [result] = await updateSubscriptionBy({ id }, data);
        updatedSubscription = result;
      } else {
        updatedSubscription = await loadSubscriptionBy({ id });
      }

      if (capabilityIds !== undefined) {
        await replaceCapabilitiesForSubscription(id, capabilityIds);
      }

      return updatedSubscription;
    });
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
