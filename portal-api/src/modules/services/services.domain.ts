import { db, dbRaw, dbUnsecure, paginate } from '../../../knexfile';
import {
  Service,
  ServiceConnection,
  ServiceLink,
} from '../../__generated__/resolvers-types';
import { PortalContext } from '../../model/portal-context';
import { ServiceLinkInitializer } from '../../model/kanel/public/ServiceLink';
import { ServiceMutator } from '../../model/kanel/public/Service';
import { fromGlobalId } from 'graphql-relay/node/node.js';
import Subscription, {
  SubscriptionId,
} from '../../model/kanel/public/Subscription';
import { v4 as uuidv4 } from 'uuid';
import { loadUsersByOrganization } from '../users/users.domain';
import UserService, {
  UserServiceId,
} from '../../model/kanel/public/UserService';
import { ServiceCapabilityId } from '../../model/kanel/public/ServiceCapability';
import {
  insertSubscription,
  loadSubscription,
} from '../subcription/subscription.domain';
import { insertUserService } from '../user_service/user_service.domain';
import { insertServiceCapability } from './instances/service-capabilities/service_capabilities.helper';
import User from '../../model/kanel/public/User';

export const loadCommunities = async (context: PortalContext, opts) => {
  const { first, after, orderMode, orderBy } = opts;
  const query = await paginate<Service>(context, 'Service', {
    first,
    after,
    orderMode,
    orderBy,
  })
    .leftJoin(
      'Subscription as subscription',
      'subscription.service_id',
      '=',
      'Service.id'
    )
    .where('type', '=', 'COMMUNITY')
    .select(
      'Service.*',
      dbRaw(
        "(json_agg(CASE WHEN 'subscription.id' IS NOT NULL THEN json_build_object('id', \"subscription\".id, 'status', \"subscription\".status, 'start_date', \"subscription\".start_date, 'end_date', \"subscription\".end_date, 'justification', \"subscription\".justification, '__typename', 'Subscription') ELSE NULL END) FILTER (WHERE \"subscription\".id IS NOT NULL))::json as subscription"
      )
    )
    .groupBy(['Service.id', 'subscription.id'])
    .asConnection<ServiceConnection>();

  const { totalCount } = await db<Service>(context, 'Service', opts)
    .where('type', '=', 'COMMUNITY')
    .countDistinct('Service.id as totalCount')
    .first();

  return {
    totalCount,
    ...query,
  };
};

export const loadPublicServices = async (
  context: PortalContext,
  opts,
  publicOnly = true,
  communities = false
) => {
  const { first, after, orderMode, orderBy } = opts;
  const query = paginate<Service>(context, 'Service', {
    first,
    after,
    orderMode,
    orderBy,
  });

  if (publicOnly) {
    query.where('type', '!=', 'PRIVATE');
  }
  if (communities) {
    query.where('type', '=', 'COMMUNITY');
  } else {
    query.where('type', '!=', 'COMMUNITY');
  }

  const servicesConnection = await query
    .leftJoin(
      'Subscription as subscription',
      'subscription.service_id',
      '=',
      'Service.id'
    )
    .leftJoin(
      'Organization as org',
      'subscription.organization_id',
      '=',
      'org.id'
    )
    .leftJoin('Service_Link as link', 'Service.id', '=', 'link.service_id')
    .select([
      'Service.*',
      dbRaw('((subscription.status)) as status'),
      dbRaw('(json_agg(org.*))::json as organization'),
      dbRaw(
        "(json_agg(json_build_object('id', \"subscription\".id, 'status', \"subscription\".status, 'start_date', \"subscription\".start_date, 'end_date', \"subscription\".end_date, 'organization', json_build_object('id', \"org\".id,'name', \"org\".name,'__typename', 'Organization'),'__typename', 'Subscription')))::json as subscription"
      ),

      dbRaw('row_to_json(link.*) as links'),
    ])
    .groupBy(['Service.id', 'link.*', 'subscription.status'])
    .asConnection<ServiceConnection>();

  const queryCount = db<Service>(context, 'Service', opts);
  if (publicOnly) {
    queryCount.where('type', '!=', 'PRIVATE');
  }
  if (communities) {
    queryCount.where('type', '=', 'COMMUNITY');
  } else {
    query.where('type', '!=', 'COMMUNITY');
  }
  queryCount.countDistinct('Service.id as totalCount').first();

  const { totalCount } = await queryCount;

  return {
    totalCount,
    ...servicesConnection,
  };
};

export const loadServiceBy = async (
  context: PortalContext,
  field: string,
  value: string
): Promise<Service> => {
  const service = await db<Service>(context, 'Service')
    .where({ [field]: value })
    .select('*')
    .first();
  return service;
};

export const loadUnsecureServiceBy = async (field: ServiceMutator) => {
  return dbUnsecure<Service>('Service').where(field);
};

export const addServiceLink = async (
  context: PortalContext,
  dataServiceLink: ServiceLinkInitializer
): Promise<ServiceLink> => {
  const [serviceLink] = await db<ServiceLink>(context, 'Service_Link')
    .insert(dataServiceLink)
    .returning('*');
  return serviceLink;
};

export const insertService = async (context: PortalContext, dataService) => {
  return db<Service>(context, 'Service').insert(dataService).returning('*');
};

export const adminCreateCommu = async (
  context: PortalContext,
  organizationsId: string[],
  addedService: Service,
  adminId: string
) => {
  const subsData = organizationsId.map((orga_id) => ({
    id: uuidv4() as unknown as SubscriptionId,
    organization_id: fromGlobalId(orga_id).id,
    service_id: addedService.id,
    start_date: new Date(),
    end_date: null,
    billing: 0,
    status: 'ACCEPTED',
  }));
  const addedSubscriptions = await insertSubscription(context, subsData);

  for (const addedSubscription of addedSubscriptions) {
    const users = (await loadUsersByOrganization(
      addedSubscription.organization_id,
      adminId
    )) as User[];
    await grantServiceAccess(
      context,
      ['ACCESS_SERVICE'],
      users.map(({ id }) => id),
      addedSubscription.id
    );
  }

  await grantServiceAdminAccess(context, adminId, addedService);
};

export const grantServiceAdminAccess = async (
  context: PortalContext,
  adminId: string,
  addedService: Service
) => {
  const [subscriptionOfAdmin] = await loadSubscription(
    adminId,
    addedService.id
  );
  await db<Subscription>(context, 'Subscription')
    .where({ id: subscriptionOfAdmin.id })
    .update({ billing: 100 })
    .returning('*');
  const dataUserService = {
    id: uuidv4() as UserServiceId,
    user_id: adminId,
    subscription_id: subscriptionOfAdmin.id,
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

export const grantServiceAccess = async (
  context: PortalContext,
  capabilities: string[],
  usersId: string[],
  subscriptionId: string
) => {
  const dataUserServices = usersId.map((userId) => ({
    id: uuidv4() as UserServiceId,
    user_id: userId,
    subscription_id: subscriptionId,
  }));

  const insertedUserServices = (await insertUserService(
    context,
    dataUserServices
  )) as UserService[];

  for (const insertedUserService of insertedUserServices) {
    const dataServiceCapabilities = capabilities.map((capability) => ({
      id: uuidv4() as ServiceCapabilityId,
      user_service_id: insertedUserService.id,
      service_capability_name: capability,
    }));

    await insertServiceCapability(context, dataServiceCapabilities);
  }

  for (const capability of capabilities) {
    const dataServiceCapabilities = insertedUserServices.map(
      (insertedUserService) => ({
        id: uuidv4() as ServiceCapabilityId,
        user_service_id: insertedUserService.id,
        service_capability_name: capability,
      })
    );
    await insertServiceCapability(context, dataServiceCapabilities);
  }
};
