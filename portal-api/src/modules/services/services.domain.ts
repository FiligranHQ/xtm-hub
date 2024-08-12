import { db, dbRaw, paginate } from '../../../knexfile';
import {
  Service,
  ServiceConnection,
  ServiceLink,
} from '../../__generated__/resolvers-types';
import { PortalContext } from '../../model/portal-context';
import { ServiceLinkInitializer } from '../../model/kanel/public/ServiceLink';

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
      dbRaw('(json_agg(subscription.*))::json as subscription'),

      dbRaw('row_to_json(link.*) as link'),
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
  const [service] = db<Service>(context, 'Service')
    .where({ [field]: value })
    .select('*')
    .first();
  return service;
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
