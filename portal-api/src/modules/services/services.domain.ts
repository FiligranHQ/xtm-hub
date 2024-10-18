import { db, dbRaw, dbUnsecure, paginate } from '../../../knexfile';
import {
  Service,
  ServiceConnection,
  ServiceLink,
} from '../../__generated__/resolvers-types';
import { PortalContext } from '../../model/portal-context';
import { ServiceLinkInitializer } from '../../model/kanel/public/ServiceLink';
import { ServiceId, ServiceMutator } from '../../model/kanel/public/Service';
import Subscription from '../../model/kanel/public/Subscription';
import { v4 as uuidv4 } from 'uuid';
import { loadUsersByOrganization } from '../users/users.domain';
import UserService, {
  UserServiceId,
} from '../../model/kanel/public/UserService';
import { ServiceCapabilityId } from '../../model/kanel/public/ServiceCapability';
import {
  addSubscriptions,
  loadSubscription,
} from '../subcription/subscription.domain';
import {
  addAdminAccess,
  insertUserService,
  loadUnsecureUserServiceBy,
} from '../user_service/user_service.domain';
import { insertServiceCapability } from './instances/service-capabilities/service_capabilities.helper';
import User, { UserId } from '../../model/kanel/public/User';
import { loadUnsecureSubscriptionBy } from '../subcription/subscription.helper';
import { OrganizationId } from '../../model/kanel/public/Organization';

export const loadCommunities = async (context: PortalContext, opts) => {
  const { first, after, orderMode, orderBy } = opts;
  const query = await paginate<Service>(context, 'Service', {
    first,
    after,
    orderMode,
    orderBy,
  })
    .rightJoin(
      'Subscription as subscription',
      'subscription.service_id',
      '=',
      'Service.id'
    )
    .leftJoin(
      'Organization as org',
      'org.id',
      '=',
      'subscription.organization_id'
    )
    .where('type', '=', 'COMMUNITY')
    .select(
      'Service.*',
      dbRaw(
        "(json_agg(CASE WHEN 'subscription.id' IS NOT NULL THEN json_build_object('id', \"subscription\".id, 'status', \"subscription\".status, 'start_date', \"subscription\".start_date, 'end_date', \"subscription\".end_date,'organization', json_build_object('id',\"org\".id, 'name', \"org\".name), 'justification', \"subscription\".justification, '__typename', 'Subscription') ELSE NULL END) FILTER (WHERE \"subscription\".id IS NOT NULL))::json as subscription"
      )
    )
    .groupBy(['Service.id'])
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

export const loadPublicServices = async (context: PortalContext, opts) => {
  const { first, after, orderMode, orderBy } = opts;
  const query = paginate<Service>(context, 'Service', {
    first,
    after,
    orderMode,
    orderBy,
  });
  const organizationId = context.user.organization_id;
  const userId = context.user.id;
  const servicesConnection = await query
    .leftJoin('Subscription as subscription', function () {
      this.on('subscription.service_id', '=', 'Service.id').andOn(
        'subscription.organization_id',
        '=',
        dbRaw('?', [organizationId])
      );
    })
    .leftJoin('User_Service as userService', function () {
      this.on('userService.subscription_id', '=', 'subscription.id').andOn(
        'userService.user_id',
        '=',
        dbRaw('?', [userId])
      );
    })
    .leftJoin(
      'Service_Capability as serviceCapability',
      'serviceCapability.user_service_id',
      '=',
      'userService.id'
    )
    .select([
      'Service.*',
      dbRaw(`
        CASE
          WHEN "subscription"."id" IS NOT NULL THEN true
          ELSE false
        END AS subscribed
        `),
      dbRaw(`
      COALESCE(json_agg("serviceCapability"."service_capability_name") FILTER (WHERE "serviceCapability"."service_capability_name" IS NOT NULL), '[]'::json) AS capabilities
    `),
    ])
    .whereRaw(
      `
    (
      "Service"."type" != 'COMMUNITY' OR 
      ("Service"."type" = 'COMMUNITY' AND "subscription"."status" = 'ACCEPTED')
      
    )
  `
    )
    .whereRaw(`"subscription"."id" IS NULL`)
    .groupBy(['Service.id', 'subscription.id'])
    .asConnection<ServiceConnection>();

  const { totalCount } = await db<Service>(context, 'Service', opts)
    .leftJoin('Subscription as subscription', function () {
      this.on('subscription.service_id', '=', 'Service.id').andOn(
        'subscription.organization_id',
        '=',
        dbRaw('?', [organizationId])
      );
    })
    .whereRaw(
      `
    (
      "Service"."type" != 'COMMUNITY' OR 
      ("Service"."type" = 'COMMUNITY' AND "subscription"."status" = 'ACCEPTED')
    )
  `
    )
    .countDistinct('Service.id as totalCount')
    .first();

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

export const orgaCreateCommu = async (
  context,
  organizationsId: string[],
  addedServiceId: ServiceId,
  justification: string
) => {
  await addSubscriptions(
    context,
    addedServiceId,
    organizationsId,
    'REQUESTED',
    justification
  );
};

export const adminCreateCommu = async (
  context: PortalContext,
  organizationsId: string[],
  addedServiceId: ServiceId,
  adminId: string
) => {
  const addedSubscriptions = await addSubscriptions(
    context,
    addedServiceId,
    organizationsId,
    'ACCEPTED'
  );

  for (const addedSubscription of addedSubscriptions) {
    await grantServiceAccessUsers(
      context,
      addedSubscription.organization_id as OrganizationId,
      adminId,
      addedSubscription.id
    );
  }
};

export const grantServiceAdminAccess = async (
  context: PortalContext,
  adminId: string,
  addedServiceId: string
) => {
  const [subscriptionOfAdmin] = await loadSubscription(adminId, addedServiceId);
  await db<Subscription>(context, 'Subscription')
    .where({ id: subscriptionOfAdmin.id })
    .update({ billing: 100 })
    .returning('*');

  await addAdminAccess(context, adminId as UserId, subscriptionOfAdmin.id);
};

export const grantServiceAccessUsers = async (
  context: PortalContext,
  organizationId: OrganizationId,
  adminId: string,
  subscriptionId: string
): Promise<UserService[]> => {
  const usersInOrga = (await loadUsersByOrganization(
    organizationId,
    adminId
  )) as User[];

  return usersInOrga.length > 0
    ? await grantServiceAccess(
        context,
        ['ACCESS_SERVICE'],
        usersInOrga.map(({ id }) => id),
        subscriptionId
      )
    : [];
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
  )) as [UserService];

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
  return insertedUserServices;
};

export const findCurrentCommuAdminId = async (serviceId: ServiceId) => {
  const existingSubscriptions = await loadUnsecureSubscriptionBy({
    service_id: serviceId,
  });
  // Only one subscription exists, we know it is the admin's
  const adminsSubscription = existingSubscriptions[0];
  const userServiceAdmin = await loadUnsecureUserServiceBy({
    subscription_id: adminsSubscription.id,
  });
  return {
    adminCommuId: userServiceAdmin[0].user_id,
    adminsSubscription: adminsSubscription,
  };
};
