import { db, paginate } from '../../../knexfile';
import {
  Service,
  ServiceConnection,
} from '../../__generated__/resolvers-types';
import { PortalContext } from '../../model/portal-context';

export const loadPublicServices = async (
  context: PortalContext,
  opts,
  publicOnly = true
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

  const servicesConnection = await query
    .select('*')
    .asConnection<ServiceConnection>();

  const queryCount = db<Service>(context, 'Service', opts);
  if (publicOnly) {
    queryCount.where('type', '!=', 'PRIVATE');
  }
  queryCount.countDistinct('id as totalCount').first();

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
