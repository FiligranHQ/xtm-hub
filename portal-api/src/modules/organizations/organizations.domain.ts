import { db, paginate } from '../../../knexfile';
import {
  Organization,
  OrganizationConnection,
  Service,
} from '../../__generated__/resolvers-types';
import { PortalContext } from '../../model/portal-context';

export const loadOrganizationBy = async (
  context: PortalContext,
  field: string,
  value: string
): Promise<Organization> => {
  return db<Organization>(context, 'Organization')
    .where({ [field]: value })
    .select('*')
    .first();
};

export const loadOrganizations = async (context: PortalContext, opts) => {
  const { first, after, orderMode, orderBy } = opts;
  const organizationConnection = await paginate<Organization>(
    context,
    'Organization',
    {
      first,
      after,
      orderMode,
      orderBy,
    }
  )
    .select('*')
    .where('personal_space', false)
    .asConnection<OrganizationConnection>();

  const { totalCount } = await db<Service>(context, 'Organization', opts)
    .where('personal_space', false)
    .countDistinct('id as totalCount')
    .first();

  return {
    totalCount,
    ...organizationConnection,
  };
};
