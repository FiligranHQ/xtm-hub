import { db, dbRaw, paginate } from '../../../knexfile';
import {
  Service,
  ServiceConnection,
  ServiceLink,
} from '../../__generated__/resolvers-types';
import { PortalContext } from '../../model/portal-context';
import { v4 as uuidv4 } from 'uuid';
import { ServiceLinkId } from '../../model/kanel/public/ServiceLink';
import { ServiceId } from '../../model/kanel/public/Service';
import { toGlobalId } from 'graphql-relay/node/node.js';

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
    .rightJoin(
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
    .select([
      'Service.*',
      dbRaw('(json_agg(org.*))::json as organization'),
      dbRaw('(json_agg(subscription.*))::json as subscription'),
    ])
    .groupBy(['Service.id'])
    .asConnection<ServiceConnection>();

  servicesConnection.edges.map((edge) => {
    edge.node.subscription.map((sub) => {
      sub.service_id = toGlobalId('Service', sub.service_id);
      sub.organization_id = toGlobalId('Organization', sub.organization_id);
    });
  });
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
  return db<Service>(context, 'Service')
    .where({ [field]: value })
    .select('*')
    .first();
};

export const addServiceLink = async (
  context: PortalContext,
  serviceId: ServiceId,
  url: string,
  serviceName: string
): Promise<ServiceLink> => {
  const dataServiceLink = {
    id: uuidv4() as unknown as ServiceLinkId,
    service_id: serviceId,
    url: url,
    name: serviceName,
  };

  const [serviceLink] = await db<ServiceLink>(context, 'Service_Link')
    .insert(dataServiceLink)
    .returning('*');
  return serviceLink;
};
