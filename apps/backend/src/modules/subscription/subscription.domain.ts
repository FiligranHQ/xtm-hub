import { db } from '../../../knexfile';
import {
  ServiceCapability,
  UserService,
} from '../../__generated__/resolvers-types';
import { OrganizationId } from '../../model/kanel/public/Organization';
import Subscription, {
  SubscriptionId,
  SubscriptionInitializer,
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import { restrictSubscriptionToUserOrganization } from '../../security/restriction/user-service';
import { UnknownErrorCode } from '../../utils/error/error.code';

export const SubscriptionDomain = {
  deleteSubscriptions: async (
    ids: SubscriptionId[]
  ): Promise<Subscription[] | null> => {
    return db<Subscription>('Subscription').whereIn('id', ids).delete('*');
  },

  getSubscriptionCapability: async (id) => {
    return db<UserService>('Subscription_Capability')
      .where('Subscription_Capability.subscription_id', '=', id)
      .select('Subscription_Capability.*');
  },

  getUserService: (id) => {
    return db<UserService>('User_Service')
      .tap(restrictSubscriptionToUserOrganization)
      .where('User_Service.subscription_id', '=', id)
      .select('User_Service.*');
  },

  getServiceCapability: async (id) => {
    return db<ServiceCapability>('Service_Capability')
      .leftJoin(
        'Subscription_Capability',
        'Subscription_Capability.service_capability_id',
        '=',
        'Service_Capability.id'
      )
      .where('Subscription_Capability.id', '=', id)
      .select('Service_Capability.*')
      .first();
  },

  transferSubscriptionToOrganization: async ({
    subscriptionId,
    organizationId,
  }: {
    subscriptionId: SubscriptionId;
    organizationId: OrganizationId;
  }) => {
    return db<Subscription>('Subscription')
      .update({ organization_id: organizationId })
      .where({ id: subscriptionId });
  },

  createSubscription: async (
    data: SubscriptionInitializer
  ): Promise<Subscription> => {
    const [createdSubscription] = await db<Subscription>('Subscription')
      .insert(data)
      .returning('*');
    if (!createdSubscription) {
      throw new Error(UnknownErrorCode.ServiceSubscriptionError);
    }
    return createdSubscription;
  },

  loadSubscriptionBy: async (
    field: SubscriptionMutator
  ): Promise<Subscription | null> => {
    return db<Subscription>('Subscription').where(field).first();
  },

  loadSubscriptionsBy: async (
    ids: SubscriptionId[]
  ): Promise<Subscription[]> => {
    return db<Subscription[]>('Subscription').whereIn('id', ids).select('*');
  },

  updateSubscriptionBy: async (
    field: SubscriptionMutator,
    data: SubscriptionMutator
  ): Promise<Subscription[]> => {
    return db<Subscription>('Subscription')
      .where(field)
      .update(data)
      .returning('*');
  },
};
