import { v4 as uuidv4 } from 'uuid';
import { db, dbRaw, paginate } from '../../../knexfile';
import {
  ServiceInstance,
  UserServiceConnection,
} from '../../__generated__/resolvers-types';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';
import UserService, {
  UserServiceId,
} from '../../model/kanel/public/UserService';
import { UserServiceCapabilityId } from '../../model/kanel/public/UserServiceCapability';
import { PortalContext } from '../../model/portal-context';
import { formatRawObject } from '../../utils/queryRaw.util';
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

export const loadUserServiceByUser = async (context: PortalContext, opts) => {
  const userSelectedOrganization = context.user.selected_organization_id;
  const userId = context.user.id;

  const queryServicesWithLinks = db<ServiceInstance>(context, 'ServiceInstance')
    .leftJoin(
      'Service_Link as service_link',
      'ServiceInstance.id',
      '=',
      'service_link.service_instance_id'
    )
    .leftJoin(
      'ServiceDefinition as service_def',
      'service_def.id',
      '=',
      'ServiceInstance.service_definition_id'
    )
    .select(
      'ServiceInstance.*',
      dbRaw(
        `CASE
        WHEN COUNT(service_link.id) = 0 THEN NULL
        ELSE (json_agg(json_build_object('id', service_link.id, 'name', service_link.name, 'url', service_link.url)))::json
      END AS services_link`
      ),
      dbRaw(
        formatRawObject({
          columnName: 'service_def',
          typename: 'ServiceDefinition',
          as: 'service_definition',
        })
      ),
      'service_def.name as service_definition_name',
      'service_def.description as service_definition_description',
      'service_def.public as service_definition_public',
      'service_def.identifier as service_definition_identifier'
    )
    .groupBy(['ServiceInstance.id', 'service_def.id']);

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
      'sub.service_instance_id',
      '=',
      'service.id'
    )
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
    .where('sub.status', 'ACCEPTED')
    .where('user.id', userId)
    .where('sub.organization_id', userSelectedOrganization)
    .select([
      'User_Service.*',
      dbRaw(
        "(json_agg(json_build_object('id', \"user\".id, 'last_name', \"user\".last_name, 'first_name', \"user\".first_name, 'email', \"user\".email, '__typename', 'User')) ->> 0)::json as user"
      ),
      dbRaw(
        `(json_agg(json_build_object('id', "sub".id, 'status', "sub".status, 'service_instance_id', "sub".service_instance_id, 'service_instance', json_build_object('id', "service".id, 'name', "service".name, 'description', "service".description, 'links', "service".services_link, 'tags', "service".tags, 'illustration_document_id', "service".illustration_document_id, 'logo_document_id', "service".logo_document_id, 'service_definition', json_build_object('id', "service".service_definition_id, 'name', "service".service_definition_name, 'description', "service".service_definition_description, 'public', "service".service_definition_public, 'identifier', "service".service_definition_identifier, '__typename', 'ServiceDefinition'), '__typename', 'ServiceInstance'), '__typename', 'Subscription')) ->> 0)::json as subscription`
      ),
      dbRaw(
        `(json_agg(
        json_build_object(
          'id', "userServcapa".id,
          'generic_service_capability',
          CASE 
            WHEN "genericservcapa".id IS NOT NULL THEN json_build_object('id', "genericservcapa".id, 'name', "genericservcapa".name, '__typename', 'Generic_Service_Capability')
            ELSE null
          END,
          'subscription_capability',
          CASE 
            WHEN "Subscription_Capability".id IS NOT NULL THEN json_build_object('id', "Subscription_Capability".id, 'service_capability', json_build_object('id', "Service_Capability".id, 'name', "Service_Capability".name, '__typename', 'Service_Capability'), '__typename', 'Subscription_Capability')
            ELSE null
          END,
          '__typename', 'UserService_Capability'
        )
      )) as user_service_capability`
      ),
      dbRaw('(service."name") as service_name'),
      dbRaw('(service."description") as service_description'),
      dbRaw('(sub."status") as subscription_status'),
    ])
    .groupBy([
      'User_Service.id',
      'user.first_name',
      'user.last_name',
      'user.email',
      'service.name',
      'service.description',
      'service.service_definition',
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
    .leftJoin(
      'Subscription as sub',
      'User_Service.subscription_id',
      '=',
      'sub.id'
    )
    .where('user.id', userId)
    .where('sub.organization_id', userSelectedOrganization)
    .countDistinct('User_Service.id as totalCount')
    .first();

  return { totalCount, ...userServiceConnection };
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
    .leftJoin(
      'ServiceInstance as service',
      'sub.service_instance_id',
      '=',
      'service.id'
    )
    .leftJoin(
      'Generic_Service_Capability as genericServCapa',
      'User_Service.generic_service_capability_id',
      '=',
      'genericServCapa.id'
    )
    .where('service.id', serviceId)
    .select([
      'User_Service.*',
      dbRaw(
        "(json_agg(json_build_object('id', \"user\".id,'last_name', \"user\".last_name, 'first_name', \"user\".first_name,  'email', \"user\".email, '__typename', 'User')) ->> 0)::json as user"
      ),
      dbRaw(
        "(json_agg(json_build_object('id', \"sub\".id,'billing', \"sub\".billing, 'status', \"sub\".status,'justification', \"sub\".justification, 'service_instance_id', \"sub\".service_instance_id, 'organization', json_build_object('id', \"org\".id,'name', \"org\".name,'__typename', 'Organization'), 'service',json_build_object('id', \"service\".id,'name', \"service\".name, 'description', \"service\".description, '__typename', 'Service'), '__typename', 'Subscription')) ->> 0)::json as subscription"
      ),
      dbRaw(
        "(json_agg(json_build_object('id', \"genericServCapa\".id, 'service_capability_name', \"genericServCapa\".service_capability_name, '__typename', 'Generic_Service_Capability'))) as generic_service_capability"
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
