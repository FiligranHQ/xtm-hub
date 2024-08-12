import {
  Service,
  Subscription,
  SubscriptionConnection,
} from '../../__generated__/resolvers-types';
import { db, dbRaw, dbUnsecure, paginate } from '../../../knexfile';
import { PortalContext } from '../../model/portal-context';
import { loadUsersByOrganization } from '../users/users.domain';
import { insertUserService } from '../user_service/user_service.domain';
import { insertCapa } from './service_capability.domain';
import { loadOrganizationBy } from '../organizations/organizations';
import { loadServiceBy } from '../services/services.domain';

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

export const addOrganizationUsersRights = async (
  context,
  organizationId: string,
  adminId: string,
  addedSuscriptionId: string
) => {
  const usersInOrga = await loadUsersByOrganization(organizationId, adminId);
  for (const user of usersInOrga) {
    const [user_service] = await insertUserService(
      context,
      user.id,
      addedSuscriptionId
    );

    await insertCapa(context, user_service.id, 'ACCESS_SERVICE');
  }
};
