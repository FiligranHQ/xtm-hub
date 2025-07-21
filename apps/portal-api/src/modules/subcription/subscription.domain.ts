import { db } from '../../../knexfile';
import {
  ServiceCapability,
  SubscriptionModel,
  UserService,
} from '../../__generated__/resolvers-types';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import Subscription, {
  SubscriptionId,
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import { UserMutator } from '../../model/kanel/public/User';
import { PortalContext } from '../../model/portal-context';
import { loadOrganizationBy } from '../organizations/organizations.helper';
import { loadServiceInstanceBy } from '../services/service-instance.domain';
import { loadUnsecureUserServiceBy } from '../user_service/user-service.helper';
import { loadUserBy } from '../users/users.domain';
import { loadSubscriptionWithOrganizationAndCapabilitiesBy } from './subscription.helper';

export const fillSubscription = async (
  context: PortalContext,
  updatedSubscription: SubscriptionModel
): Promise<SubscriptionModel> => {
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

export const getSubscriptionCapability = async (context, id) => {
  return db<UserService>(context, 'Subscription_Capability')
    .where('Subscription_Capability.subscription_id', '=', id)
    .select('Subscription_Capability.*');
};

export const getUserService = (context, id) => {
  return db<UserService>(context, 'User_Service')
    .where('User_Service.subscription_id', '=', id)
    .select('User_Service.*');
};

export const getServiceCapability = async (context, id) => {
  return db<ServiceCapability>(context, 'Service_Capability')
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

export const checkSubscriptionExists = async (
  context: PortalContext,
  organization_id: OrganizationId,
  service_instance_id: ServiceInstanceId
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
  const [sub] = await loadSubscriptionWithOrganizationAndCapabilitiesBy(
    context,
    {
      'Subscription.id': subscriptionId,
    } as SubscriptionMutator
  );

  const organization = await loadOrganizationBy(
    context,
    'Organization.id',
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

export const loadSubscriptionBy = async (
  context: PortalContext,
  field: SubscriptionMutator
): Promise<Subscription | undefined> => {
  return db<Subscription>(context, 'Subscription').where(field).first();
};

export const endSubscription = async (
  context: PortalContext,
  subscriptionId: SubscriptionId
) => {
  await db(context, 'Subscription')
    .update({
      end_date: new Date(),
    })
    .where('id', '=', subscriptionId);
};

export const transferSubscription = async (
  context: PortalContext,
  {
    subscriptionId,
    targetOrganizationId,
  }: {
    subscriptionId: string;
    targetOrganizationId: string;
  }
) => {
  await db(context, 'Subscription')
    .update({
      organization_id: targetOrganizationId,
    })
    .where('id', '=', subscriptionId);
};

export const loadLastSubscriptionByServiceInstance = async (
  context: PortalContext,
  serviceInstanceIds: ServiceInstanceId[]
): Promise<Subscription | null> => {
  return db<Subscription>(context, 'Subscription')
    .whereRaw(
      `service_instance_id in (${serviceInstanceIds.map(() => '?').join(',')})`,
      serviceInstanceIds
    )
    .whereNotNull('end_date')
    .orderBy('end_date', 'desc')
    .first()
    .select('*');
};

export const loadSubscription = async (context: PortalContext, id: string) => {
  return await db<Subscription>(context, 'Subscription')
    .where('service_instance_id', '=', id)
    .where('organization_id', '=', context.user.selected_organization_id)
    .first();
};
