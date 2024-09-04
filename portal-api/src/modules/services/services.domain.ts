import { db, dbRaw, dbUnsecure, paginate } from '../../../knexfile';
import {
  Service,
  ServiceConnection,
  ServiceLink,
} from '../../__generated__/resolvers-types';
import { PortalContext } from '../../model/portal-context';
import { ServiceLinkInitializer } from '../../model/kanel/public/ServiceLink';
import { ServiceId, ServiceMutator } from '../../model/kanel/public/Service';
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
import {
  insertUserService,
  loadUnsecureUserServiceBy,
} from '../user_service/user_service.domain';
import { insertServiceCapability } from './instances/service-capabilities/service_capabilities.helper';
import User from '../../model/kanel/public/User';
import { loadUnsecureSubscriptionBy } from '../subcription/subscription.helper';

export const loadCommunities = async (context: PortalContext, opts) => {
  const { first, after, orderMode, orderBy } = opts;
  const query = await paginate<Service>(context, 'Service', {
    first,
    after,
    orderMode,
    orderBy,
  })
    .where('type', '=', 'COMMUNITY')
    .select('Service.*')
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
  const servicesConnection = await query
    .leftJoin('Subscription as subscription', function () {
      this.on('subscription.service_id', '=', 'Service.id').andOn(
        'subscription.organization_id',
        '=',
        dbRaw('?', [organizationId])
      );
    })
    .select([
      'Service.*',
      dbRaw(`
      CASE
        WHEN "subscription"."id" IS NOT NULL THEN true
        ELSE false
      END AS subscribed
    `),
    ])
    .groupBy(['Service.id', 'subscription.id'])
    .asConnection<ServiceConnection>();

  const { totalCount } = await db<Service>(context, 'Service', opts)
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
};

export const addSubscriptions = async (
  context: PortalContext,
  addedServiceId: string,
  organizationsId: string[],
  status: string,
  justification: string = ''
) => {
  const subsData = organizationsId.map((orga_id) => ({
    id: uuidv4() as unknown as SubscriptionId,
    organization_id: fromGlobalId(orga_id).id,
    service_id: addedServiceId,
    start_date: new Date(),
    end_date: null,
    billing: 0,
    status: status,
    justification,
  }));
  return insertSubscription(context, subsData);
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
