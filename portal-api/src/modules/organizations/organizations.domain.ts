import { Knex } from 'knex';
import { db, paginate } from '../../../knexfile';
import {
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

export const loadOrganizations = async (
  context: PortalContext,
  opts: QueryOrganizationsArgs
) => {
  const { first, after, orderMode, orderBy, filter } = opts;
  const query = paginate<Organization>(context, 'Organization', {
    first,
    after,
    orderMode,
    orderBy,
  });

  const addWhereClauses = (query: Knex.QueryInterface) => {
    if (filter?.search) {
      query.where((builder) =>
        builder.where('name', 'ILIKE', `%${filter.search}%`)
      );
    }
  };
  addWhereClauses(query);
  const organizationConnection = await query
    .select('*')
    .where('personal_space', false)
    .asConnection<OrganizationConnection>();

  const queryTotalCount = db<Organization>(context, 'Organization', {
    first,
    after,
    orderMode,
    orderBy,
  })
    .where('personal_space', false)
    .countDistinct('id as totalCount')
    .first();
  addWhereClauses(queryTotalCount);
  const { totalCount } = await queryTotalCount;

  return {
    totalCount,
    ...organizationConnection,
  };
};
