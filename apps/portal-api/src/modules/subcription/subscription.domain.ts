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
import { UserMutator } from '../../model/kanel/public/User';
import { restrictSubscriptionToUserOrganization } from '../../security/restriction/user-service';
import { loadOrganizationBy } from '../organization-management/organizations/organizations.domain';
import { loadUserBy } from '../organization-management/users/user-domain/users.domain';
import { loadServiceInstanceBy } from '../services/service-instance.domain';
import { UserServiceDomain } from '../user_service/user_service.domain';
import { loadSubscriptionWithOrganizationAndCapabilitiesBy } from './subscription.helper';

export const SubscriptionDomain = {
  deleteSubscription: async (
    id: SubscriptionId
  ): Promise<Subscription | null> => {
    const [deletedSubscription] = await db<Subscription>('Subscription')
      .where({ id })
      .delete('*');
    return deletedSubscription;
  },
};

export const getSubscriptionCapability = async (id) => {
  return db<UserService>('Subscription_Capability')
    .where('Subscription_Capability.subscription_id', '=', id)
    .select('Subscription_Capability.*');
};

export const getUserService = (id) => {
  return db<UserService>('User_Service')
    .tap(restrictSubscriptionToUserOrganization)
    .where('User_Service.subscription_id', '=', id)
    .select('User_Service.*');
};

export const getServiceCapability = async (id) => {
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
};

export const fillSubscriptionWithOrgaServiceAndUserService = async (
  subscriptionId: SubscriptionId
) => {
  const [sub] = await loadSubscriptionWithOrganizationAndCapabilitiesBy({
    'Subscription.id': subscriptionId,
  } as SubscriptionMutator);

  const organization = await loadOrganizationBy({ id: sub.organization_id });

  const serviceInstance = await loadServiceInstanceBy(
    'ServiceInstance.id',
    sub.service_instance_id
  );
  const userServices =
    await UserServiceDomain.loadUserServiceWithCapabilitiesBy({
      subscription_id: subscriptionId,
    });
  const populatedUserServices = await fillUserServiceData(userServices);

  return {
    ...sub,
    organization,
    serviceInstance,
    user_service: populatedUserServices,
  };
};
export const fillUserServiceData = async (userServices: UserService[]) => {
  const userServicesData = [];
  for (const userService of userServices) {
    const user = await loadUserBy({
      'User.id': userService.user_id,
    } as UserMutator);

    const userServiceData = {
      id: userService.id,
      user: {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        id: user.id,
        __typename: 'User',
      },
      user_service_capability: userService.user_service_capability,
    };
    userServicesData.push(userServiceData);
  }
  return userServicesData;
};

export const transferSubscriptionToOrganization = async ({
  subscriptionId,
  organizationId,
}: {
  subscriptionId: SubscriptionId;
  organizationId: OrganizationId;
}) => {
  return db<Subscription>('Subscription')
    .update({ organization_id: organizationId })
    .where({ id: subscriptionId });
};

export const createSubscription = async (
  data: SubscriptionInitializer
): Promise<Subscription> => {
  const [createdSubscription] = await db<Subscription>('Subscription')
    .insert(data)
    .returning('*');

  return createdSubscription;
};

export const loadSubscriptionBy = async (
  field: SubscriptionMutator
): Promise<Subscription | null> => {
  return db<Subscription>('Subscription').where(field).first();
};

export const updateSubscriptionBy = async (
  field: SubscriptionMutator,
  data: SubscriptionMutator
): Promise<Subscription[]> => {
  return db<Subscription>('Subscription')
    .where(field)
    .update(data)
    .returning('*');
};
