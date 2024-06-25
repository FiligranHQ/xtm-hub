import {
  Service,
  Subscription,
  SubscriptionConnection,
} from '../../__generated__/resolvers-types';
import { db, dbRaw, dbUnsecure, paginate } from '../../../knexfile';
import { PortalContext } from '../../model/portal-context';

export const loadSubscriptions = async (context: PortalContext, opts) => {
  console.log('LOADSUBXSCRIPTION');
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
    .groupBy(['Subscription.id'])
    .asConnection<SubscriptionConnection>();
  console.log('subscriptionConnection', subscriptionConnection.edges);
  const { totalCount } = await db<Service>(context, 'Subscription', opts)
    .countDistinct('id as totalCount')
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
