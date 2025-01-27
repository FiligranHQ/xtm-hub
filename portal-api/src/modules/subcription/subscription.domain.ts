import { db } from '../../../knexfile';
import { Subscription } from '../../__generated__/resolvers-types';
import {
  SubscriptionId,
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import UserService from '../../model/kanel/public/UserService';
import { PortalContext } from '../../model/portal-context';
import { loadOrganizationBy } from '../organizations/organizations.helper';
import { loadUnsecureServiceCapabilitiesBy } from '../services/instances/service-capabilities/service_capabilities.helper';
import { loadServiceBy } from '../services/services.domain';
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

  updatedSubscription.service_instance = await loadServiceBy(
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
): Promise<Subscription | boolean> => {
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
  const serviceInstance = await loadServiceBy(
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
    const user = await loadUserBy({ 'User.id': userService.user_id });

    const serviceCapa = await loadUnsecureServiceCapabilitiesBy({
      user_service_id: userService.id,
    });
    // TODO: Issue 10 - Chunk 2, modify API we should pass the corresponding organization to fillUserServiceData
    const userServiceData = {
      id: userService.id,
      user: {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        id: user.id,
        __typename: 'User',
      },
      service_capability: serviceCapa,
    };
    userServicesData.push(userServiceData);
  }
  return userServicesData;
};
