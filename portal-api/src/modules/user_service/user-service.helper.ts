import config from 'config';
import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { db, dbRaw, dbUnsecure } from '../../../knexfile';
import { UserServiceCapability } from '../../__generated__/resolvers-types';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';
import UserService, {
  UserServiceId,
  UserServiceInitializer,
  UserServiceMutator,
} from '../../model/kanel/public/UserService';
import {
  UserServiceCapabilityId,
  UserServiceCapabilityInitializer,
} from '../../model/kanel/public/UserServiceCapability';
import { sendMail } from '../../server/mail-service';
import { loadUserOrganization } from '../common/user-organization.helper';
import { loadServiceInstanceBy } from '../services/service-instance.domain';
import { loadUnsecureSubscriptionBy } from '../subcription/subscription.helper';
import { loadUserBy } from '../users/users.domain';
import { loadGenericServiceCapabilityBy } from './service-capability/generic_service_capability.helper';

export const loadUnsecureUserServiceBy = (field: UserServiceMutator) => {
  const queryUserServiceCapabilities = dbUnsecure<UserServiceCapability>(
    'UserService_Capability'
  )
    .leftJoin(
      'Generic_Service_Capability',
      'UserService_Capability.generic_service_capability_id',
      '=',
      'Generic_Service_Capability.id'
    )
    .select(
      'UserService_Capability.user_service_id',
      dbRaw(
        `json_agg(
        json_build_object(
          'id', "UserService_Capability".id,
          'user_service_id', "UserService_Capability".user_service_id,
          'generic_service_capability', json_build_object(
            'id', "Generic_Service_Capability".id,
            'name', "Generic_Service_Capability".name,
            '__typename', 'Generic_Service_Capability'
          ),
          '__typename', 'UserServiceCapability'
        )
      ) FILTER (WHERE "UserService_Capability".id IS NOT NULL) as capabilities`
      )
    )

    .groupBy('UserService_Capability.user_service_id')
    .as('userServiceCapabilities');

  const query = dbUnsecure<UserService>('User_Service')
    .select(
      'User_Service.*',
      dbRaw(
        `COALESCE("userServiceCapabilities".capabilities, '[]'::json) as user_service_capability`
      ),
      dbRaw(
        `CASE 
        WHEN "ServiceInstance".id IS NOT NULL THEN 
          json_build_object(
            'id', "ServiceInstance".id,
            '__typename', 'ServiceInstance'
          )
        ELSE NULL 
      END as service`
      )
    )
    .leftJoin(
      queryUserServiceCapabilities,
      'User_Service.id',
      '=',
      'userServiceCapabilities.user_service_id'
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
    );

  if (field) {
    query.where(field);
  }
  return query;
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

  for (const capabilityName of capabilities) {
    // TODO #261 Chunk 6 : get capabilty from front with ID directly
    const [capability] = await loadGenericServiceCapabilityBy({
      name: capabilityName,
    });

    const user_service_capa: UserServiceCapabilityInitializer = {
      id: uuidv4() as UserServiceCapabilityId,
      user_service_id: addedUserService.id,
      generic_service_capability_id: capability.id,
    };
    await db<UserServiceCapability>(context, 'UserService_Capability')
      .insert(user_service_capa)
      .returning('*');
  }
  const user = await loadUserBy({ 'User.id': user_id });
  const service = await loadServiceInstanceBy(
    context,
    'ServiceInstance.id',
    subscription.service_instance_id
  );
  await sendMail({
    to: user.email,
    template: 'partnerVault',
    params: {
      name: user.email,
      partnerVaultLink: `${config.get('base_url_front')}/service/${service.service_definition.identifier}/${toGlobalId('ServiceInstance', service.id)}`,
      partnerVault: service.name,
    },
  });
  return addedUserService;
};
