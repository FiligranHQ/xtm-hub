import { v4 as uuidv4 } from 'uuid';
import { db, dbRaw, dbUnsecure, paginate } from '../../../knexfile';
import {
  Service,
  ServiceConnection,
  ServiceLink,
} from '../../__generated__/resolvers-types';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { ServiceMutator } from '../../model/kanel/public/Service';
import { ServiceCapabilityId } from '../../model/kanel/public/ServiceCapability';
import { ServiceLinkInitializer } from '../../model/kanel/public/ServiceLink';
import Subscription from '../../model/kanel/public/Subscription';
import User, { UserId } from '../../model/kanel/public/User';
import UserService, {
  UserServiceId,
} from '../../model/kanel/public/UserService';
import { PortalContext } from '../../model/portal-context';
import { loadSubscription } from '../subcription/subscription.domain';
import {
  addAdminAccess,
  insertUserService,
} from '../user_service/user_service.domain';
import { loadUsersByOrganization } from '../users/users.domain';
import { insertServiceCapability } from './instances/service-capabilities/service_capabilities.helper';

export const loadPublicServices = async (context: PortalContext, opts) => {
  const { first, after, orderMode, orderBy } = opts;
  const query = paginate<Service>(context, 'Service', {
    first,
    after,
    orderMode,
    orderBy,
  });
  const organizationId = context.user.selected_organization_id;
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
    .whereRaw(`"subscription"."id" IS NULL`)
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
  return db<Service>(context, 'Service')
    .where({ [field]: value })
    .select('*')
    .first();
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
