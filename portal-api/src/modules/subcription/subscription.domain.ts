import {
  Service,
  Subscription,
  SubscriptionConnection,
} from '../../__generated__/resolvers-types';
import { db, dbRaw, dbUnsecure, paginate } from '../../../knexfile';
import { PortalContext } from '../../model/portal-context';
import { loadOrganizationBy } from '../organizations/organizations.helper';
import { loadServiceBy } from '../services/services.domain';
import User from '../../model/kanel/public/User';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { v4 as uuidv4 } from 'uuid';
import { fromGlobalId } from 'graphql-relay/node/node.js';
import { loadUserBy } from '../users/users.domain';
import { loadUnsecureServiceCapabilitiesBy } from '../services/instances/service-capabilities/service_capabilities.helper';
import UserService from '../../model/kanel/public/UserService';
import { ServiceId } from '../../model/kanel/public/Service';
import { loadSubscriptionBy } from './subscription.helper';

export const loadSubscriptions = async (context: PortalContext, opts) => {
  const { first, after, orderMode, orderBy } = opts;
  const subscriptionConnection = await paginate<Subscription>(
    context,
    'Subscription',
    {
      first,
      after,
      orderMode,
      orderBy,
    }
  )
    .leftJoin(
      'Organization as org',
      'Subscription.organization_id',
      '=',
      'org.id'
    )
    .leftJoin('Service as serv', 'Subscription.service_id', '=', 'serv.id')

    .select([
      'Subscription.*',
      dbRaw('(json_agg(org.*) ->> 0)::json as organization'),
      dbRaw('(json_agg(serv.*) ->> 0)::json as service'),
      dbRaw('(org."name") as organization_name'),
      dbRaw('(serv."name") as service_name'),
    ])
    .groupBy(['Subscription.id', 'org.name', 'serv.name'])
    .asConnection<SubscriptionConnection>();
  const { totalCount } = await db<Service>(context, 'Subscription', opts)
    .countDistinct('id as totalCount')
    .first();

  return {
    totalCount,
    ...subscriptionConnection,
  };
};

export const loadSubscription = (userId, serviceId) => {
  return dbUnsecure<User>('User')
    .leftJoin(
      'Subscription as sub',
      'sub.organization_id',
      '=',
      'User.organization_id'
    )
    .where('User.id', userId)
    .where('sub.service_id', serviceId)
    .select('sub.id');
};

export const loadSubscriptionsByService = async (
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
  return db<Subscription>(context, 'Subscription')
    .where('Subscription.service_id', '=', service_id)
    .leftJoin(
      queryUserServiceWithCapa.as('userService'),
      'userService.subscription_id',
      '=',
      'Subscription.id'
    )
    .leftJoin('User as user', 'user.id', '=', 'userService.user_id')
    .leftJoin('Organization as org', 'org.id', '=', 'user.organization_id')
    .select(
      'Subscription.*',
      dbRaw(
        `CASE WHEN COUNT (\"userService\".id) = 0 THEN NULL ELSE (json_agg(json_build_object('id', \"userService\".id,'service_capability',\"userService\".service_capabilities ,'user', json_build_object('id', \"user\".id, 'email', \"user\".email, 'first_name', \"user\".first_name, 'last_name', \"user\".last_name, 'organization', json_build_object('id', \"org\".id, 'name', \"org\".name, '__typename', 'Organization'), '__typename', 'User'), '__typename', 'User_Service'))::json) END AS user_service`
      )
    )
    .groupBy(['Subscription.id'])
    .orderBy('Subscription.billing', 'desc');
};

export const loadSubscriptionsByOrganization = async (
  context: PortalContext,
  opts
) => {
  const { first, after, orderMode, orderBy } = opts;
  const subscriptionConnection = await paginate<Subscription>(
    context,
    'Subscription',
    {
      first,
      after,
      orderMode,
      orderBy,
    }
  )
    .leftJoin(
      'Organization as org',
      'Subscription.organization_id',
      '=',
      'org.id'
    )
    .leftJoin('Service as serv', 'Subscription.service_id', '=', 'serv.id')
    .leftJoin('Service_Link as link', 'serv.id', '=', 'link.service_id')
    .leftJoin(
      'User_Service as user_service',
      'Subscription.id',
      '=',
      'user_service.subscription_id'
    )
    .leftJoin(
      'Service_Capability as service_capa',
      'user_service.id',
      '=',
      'service_capa.user_service_id'
    )
    .select([
      'Subscription.*',
      dbRaw('(json_agg(org.*) ->> 0)::json as organization'),
      dbRaw('(json_agg(serv.*) ->> 0)::json as service'),
      dbRaw('(serv."name") as service_name'),
      dbRaw('(serv."provider") as service_provider'),
      dbRaw('(serv."type") as service_type'),
      dbRaw('(serv."description") as service_description'),
      dbRaw('(link."url") as service_url'),
    ])
    .where('organization_id', context.user.organization_id)
    .where('serv.type', '=', 'COMMUNITY')
    .where('service_capa.service_capability_name', '=', 'MANAGE_ACCESS')
    .groupBy([
      'Subscription.id',
      'serv.name',
      'serv.provider',
      'serv.type',
      'serv.description',
      'link.url',
    ])
    .asConnection<SubscriptionConnection>();

  const { totalCount } = await db<Service>(context, 'Subscription', opts)
    .countDistinct('id as totalCount')
    .where('organization_id', context.user.organization_id)
    .first();

  return {
    totalCount,
    ...subscriptionConnection,
  };
};

export const fillSubscription = async (
  context: PortalContext,
  updatedSubscription: Subscription
): Promise<Subscription> => {
  updatedSubscription.organization = await loadOrganizationBy(
    context,
    'id',
    updatedSubscription.organization_id
  );

  updatedSubscription.service = await loadServiceBy(
    context,
    'id',
    updatedSubscription.service_id
  );
  return updatedSubscription;
};
export const checkSubscriptionExists = async (
  organization_id: string,
  service_id: string
): Promise<Subscription | boolean> => {
  const subscriptionQuery = dbUnsecure<Subscription>('Subscription')
    .where('organization_id', organization_id)
    .where('service_id', service_id)
    .select('*')
    .first();
  const sub = await subscriptionQuery;
  return sub ?? false;
};

export const insertSubscription = async (
  context: PortalContext,
  dataSubscription
) => {
  return db<Subscription>(context, 'Subscription')
    .insert(dataSubscription)
    .returning('*');
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

export const fillUserServiceData = async (
  userServices: [UserService],
  service_id: ServiceId
) => {
  const userServicesData = [];
  for (const userService of userServices) {
    const user = await loadUserBy('User.id', userService.user_id);
    const [subscription] = await loadSubscriptionBy(
      'Subscription.id',
      userService.subscription_id
    );
    const serviceCapa = await loadUnsecureServiceCapabilitiesBy({
      user_service_id: userService.id,
    });
    const userServiceData = {
      id: userService.id,
      subscription: {
        billing: subscription.billing,
        id: subscription.id,
        organization: {
          id: user.organization.id,
          name: user.organization.name,
        },
        service: {
          id: service_id,
          name: '',
        },
      },
      user: {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        id: user.id,
      },
      service_capability: serviceCapa,
    };
    userServicesData.push(userServiceData);
  }
  return userServicesData;
};