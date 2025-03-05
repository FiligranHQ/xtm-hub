import { v4 as uuidv4 } from 'uuid';
import { db, dbRaw, paginate } from '../../../knexfile';
import {
  Subscription,
  UserServiceCapability,
  UserServiceConnection,
} from '../../__generated__/resolvers-types';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';
import UserService, {
  UserServiceId,
} from '../../model/kanel/public/UserService';
import { UserServiceCapabilityId } from '../../model/kanel/public/UserServiceCapability';
import { PortalContext } from '../../model/portal-context';
import { insertServiceCapability } from '../services/instances/service-capabilities/service_capabilities.helper';
import { GenericServiceCapabilityIds } from './service-capability/generic_service_capability.const';

export const insertUserService = async (context, userServiceData) => {
  return db<UserService>(context, 'User_Service')
    .insert(userServiceData)
    .returning('*');
};

export const loadUserServiceById = async (
  context: PortalContext,
  userServiceId
) => {
  return db<UserService>(context, 'User_Service')
    .where('User_Service.id', '=', userServiceId)
    .leftJoin(
      'Subscription as sub',
      'User_Service.subscription_id',
      '=',
      'sub.id'
    )
    .leftJoin(
      'UserService_Capability as userServiceCapa',
      'User_Service.id',
      '=',
      'userServiceCapa.user_service_id'
    )
    .leftJoin(
      'Generic_Service_Capability as genericServCapa',
      'userServiceCapa.generic_service_capability_id',
      '=',
      'genericServCapa.id'
    )
    .leftJoin(
      'ServiceInstance as service',
      'sub.service_instance_id',
      '=',
      'service.id'
    )
    .leftJoin('User as user', 'User_Service.user_id', '=', 'user.id')
    .select([
      'User_Service.*',
      dbRaw(
        "(json_agg(json_build_object('id', \"user\".id,'last_name', \"user\".last_name, 'first_name', \"user\".first_name,  'email', \"user\".email, '__typename', 'User')) ->> 0)::json as user"
      ),
      dbRaw(
        "(json_agg(json_build_object('id', \"sub\".id,'service_instance_id', \"sub\".service_instance_id, 'service_instance', json_build_object('id', \"service\".id,'name', \"service\".name,'__typename', 'ServiceInstance'), '__typename', 'Subscription')) ->> 0)::json as subscription"
      ),
      dbRaw(
        "(json_agg(json_build_object('id', \"userServiceCapa\".id, 'generic_service_capability', json_build_object('id', \"genericServCapa\".id, 'name', \"genericServCapa\".name, '__typename', 'Generic_Service_Capability'), '__typename', 'UserService_Capability'))) as user_service_capability"
      ),
    ])
    .groupBy(['User_Service.id'])
    .first();
};

export const getSubscription = (context, id) => {
  return db<Subscription>(context, 'User_Service')
    .where('User_Service.id', id)
    .leftJoin(
      'Subscription as sub',
      'User_Service.subscription_id',
      '=',
      'sub.id'
    )
    .select('sub.*')
    .first();
};

export const getUserServiceCapabilities = async (context, id) => {
  const initialQuery = db<UserServiceCapability>(context, 'User_Service').where(
    'User_Service.id',
    id
  );
  const generic_service_capabilities = await initialQuery
    .clone()
    .leftJoin(
      'UserService_Capability as userServcapa',
      'User_Service.id',
      '=',
      'userServcapa.user_service_id'
    )
    .leftJoin(
      'Generic_Service_Capability as genericservcapa',
      'userServcapa.generic_service_capability_id',
      '=',
      'genericservcapa.id'
    )
    .whereNotNull('genericservcapa.id')
    .select(['userServcapa.id as userServcapaId', 'genericservcapa.*']);

  const subscription_capabilities = await initialQuery
    .clone()
    .leftJoin(
      'UserService_Capability as userServcapa',
      'User_Service.id',
      '=',
      'userServcapa.user_service_id'
    )
    .leftJoin(
      'Subscription_Capability',
      'userServcapa.subscription_capability_id',
      '=',
      'Subscription_Capability.id'
    )
    .leftJoin(
      'Service_Capability',
      'Subscription_Capability.service_capability_id',
      '=',
      'Service_Capability.id'
    )
    .whereNotNull('Service_Capability.id')
    .select([
      'userServcapa.id as userServcapaId',
      'Subscription_Capability.id as subscriptionCapaId',
      'Service_Capability.*',
    ]);

  const userServiceCapability = [
    ...generic_service_capabilities.map(
      ({ userServcapaId, ...generic_service_capability }) => ({
        id: userServcapaId,
        user_service_id: id,
        generic_service_capability: {
          ...generic_service_capability,
          __typename: 'Generic_Service_Capability',
        },
      })
    ),
    ...subscription_capabilities.map(
      ({ userServcapaId, subscriptionCapaId, ...service_capability }) => ({
        id: userServcapaId,
        user_service_id: id,
        subscription_capability: {
          id: subscriptionCapaId,
          service_capability: {
            ...service_capability,
            __typename: 'Service_Capability',
          },
          __typename: 'Subscription_Capability',
        },
      })
    ),
  ];
  return userServiceCapability.length > 0 ? userServiceCapability : undefined;
};

export const loadUserServiceByUser = (context: PortalContext, opts) => {
  const userSelectedOrganization = context.user.selected_organization_id;
  const userId = context.user.id;

  const userServiceQuery = db<UserService>(context, 'User_Service', opts)
    .leftJoin('User as user', 'User_Service.user_id', '=', 'user.id')
    .leftJoin(
      'Subscription as sub',
      'User_Service.subscription_id',
      '=',
      'sub.id'
    )
    .leftJoin(
      'ServiceInstance as service',
      'sub.service_instance_id',
      '=',
      'service.id'
    )
    .leftJoin(
      'Service_Link as service_link',
      'service.id',
      '=',
      'service_link.service_instance_id'
    )
    .where('sub.status', 'ACCEPTED')
    .where('user.id', userId)
    .where('sub.organization_id', userSelectedOrganization)
    .select(['User_Service.*', 'service.name as service_name'])
    .groupBy(['User_Service.id', 'service.name', 'sub.id']);

  return paginate<UserService, UserServiceConnection>(
    context,
    'User_Service',
    opts,
    undefined,
    userServiceQuery
  );
};

export const addAdminAccess = async (
  context: PortalContext,
  adminId: UserId,
  subscriptionId: SubscriptionId
) => {
  const dataUserService = {
    id: uuidv4() as UserServiceId,
    user_id: adminId,
    subscription_id: subscriptionId,
  };
  const [userService] = await insertUserService(context, dataUserService);
  const capabilitiesId = [
    GenericServiceCapabilityIds.AccessId,
    GenericServiceCapabilityIds.ManageAccessId,
  ];
  const dataCapabilities = capabilitiesId.map((capabilityId) => ({
    id: uuidv4() as UserServiceCapabilityId,
    user_service_id: userService.id,
    generic_service_capability_id: capabilityId,
  }));

  await insertServiceCapability(context, dataCapabilities);
};
