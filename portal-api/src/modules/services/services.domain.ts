import config from 'config';
import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { db, dbRaw, dbUnsecure, paginate } from '../../../knexfile';
import {
  ServiceConnection,
  ServiceInstance,
} from '../../__generated__/resolvers-types';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { ServiceCapabilityId } from '../../model/kanel/public/ServiceCapability';
import { ServiceInstanceMutator } from '../../model/kanel/public/ServiceInstance';
import Subscription, {
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import User, { UserMutator } from '../../model/kanel/public/User';
import UserService, {
  UserServiceId,
} from '../../model/kanel/public/UserService';
import { PortalContext } from '../../model/portal-context';
import { CAPABILITY_BYPASS, ROLE_ADMIN_ORGA } from '../../portal.const';
import { sendMail } from '../../server/mail-service';
import { formatRawObject } from '../../utils/queryRaw.util';
import { loadSubscriptionBy } from '../subcription/subscription.helper';
import { insertUserService } from '../user_service/user_service.domain';
import { loadUserBy, loadUsersByOrganization } from '../users/users.domain';
import { insertServiceCapability } from './instances/service-capabilities/service_capabilities.helper';

export const loadPublicServiceInstances = async (
  context: PortalContext,
  opts
) => {
  const { first, after, orderMode, orderBy } = opts;
  const query = paginate<ServiceInstance>(context, 'ServiceInstance', {
    first,
    after,
    orderMode,
    orderBy,
  }).where('public', '=', true);
  const organizationId = context.user.selected_organization_id;
  const userId = context.user.id;
  const servicesConnection = await query
    .leftJoin('Subscription as subscription', function () {
      this.on(
        'subscription.service_instance_id',
        '=',
        'ServiceInstance.id'
      ).andOnVal('subscription.organization_id', '=', organizationId);
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
    .leftJoin(
      'Service_Link as serviceLinks',
      'serviceLinks.service_instance_id',
      '=',
      'ServiceInstance.id'
    )
    .select([
      'ServiceInstance.*',
      dbRaw(`
        CASE
          WHEN "subscription"."id" IS NOT NULL THEN true
          ELSE false
        END AS subscribed
        `),
      dbRaw(
        'COALESCE(json_agg("serviceCapability"."service_capability_name") FILTER (WHERE "serviceCapability"."service_capability_name" IS NOT NULL), \'[]\'::json) AS capabilities'
      ),
      dbRaw('COALESCE(json_agg("serviceLinks"), \'[]\'::json) AS links'),
    ])
    .whereRaw(`"subscription"."id" IS NULL`)
    .groupBy(['ServiceInstance.id', 'subscription.id'])
    .asConnection<ServiceConnection>();

  const { totalCount } = await db<ServiceInstance>(
    context,
    'ServiceInstance',
    opts
  )
    .leftJoin('Subscription as subscription', function () {
      this.on(
        'subscription.service_instance_id',
        '=',
        'ServiceInstance.id'
      ).andOnVal('subscription.organization_id', '=', organizationId);
    })
    .whereRaw(`"subscription"."id" IS NULL`)
    .countDistinct('ServiceInstance.id as totalCount')
    .first();

  return {
    totalCount,
    ...servicesConnection,
  };
};

export const loadServiceInstances = async (context: PortalContext, opts) => {
  const { first, after, orderMode, orderBy } = opts;
  const query = paginate<ServiceInstance>(context, 'ServiceInstance', {
    first,
    after,
    orderMode,
    orderBy,
  });
  const organizationId = context.user.selected_organization_id;
  const userId = context.user.id;
  const servicesConnection = await query
    .leftJoin('Subscription as subscription', function () {
      this.on(
        'subscription.service_instance_id',
        '=',
        'ServiceInstance.id'
      ).andOnVal('subscription.organization_id', '=', organizationId);
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
      'ServiceInstance.*',
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
    .groupBy(['ServiceInstance.id', 'subscription.id'])
    .asConnection<ServiceConnection>();

  const { totalCount } = await db<ServiceInstance>(
    context,
    'ServiceInstance',
    opts
  )
    .leftJoin('Subscription as subscription', function () {
      this.on(
        'subscription.service_instance_id',
        '=',
        'ServiceInstance.id'
      ).andOnVal('subscription.organization_id', '=', organizationId);
    })
    .countDistinct('ServiceInstance.id as totalCount')
    .first();

  return {
    totalCount,
    ...servicesConnection,
  };
};
export const loadServiceInstanceByIdWithCapabilities = async (
  context: PortalContext,
  service_instance_id: string
): Promise<ServiceInstance> => {
  return db<ServiceInstance>(context, 'ServiceInstance')
    .leftJoin(
      'Subscription',
      'ServiceInstance.id',
      'Subscription.service_instance_id'
    )
    .leftJoin('User_Service', 'Subscription.id', 'User_Service.subscription_id')
    .leftJoin(
      'Service_Capability',
      'User_Service.id',
      '=',
      'Service_Capability.user_service_id'
    )
    .select(
      'ServiceInstance.*',
      dbRaw(
        `CASE
             WHEN COUNT("Service_Capability".id) = 0 THEN ARRAY[]::text[]
             ELSE array_agg("Service_Capability".service_capability_name)::text[]
          END AS capabilities`
      )
    )

    .where({
      'ServiceInstance.id': service_instance_id,
      'User_Service.user_id': context.user.id,
    })
    .groupBy(['ServiceInstance.id', 'User_Service.id'])
    .first();
};

export const loadServiceBy = async (
  context: PortalContext,
  field: string,
  value: string
): Promise<ServiceInstance> => {
  return db<ServiceInstance>(context, 'ServiceInstance')
    .where({ [field]: value })
    .select('*')
    .first();
};

export const loadUnsecureServiceBy = async (field: ServiceInstanceMutator) => {
  return dbUnsecure<ServiceInstance>('ServiceInstance').where(field);
};

export const loadServiceWithSubscriptions = async (
  context: PortalContext,
  service_instance_id
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

  const querySubscriptions = db<Subscription>(context, 'Subscription')
    .where('Subscription.service_instance_id', '=', service_instance_id)
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
      dbRaw('"Subscription".*'),
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
    .groupBy(['Subscription.id', 'Subscription.organization_id', 'org.id'])
    .orderByRaw(
      `CASE WHEN org.id = '${context.user.selected_organization_id}' THEN 0 ELSE 1 END, "Subscription".id`
    );

  const [serviceInstance] = await db<ServiceInstance>(
    context,
    'ServiceInstance'
  ).where('ServiceInstance.id', '=', service_instance_id);

  if (!context.user.capabilities.some((c) => c.id === CAPABILITY_BYPASS.id)) {
    querySubscriptions.where(
      'Subscription.organization_id',
      '=',
      context.user.selected_organization_id
    );
  }

  const subscriptions = await querySubscriptions;

  return { ...serviceInstance, subscriptions };
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

  const [subscription] = await loadSubscriptionBy({
    'Subscription.id': subscriptionId,
  } as SubscriptionMutator);
  for (const userId of usersId) {
    const user = await loadUserBy({ 'User.id': userId } as UserMutator);

    const serviceInstance = await loadServiceBy(
      context,
      'id',
      subscription.service_instance_id
    );
    await sendMail({
      to: user.email,
      template: 'partnerVault',
      params: {
        name: user.email,
        partnerVaultLink: `${config.get('base_url_front')}/service/vault/${toGlobalId('ServiceInstance', serviceInstance.id)}`,
        partnerVault: serviceInstance.name,
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
