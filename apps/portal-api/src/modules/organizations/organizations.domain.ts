import { Knex } from 'knex';
import { db, dbUnsecure, paginate } from '../../../knexfile';
import {
  Filter,
  FilterKey,
  OrganizationConnection,
  QueryOrganizationsArgs,
} from '../../__generated__/resolvers-types';
import Organization, {
  OrganizationId,
  OrganizationInitializer,
  OrganizationMutator,
} from '../../model/kanel/public/Organization';
import { UserId } from '../../model/kanel/public/User';
import { PortalContext } from '../../model/portal-context';

export const loadOrganizationsByUser = async (
  context: PortalContext,
  userId: UserId
): Promise<Organization[]> => {
  return db<Organization>(context, 'Organization')
    .leftJoin(
      'User_Organization',
      'User_Organization.organization_id',
      '=',
      'Organization.id'
    )
    .where('User_Organization.user_id', '=', userId)
    .select('Organization.*');
};

export const loadOrganizationBy = async (
  conditions: Partial<Organization>
): Promise<Organization> => {
  return dbUnsecure<Organization>('Organization')
    .where(conditions)
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

export const insertNewOrganizationReturning = (
  data: OrganizationInitializer,
  trx?: Knex.Transaction
) => {
  const query = dbUnsecure<Organization>('Organization')
    .insert(data)
    .returning('*');

  if (trx) {
    query.transacting(trx);
  }
  return query;
};

export const insertNewOrganization = async (
  data: OrganizationInitializer,
  trx?: Knex.Transaction
) => {
  const query = dbUnsecure<Organization>('Organization').insert(data);
  if (trx) {
    query.transacting(trx);
  }

  return query;
};

export const updateOrganization = async (
  id: OrganizationId,
  data: OrganizationMutator,
  trx?: Knex.Transaction
) => {
  const query = dbUnsecure<Organization>('Organization')
    .where({ id: id })
    .update(data)
    .returning('*');

  if (trx) {
    query.transacting(trx);
  }
  return query;
};
