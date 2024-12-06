import config from 'config';
import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { db, dbRaw, dbUnsecure, paginate } from '../../../knexfile';
import {
  Service,
  ServiceConnection,
} from '../../__generated__/resolvers-types';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { ServiceMutator } from '../../model/kanel/public/Service';
import { ServiceCapabilityId } from '../../model/kanel/public/ServiceCapability';
import Subscription from '../../model/kanel/public/Subscription';
import User, { UserId, UserMutator } from '../../model/kanel/public/User';
import UserService, {
  UserServiceId,
} from '../../model/kanel/public/UserService';
import { PortalContext } from '../../model/portal-context';
import { ROLE_ADMIN_ORGA } from '../../portal.const';
import { sendMail } from '../../server/mail-service';
import { formatRawObject } from '../../utils/queryRaw.util';
import { loadSubscription } from '../subcription/subscription.domain';
import { loadSubscriptionBy } from '../subcription/subscription.helper';
import {
  addAdminAccess,
  insertUserService,
} from '../user_service/user_service.domain';
import { loadUserBy, loadUsersByOrganization } from '../users/users.domain';
import { insertServiceCapability } from './instances/service-capabilities/service_capabilities.helper';

export const loadPublicServices = async (context: PortalContext, opts) => {
  const { first, after, orderMode, orderBy } = opts;
  const query = paginate<Service>(context, 'Service', {
    first,
    after,
    orderMode,
    orderBy,
  }).where('public', '=', true);
  const organizationId = context.user.selected_organization_id;
  const userId = context.user.id;
  const servicesConnection = await query
    .leftJoin('Subscription as subscription', function () {
      this.on('subscription.service_id', '=', 'Service.id').andOnVal(
        'subscription.organization_id',
        '=',
        organizationId
      );
    })
    .leftJoin('User_Service as userService', function () {
      this.on('userService.subscription_id', '=', 'subscription.id').andOnVal(
        'userService.user_id',
        '=',
        userId
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
      this.on('subscription.service_id', '=', 'Service.id').andOnVal(
        'subscription.organization_id',
        '=',
        organizationId
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

export const loadServices = async (context: PortalContext, opts) => {
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
      this.on('subscription.service_id', '=', 'Service.id').andOnVal(
        'subscription.organization_id',
        '=',
        organizationId
      );
    })
    .leftJoin('User_Service as userService', function () {
      this.on('userService.subscription_id', '=', 'subscription.id').andOnVal(
        'userService.user_id',
        '=',
        userId
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
    .groupBy(['Service.id', 'subscription.id'])
    .asConnection<ServiceConnection>();

  const { totalCount } = await db<Service>(context, 'Service', opts)
    .leftJoin('Subscription as subscription', function () {
      this.on('subscription.service_id', '=', 'Service.id').andOnVal(
        'subscription.organization_id',
        '=',
        organizationId
      );
    })
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

export const loadServiceWithSubscriptions = async (
  context: PortalContext,
  service_id
) => {
  const queryUserServiceWithCapa = db<UserService>(context, 'User_Service')
    .leftJoin(
      'Service_Capability',
      'User_Service.id',
      '=',
      'Service_Capability.user_service_id'
    )
    .select(
      'User_Service.*',
      dbRaw(
        `CASE WHEN COUNT("Service_Capability".id) = 0 THEN NULL ELSE (json_agg(json_build_object('id', "Service_Capability".id, 'service_capability_name', "Service_Capability".service_capability_name)))::json END AS service_capabilities`
      )
    )
    .groupBy(['User_Service.id']);

  const querySubscriptions = await db<Subscription>(context, 'Subscription')
    .where('Subscription.service_id', '=', service_id)
    .leftJoin(
      queryUserServiceWithCapa.as('userService'),
      'userService.subscription_id',
      '=',
      'Subscription.id'
    )
    .leftJoin('User as user', 'user.id', '=', 'userService.user_id')
    .leftJoin(
      'Organization as org',
      'org.id',
      '=',
      'Subscription.organization_id'
    )
    .select(
      dbRaw('DISTINCT ON ("Subscription".id) "Subscription".*'),
      dbRaw(
        formatRawObject({
          columnName: 'org',
          typename: 'Organization',
          as: 'organization',
        })
      ),
      dbRaw(
        `COALESCE( CASE WHEN COUNT("userService".id) = 0 THEN '[]'::json ELSE json_agg( json_build_object( 'id', "userService".id, 'service_capability', "userService".service_capabilities, 'user', CASE WHEN "user".id IS NOT NULL THEN json_build_object( 'id', "user".id, 'email', "user".email, 'first_name', "user".first_name, 'last_name', "user".last_name, '__typename', 'User' ) ELSE NULL END, '__typename', 'User_Service' ) )::json END, '[]'::json ) AS user_service`
      )
    )
    .groupBy(['Subscription.id', 'org.*']);

  const [service] = await db<Service>(context, 'Service').where(
    'Service.id',
    '=',
    service_id
  );

  return { ...service, subscriptions: querySubscriptions };
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
    adminId,
    ROLE_ADMIN_ORGA.id
  )) as User[];

  return usersInOrga.length > 0
    ? await grantServiceAccess(
        context,
        ['ACCESS_SERVICE', 'MANAGE_ACCESS'],
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

  const [subscription] = await loadSubscriptionBy('id', subscriptionId);
  for (const userId of usersId) {
    const user = await loadUserBy({ 'User.id': userId } as UserMutator);

    const service = await loadServiceBy(context, 'id', subscription.service_id);
    await sendMail({
      to: user.email,
      template: 'partnerVault',
      params: {
        name: user.email,
        partnerVaultLink: `${config.get('base_url_front')}/service/vault/${toGlobalId('Service', service.id)}`,
        partnerVault: service.name,
      },
    });
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
  return insertedUserServices;
};
