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
import User, { UserId } from '../../model/kanel/public/User';
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

export const loadUserByOrganization = async (
  organizationId: OrganizationId
): Promise<User[]> => {
  return dbUnsecure<User>('User')
    .leftJoin('User_Organization', 'User_Organization.user_id', '=', 'User.id')
    .where('User_Organization.organization_id', '=', organizationId)
    .select('User.*');
};

export const loadOrganizationBy = async (
  conditions: OrganizationMutator
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

export const insertNewOrganization = (
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

export const updateOrganizationBy = async (
  field: OrganizationMutator,
  data: OrganizationMutator,
  trx?: Knex.Transaction
) => {
  let query = dbUnsecure<Organization>('Organization')
    .where(field)
    .update(data)
    .returning('*');

  if (trx) {
    query = query.transacting(trx);
  }
  return query;
};

export const deleteOrganizationBy = (
  conditions: OrganizationMutator,
  trx?: Knex.Transaction
) => {
  let query = dbUnsecure<Organization>('Organization')
    .delete('*')
    .where(conditions)
    .returning('*');

  if (trx) {
    query = query.transacting(trx);
  }
  return query;
};
