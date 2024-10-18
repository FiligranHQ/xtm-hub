import { PortalContext } from '../../model/portal-context';
import { db, dbRaw, dbUnsecure, paginate } from '../../../knexfile';
import UserService, {
  UserServiceId,
  UserServiceMutator,
} from '../../model/kanel/public/UserService';
import { UserServiceConnection } from '../../__generated__/resolvers-types';
import Service from '../../model/kanel/public/Service';
import { v4 as uuidv4 } from 'uuid';
import { ServiceCapabilityId } from '../../model/kanel/public/ServiceCapability';
import { insertServiceCapability } from '../services/instances/service-capabilities/service_capabilities.helper';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';

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
      'Service_Capability as servcapa',
      'User_Service.id',
      '=',
      'servcapa.user_service_id'
    )
    .leftJoin('Service as service', 'sub.service_id', '=', 'service.id')
    .leftJoin('User as user', 'User_Service.user_id', '=', 'user.id')
    .select([
      'User_Service.*',
      dbRaw(
        "(json_agg(json_build_object('id', \"user\".id,'last_name', \"user\".last_name, 'first_name', \"user\".first_name,  'email', \"user\".email, '__typename', 'User')) ->> 0)::json as user"
      ),
      dbRaw(
        "(json_agg(json_build_object('id', \"sub\".id,'service_id', \"sub\".service_id, 'service', json_build_object('id', \"service\".id,'name', \"service\".name,'__typename', 'Service'), '__typename', 'Subscription')) ->> 0)::json as subscription"
      ),
      dbRaw(
        "(json_agg(json_build_object('id', \"servcapa\".id, 'service_capability_name', \"servcapa\".service_capability_name, '__typename', 'Service_Capability'))) as service_capability"
      ),
    ])
    .groupBy(['User_Service.id'])
    .first();
};

export const loadUserServiceByUser = async (
  context: PortalContext,
  userId,
  opts
) => {
  const queryServicesWithLinks = db<Service>(context, 'Service')
    .leftJoin(
      'Service_Link as service_link',
      'Service.id',
      '=',
      'service_link.service_id'
    )
    .select(
      'Service.*',
      dbRaw(
        `CASE 
        WHEN COUNT(service_link.id) = 0 THEN NULL
        ELSE (json_agg(json_build_object('id', service_link.id, 'name', service_link.name, 'url', service_link.url)))::json 
      END AS services_link`
      )
    )
    .groupBy(['Service.id']);

  const userServiceConnection = await paginate<UserService>(
    context,
    'User_Service',
    opts
  )
    .leftJoin('User as user', 'User_Service.user_id', '=', 'user.id')
    .leftJoin(
      'Subscription as sub',
      'User_Service.subscription_id',
      '=',
      'sub.id'
    )
    .leftJoin(
      queryServicesWithLinks.as('service'),
      'sub.service_id',
      '=',
      'service.id'
    )
    .leftJoin(
      'Service_Capability as servcapa',
      'User_Service.id',
      '=',
      'servcapa.user_service_id'
    )
    .whereRaw(
      `
    (
      "service"."type" != 'COMMUNITY' OR 
      ("service"."type" = 'COMMUNITY' AND "sub"."status" = 'ACCEPTED')
    )
  `
    )
    .where('user.id', userId)
    .select([
      'User_Service.*',
      dbRaw(
        "(json_agg(json_build_object('id', \"user\".id, 'last_name', \"user\".last_name, 'first_name', \"user\".first_name, 'email', \"user\".email, '__typename', 'User')) ->> 0)::json as user"
      ),
      dbRaw(
        `(json_agg(json_build_object('id', "sub".id, 'status', "sub".status, 'service_id', "sub".service_id, 'service', json_build_object('id', "service".id, 'name', "service".name, 'type', "service".type, 'provider', "service".provider, 'description', "service".description, 'links', "service".services_link, '__typename', 'Service'), '__typename', 'Subscription')) ->> 0)::json as subscription`
      ),
      dbRaw(
        "(json_agg(json_build_object('id', \"servcapa\".id, 'service_capability_name', \"servcapa\".service_capability_name, '__typename', 'Service_Capability'))) as service_capability"
      ),
      dbRaw('(service."name") as service_name'),
      dbRaw('(service."provider") as service_provider'),
      dbRaw('(service."type") as service_type'),
      dbRaw('(service."description") as service_description'),
      dbRaw('(sub."status") as subscription_status'),
    ])
    .groupBy([
      'User_Service.id',
      'user.first_name',
      'user.last_name',
      'user.email',
      'service.name',
      'service.type',
      'service.provider',
      'service.description',
      'sub.status',
    ])
    .asConnection<UserServiceConnection>();

  userServiceConnection.edges = userServiceConnection.edges.map((edge) => {
    return {
      cursor: edge.cursor,
      node: edge.node,
    };
  });
  const { totalCount } = await db<UserService>(context, 'User_Service', opts)
    .leftJoin('User as user', 'User_Service.user_id', '=', 'user.id')
    .where('user.id', userId)
    .countDistinct('User_Service.id as totalCount')
    .first();

  return { totalCount, ...userServiceConnection };
};

export const loadUnsecureUserServiceBy = async (field: UserServiceMutator) => {
  return dbUnsecure<UserService>('User_Service').where(field);
};

export const loadUsersBySubscription = async (
  context: PortalContext,
  serviceId,
  opts
) => {
  const userServiceConnection = await paginate<UserService>(
    context,
    'User_Service',
    opts
  )
    .leftJoin('User as user', 'User_Service.user_id', '=', 'user.id')
    .leftJoin(
      'Subscription as sub',
      'User_Service.subscription_id',
      '=',
      'sub.id'
    )
    .leftJoin('Organization as org', 'sub.organization_id', '=', 'org.id')
    .leftJoin('Service as service', 'sub.service_id', '=', 'service.id')
    .leftJoin(
      'Service_Capability as servcapa',
      'User_Service.id',
      '=',
      'servcapa.user_service_id'
    )
    .where('service.id', serviceId)
    .select([
      'User_Service.*',
      dbRaw(
        "(json_agg(json_build_object('id', \"user\".id,'last_name', \"user\".last_name, 'first_name', \"user\".first_name,  'email', \"user\".email, '__typename', 'User')) ->> 0)::json as user"
      ),
      dbRaw(
        "(json_agg(json_build_object('id', \"sub\".id,'billing', \"sub\".billing, 'status', \"sub\".status,'justification', \"sub\".justification, 'service_id', \"sub\".service_id, 'organization', json_build_object('id', \"org\".id,'name', \"org\".name,'__typename', 'Organization'), 'service',json_build_object('id', \"service\".id,'name', \"service\".name, 'description', \"service\".description, '__typename', 'Service'), '__typename', 'Subscription')) ->> 0)::json as subscription"
      ),
      dbRaw(
        "(json_agg(json_build_object('id', \"servcapa\".id, 'service_capability_name', \"servcapa\".service_capability_name, '__typename', 'Service_Capability'))) as service_capability"
      ),
    ])
    .groupBy([
      'User_Service.id',
      'user.first_name',
      'user.last_name',
      'user.email',
    ])
    .asConnection<UserServiceConnection>();

  userServiceConnection.edges = userServiceConnection.edges.map((edge) => {
    return {
      cursor: edge.cursor,
      node: edge.node,
    };
  });
  const { totalCount } = await db<UserService>(context, 'User_Service', opts)
    .countDistinct('id as totalCount')
    .first();
  return { totalCount, ...userServiceConnection };
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
  const capabilities = [
    'ACCESS_SERVICE',
    'MANAGE_ACCESS',
    'ADMIN_SUBSCRIPTION',
  ];
  const dataCapabilities = capabilities.map((capability) => ({
    id: uuidv4() as ServiceCapabilityId,
    user_service_id: userService.id,
    service_capability_name: capability,
  }));

  await insertServiceCapability(context, dataCapabilities);
};
