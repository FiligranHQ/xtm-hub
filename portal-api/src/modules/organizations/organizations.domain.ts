import { db, paginate } from '../../../knexfile';
import {
  Filter,
  FilterKey,
  Organization,
  OrganizationConnection,
  QueryOrganizationsArgs,
} from '../../__generated__/resolvers-types';
import { UserId } from '../../model/kanel/public/User';
import { PortalContext } from '../../model/portal-context';

export const loadOrganizationsByUser = async (
  context: PortalContext,
  userId: UserId
): Promise<Organization[]> => {
  const organizations = await db<Organization>(context, 'Organization')
    .leftJoin(
      'User_Organization',
      'User_Organization.organization_id',
      '=',
      'Organization.id'
    )
    .where('User_Organization.user_id', '=', userId)
    .select('Organization.*');

  return organizations;
};

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

export const loadOrganizations = (
  context: PortalContext,
  opts: QueryOrganizationsArgs
) => {
  const { first, after, orderMode, orderBy, searchTerm } = opts;
  return paginate<Organization, OrganizationConnection>(
    context,
    'Organization',
    {
      first,
      after,
      orderMode,
      orderBy,
      searchTerm,
      filters: [
        {
          key: FilterKey.PersonalSpace,
          value: [false],
        } as unknown as Filter,
      ],
    }
  );
};
