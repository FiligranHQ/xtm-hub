import config from 'config';
import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { db, dbRaw, dbUnsecure } from '../../../knexfile';
import { OrganizationId } from '../../model/kanel/public/Organization';
import ServiceCapability, {
  ServiceCapabilityId,
  ServiceCapabilityInitializer,
} from '../../model/kanel/public/ServiceCapability';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';
import UserService, {
  UserServiceId,
  UserServiceInitializer,
  UserServiceMutator,
} from '../../model/kanel/public/UserService';
import { sendMail } from '../../server/mail-service';
import { loadUserOrganization } from '../common/user-organization.helper';
import { loadServiceBy } from '../services/services.domain';
import {
  insertSubscription,
  loadUnsecureSubscriptionBy,
} from '../subcription/subscription.helper';
import { loadUserBy } from '../users/users.domain';

export const loadUnsecureUserServiceBy = (field: UserServiceMutator) => {
  return dbUnsecure<UserService>('User_Service')
    .where(field)
    .leftJoin(
      'Service_Capability',
      'User_Service.id',
      '=',
      'Service_Capability.user_service_id'
    )
    .leftJoin(
      'Subscription',
      'Subscription.id',
      '=',
      'User_Service.subscription_id'
    )
    .leftJoin(
      'ServiceInstance',
      'ServiceInstance.id',
      '=',
      'Subscription.service_instance_id'
    )
    .select(
      'User_Service.*',
      dbRaw(
        "(json_agg(json_build_object('id', \"Service_Capability\".id, 'service_capability_name', \"Service_Capability\".service_capability_name, '__typename', 'Service_Capability'))) as service_capability"
      ),
      dbRaw(
        '(json_agg(json_build_object(\'id\', "ServiceInstance".id, \'type\', "ServiceInstance".name))->>0)::json as service'
      )
    )
    .groupBy(['User_Service.id']);
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

  // Check the user is in the current organization
  const [subscription] = await loadUnsecureSubscriptionBy({
    id: subscription_id as SubscriptionId,
  });
  const userOrganizations = await loadUserOrganization(context, { user_id });
  if (
    !userOrganizations.some(
      (userOrganization) =>
        userOrganization.organization_id === subscription.organization_id
    )
  ) {
    throw new Error('The user is not in the organization');
  }
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
  const user = await loadUserBy({ 'User.id': user_id });
  const service = await loadServiceBy(
    context,
    'ServiceInstance.id',
    subscription.service_instance_id
  );
  await sendMail({
    to: user.email,
    template: 'partnerVault',
    params: {
      name: user.email,
      partnerVaultLink: `${config.get('base_url_front')}/service/${service.service_definition.route_name}/${toGlobalId('ServiceInstance', service.id)}`,
      partnerVault: service.name,
    },
  });
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
    service_instance_id: subscription.service_instance_id,
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
