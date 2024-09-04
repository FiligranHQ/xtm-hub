import UserService, {
  UserServiceId,
  UserServiceInitializer,
  UserServiceMutator,
} from '../../model/kanel/public/UserService';
import { db, dbUnsecure } from '../../../knexfile';
import { UserId } from '../../model/kanel/public/User';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { v4 as uuidv4 } from 'uuid';
import ServiceCapability, {
  ServiceCapabilityId,
  ServiceCapabilityInitializer,
} from '../../model/kanel/public/ServiceCapability';
import {
  insertSubscription,
  loadUnsecureSubscriptionBy,
} from '../subcription/subscription.helper';
import { OrganizationId } from '../../model/kanel/public/Organization';

export const loadUnsecureUserServiceBy = (field: UserServiceMutator) => {
  return dbUnsecure<UserService>('User_Service').where(field);
};

export const isUserServiceExist = async (
  user_id: UserId,
  subscription_id: SubscriptionId
) => {
  const [existingUserService] = await loadUnsecureUserServiceBy({
    user_id,
    subscription_id,
  });
  return !!existingUserService;
};

export const createUserServiceAccess = async (
  context,
  {
    subscription_id,
    user_id,
    capabilities,
  }: {
    subscription_id: SubscriptionId;
    user_id: UserId;
    capabilities: string[];
  }
) => {
  const user_service: UserServiceInitializer = {
    id: uuidv4() as UserServiceId,
    subscription_id,
    user_id,
  };
  const [addedUserService] = await db<UserService>(context, 'User_Service')
    .insert(user_service)
    .returning('*');

  for (const capability of capabilities) {
    const service_capa: ServiceCapabilityInitializer = {
      id: uuidv4() as ServiceCapabilityId,
      user_service_id: addedUserService.id,
      service_capability_name: capability,
    };

    await db<ServiceCapability>(context, 'Service_Capability')
      .insert(service_capa)
      .returning('*');
  }
  return addedUserService;
};

export const createUserAccessForOtherOrg = async (
  context,
  {
    subscription_id,
    user_id,
    capabilities,
    organization_id,
  }: {
    subscription_id: SubscriptionId;
    user_id: UserId;
    capabilities: string[];
    organization_id: OrganizationId;
  }
) => {
  const [subscription] = await loadUnsecureSubscriptionBy({
    id: subscription_id,
  });
  const [subOrga] = await loadUnsecureSubscriptionBy({
    organization_id,
    service_id: subscription.service_id,
  });

  // In case the subscription already exist for the organization
  if (subOrga) {
    return await createUserServiceAccess(context, {
      subscription_id: subOrga.id as SubscriptionId,
      user_id,
      capabilities,
    });
  }

  const newSubForOrga = await createNewSubForOrga(context, {
    subscription,
    organization_id,
  });

  return await createUserServiceAccess(context, {
    subscription_id: newSubForOrga.id as SubscriptionId,
    user_id,
    capabilities,
  });
};

export const createNewSubForOrga = async (
  context,
  { subscription, organization_id }
) => {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    __typename,
    ...newSub
  } = subscription;
  const [newSubForOrga] = await insertSubscription(context, {
    ...newSub,
    id: uuidv4() as SubscriptionId,
    justification: 'Invited from subscription_id',
    organization_id,
    billing: 0,
  });
  return newSubForOrga;
};
