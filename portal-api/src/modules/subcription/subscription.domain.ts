import { db } from '../../../knexfile';
import { Subscription, UserService } from '../../__generated__/resolvers-types';
import {
  SubscriptionId,
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import { UserMutator } from '../../model/kanel/public/User';
import { PortalContext } from '../../model/portal-context';
import { loadOrganizationBy } from '../organizations/organizations.helper';
import { loadServiceInstanceBy } from '../services/service-instance.domain';
import { loadUnsecureUserServiceBy } from '../user_service/user-service.helper';
import { loadUserBy } from '../users/users.domain';
import { loadSubscriptionBy } from './subscription.helper';

export const fillSubscription = async (
  context: PortalContext,
  updatedSubscription: Subscription
): Promise<Subscription> => {
  updatedSubscription.organization = await loadOrganizationBy(
    context,
    'id',
    updatedSubscription.organization_id
  );

  updatedSubscription.service_instance = await loadServiceInstanceBy(
    context,
    'ServiceInstance.id',
    updatedSubscription.service_instance_id
  );
  return updatedSubscription;
};

export const checkSubscriptionExists = async (
  context: PortalContext,
  organization_id: string,
  service_instance_id: string
): Promise<Subscription | false> => {
  const subscriptionQuery = db<Subscription>(context, 'Subscription')
    .where({ organization_id, service_instance_id })
    .select('*')
    .first();
  const sub = await subscriptionQuery;
  return sub ?? false;
};

export const fillSubscriptionWithOrgaServiceAndUserService = async (
  context: PortalContext,
  subscriptionId: SubscriptionId
) => {
  const [sub] = await loadSubscriptionBy({
    'Subscription.id': subscriptionId,
  } as SubscriptionMutator);

  const organization = await loadOrganizationBy(
    context,
    'id',
    sub.organization_id
  );
  const serviceInstance = await loadServiceInstanceBy(
    context,
    'ServiceInstance.id',
    sub.service_instance_id
  );
  const userServices = await loadUnsecureUserServiceBy({
    subscription_id: subscriptionId,
  });
  const populatedUserServices = await fillUserServiceData(userServices);
  const returningSubscription = {
    ...sub,
    organization,
    serviceInstance,
    user_service: populatedUserServices,
  };
  return returningSubscription;
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
