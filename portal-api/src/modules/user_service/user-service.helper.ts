import config from 'config';
import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { db, dbRaw, dbUnsecure } from '../../../knexfile';
import { UserServiceCapability } from '../../__generated__/resolvers-types';
import { GenericServiceCapabilityId } from '../../model/kanel/public/GenericServiceCapability';
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
import { GenericServiceCapabilityIds } from './service-capability/generic_service_capability.const';
import { insertCapabilities } from './user-service-capability/user-service-capability.helper';

export const loadUnsecureUserServiceBy = async (field: UserServiceMutator) => {
  const queryUserServiceCapabilities = dbUnsecure<UserServiceCapability>(
    'UserService_Capability'
  )
    .leftJoin(
      'Generic_Service_Capability',
      'UserService_Capability.generic_service_capability_id',
      '=',
      'Generic_Service_Capability.id'
    )
    .leftJoin(
      'Subscription_Capability',
      'UserService_Capability.subscription_capability_id',
      '=',
      'Subscription_Capability.id'
    )
    .leftJoin(
      'Service_Capability',
      'Subscription_Capability.service_capability_id',
      '=',
      'Service_Capability.id'
    )
    .select(
      'UserService_Capability.user_service_id',
      dbRaw(
        `json_agg(
        CASE
        WHEN "Generic_Service_Capability".id IS NOT NULL THEN
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
        WHEN "Service_Capability".id IS NOT NULL THEN
        json_build_object(
          'id', "UserService_Capability".id,
          'user_service_id', "UserService_Capability".user_service_id,
          'subscription_capability', json_build_object(
            'id', "Subscription_Capability".id,
            'service_capability', json_build_object(
            'id', "Service_Capability".id,
            'name', "Service_Capability".name,
            '__typename', 'Service_Capability'
            ),
            '__typename', 'Subscription_Capability'
          ),
          '__typename', 'UserServiceCapability'
        )
        ELSE NULL
        END
      ) FILTER (WHERE "Generic_Service_Capability".id IS NOT NULL OR "Service_Capability".id IS NOT NULL) AS capabilities`
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
        `json_build_object(
          'id', "ServiceInstance".id,
          '__typename', 'ServiceInstance'
        ) AS service`
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
  trx,
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

  await insertCapabilities(context, trx, capabilities, addedUserService);
  const user_service_capa: UserServiceCapabilityInitializer = {
    id: uuidv4() as UserServiceCapabilityId,
    user_service_id: addedUserService.id,
    generic_service_capability_id:
      GenericServiceCapabilityIds.AccessId as GenericServiceCapabilityId,
  };
  await db<UserServiceCapability>(context, 'UserService_Capability')
    .insert(user_service_capa)
    .returning('*');

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
