import {
  Service,
  Subscription,
  SubscriptionConnection,
} from '../../__generated__/resolvers-types';
import { db, dbRaw, dbUnsecure, paginate } from '../../../knexfile';
import { PortalContext } from '../../model/portal-context';
import { v4 as uuidv4 } from 'uuid';
import ServiceCapability, {
  ServiceCapabilityId,
} from '../../model/kanel/public/ServiceCapability';
import { UserServiceId } from '../../model/kanel/public/UserService';

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

export const loadSubscriptionsByOrganization = async (
  context: PortalContext,
  opts,
  organization_id
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
    .select([
      'Subscription.*',
      dbRaw('(json_agg(org.*) ->> 0)::json as organization'),
      dbRaw('(json_agg(serv.*) ->> 0)::json as service'),
    ])
    .where('organization_id', organization_id)
    .groupBy(['Subscription.id'])
    .asConnection<SubscriptionConnection>();
  const { totalCount } = await db<Service>(context, 'Subscription', opts)
    .countDistinct('id as totalCount')
    .where('organization_id', organization_id)
    .first();

  return {
    totalCount,
    ...subscriptionConnection,
  };
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

export const insertCapa = async (
  context: PortalContext,
  userServiceId: string,
  serviceCapabilityName: string
) => {
  const serviceCapaData = {
    id: uuidv4() as ServiceCapabilityId,
    user_service_id: userServiceId as UserServiceId,
    service_capability_name: serviceCapabilityName,
  };
  const [addedServiceCapa] = await db<ServiceCapability>(
    context,
    'Service_Capability'
  )
    .insert(serviceCapaData)
    .returning('*');
  return addedServiceCapa;
};
