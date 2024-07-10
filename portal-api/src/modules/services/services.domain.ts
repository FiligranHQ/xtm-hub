import { db, paginate } from '../../../knexfile';
import {
  Service,
  ServiceConnection,
} from '../../__generated__/resolvers-types';
import { PortalContext } from '../../model/portal-context';

export const loadServices = async (context: PortalContext, opts) => {
  const { first, after, orderMode, orderBy } = opts;
  const servicesConnection = await paginate<Service>(context, 'Service', {
    first,
    after,
    orderMode,
    orderBy,
  })
    .select('*')
    .asConnection<ServiceConnection>();
  const { totalCount } = await db<Service>(context, 'Service', opts)
    .countDistinct('id as totalCount')
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
