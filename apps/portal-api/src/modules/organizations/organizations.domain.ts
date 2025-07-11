import { db, paginate } from '../../../knexfile';
import {
  Filter,
  FilterKey,
  Organization,
  OrganizationConnection,
  QueryOrganizationsArgs,
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
        { key: FilterKey.PersonalSpace, value: [false] } as unknown as Filter,
      ],
    }
  );
};
