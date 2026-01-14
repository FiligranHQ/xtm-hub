import { v4 as uuidv4 } from 'uuid';
import { db, dbRaw, paginate } from '../../../knexfile';
import {
  Subscription,
  UserServiceCapability,
  UserServiceConnection,
} from '../../__generated__/resolvers-types';
import { withTransaction } from '../../context/database.context';
import SubscriptionModel, {
  SubscriptionId,
} from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';
import UserService, {
  UserServiceId,
  UserServiceMutator,
} from '../../model/kanel/public/UserService';
import { UserServiceCapabilityId } from '../../model/kanel/public/UserServiceCapability';
import { UserLoadUserBy } from '../../model/user';
import { restrictSubscriptionToUserOrganization } from '../../security/restriction/user-service';
import { formatRawObject } from '../../utils/queryRaw.util';
import { addPrefixToObject } from '../../utils/typescript';
import { insertServiceCapability } from '../services/instances/service-capabilities/service_capabilities.helper';
import {
  getOrCreateUser,
  insertUserIntoOrganization,
} from '../users/users.helper';
import {
  GenericServiceCapabilityIds,
  GenericServiceCapabilityName,
} from './service-capability/generic_service_capability.const';
import {
  createUserServiceAccess,
  isUserServiceExist,
} from './user-service.helper';

export const UserServiceDomain = {
  addServiceToUsers: async (
    subscription: SubscriptionModel,
    emails: string[],
    capabilities: string[]
  ): Promise<UserService[]> => {
    const userServices: UserService[] = [];
    return withTransaction(async () => {
      for (const email of emails) {
        const user = await getOrCreateUser({
          email: email,
        });

        await insertUserIntoOrganization(user, subscription.id);
        const userServiceAlreadyExist = await isUserServiceExist(
          user.id as UserId,
          subscription.id
        );

        if (!userServiceAlreadyExist) {
          const createdUserService = await createUserServiceAccess({
            subscription_id: subscription.id,
            user_id: user.id as UserId,
            capabilities: capabilities,
          });
          userServices.push(createdUserService);
        }
      }
      return userServices;
    });
  },
};

export const insertUserService = async (userServiceData) => {
  return db<UserService>('User_Service').insert(userServiceData).returning('*');
};

export const loadUserServiceById = async (userServiceId) => {
  return db<UserService>('User_Service')
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

export const getSubscription = (id) => {
  return db<Subscription>('User_Service')
    .tap(restrictSubscriptionToUserOrganization)
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

export const getUserServiceCapabilities = async (
  userServiceId: UserServiceId
) => {
  const initialQuery = db<UserServiceCapability>('User_Service').where(
    'User_Service.id',
    userServiceId
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
        user_service_id: userServiceId,
        generic_service_capability: {
          ...generic_service_capability,
          __typename: 'Generic_Service_Capability',
        },
      })
    ),
    ...subscription_capabilities.map(
      ({ userServcapaId, subscriptionCapaId, ...service_capability }) => ({
        id: userServcapaId,
        user_service_id: userServiceId,
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
export const loadUserServiceBySubscription = (opts, subscriptionId) => {
  const userServiceQuery = db<UserService>('User_Service')
    .where('subscription_id', '=', subscriptionId)
    .leftJoin('User as user', 'User_Service.user_id', '=', 'user.id')
    .select([
      'User_Service.*',
      dbRaw(
        formatRawObject({
          columnName: 'user',
          typename: 'User',
          as: 'user',
        })
      ),
    ]);
  return paginate<UserService, UserServiceConnection>(
    'User_Service',
    opts,
    undefined,
    userServiceQuery
  );
};
export const loadUserServiceByUser = (user: UserLoadUserBy, opts) => {
  const userSelectedOrganization = user.selected_organization_id;
  const userId = user.id;

  const userServiceQuery = db<UserService>('User_Service')
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
    .where((qb) =>
      qb
        .where('sub.end_date', '>=', new Date())
        .where('sub.start_date', '<=', new Date())
        .orWhereNull('sub.end_date')
    )
    .where('user.id', userId)
    .where('sub.organization_id', userSelectedOrganization)
    .select([
      'User_Service.*',
      'service.name as service_name',
      'service.ordering as ordering',
    ])
    .groupBy(['User_Service.id', 'service.name', 'service.ordering', 'sub.id']);

  return paginate<UserService, UserServiceConnection>(
    'User_Service',
    opts,
    undefined,
    userServiceQuery
  );
};

export const addAdminAccess = async (
  adminId: UserId,
  subscriptionId: SubscriptionId,
  isPersonalSpace: boolean = false
) => {
  const dataUserService = {
    id: uuidv4() as UserServiceId,
    user_id: adminId,
    subscription_id: subscriptionId,
  };
  const [userService] = await insertUserService(dataUserService);
  const capabilitiesId = isPersonalSpace
    ? [GenericServiceCapabilityIds.AccessId]
    : [
        GenericServiceCapabilityIds.AccessId,
        GenericServiceCapabilityIds.ManageAccessId,
      ];
  const dataCapabilities = capabilitiesId.map((capabilityId) => ({
    id: uuidv4() as UserServiceCapabilityId,
    user_service_id: userService.id,
    generic_service_capability_id: capabilityId,
  }));
  await insertServiceCapability(dataCapabilities);
};

export const loadUserServiceBy = async (
  field:
    | addPrefixToObject<UserServiceMutator, 'User_Service.'>
    | UserServiceMutator
): Promise<UserService[]> => {
  return db<UserService>('User_Service').where(field);
};

export const loadUserServiceCapability = async (
  userId: UserId,
  subscriptionId: SubscriptionId,
  capability: GenericServiceCapabilityName
) => {
  return db('User_Service')
    .leftJoin(
      'UserService_Capability',
      'User_Service.id',
      'UserService_Capability.user_service_id'
    )
    .leftJoin(
      'Generic_Service_Capability',
      'Generic_Service_Capability.id',
      'UserService_Capability.generic_service_capability_id'
    )
    .where({
      user_id: userId,
      'User_Service.subscription_id': subscriptionId,
      'Generic_Service_Capability.name': capability,
    })
    .first();
};

export const deleteUserCapabilityById = async (
  userServiceId: UserServiceId
) => {
  await db<UserServiceCapability>('UserService_Capability')
    .where('user_service_id', '=', userServiceId)
    .delete('*');
};
