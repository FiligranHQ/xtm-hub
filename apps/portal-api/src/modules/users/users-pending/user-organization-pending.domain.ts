import {
  applyFilters,
  applySearch,
  db,
  dbRaw,
  paginate,
} from '../../../../knexfile';
import {
  Filter,
  QueryUsersArgs,
  UserConnection,
  User as UserGenerated,
} from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import Organization, {
  OrganizationId,
} from '../../../model/kanel/public/Organization';
import User, { UserId } from '../../../model/kanel/public/User';
import UserOrganizationPending, {
  UserOrganizationPendingInitializer,
  UserOrganizationPendingMutator,
} from '../../../model/kanel/public/UserOrganizationPending';

export const UserOrganizationPendingDomain = {
  insertNewUserOrganizationPending: (
    field: UserOrganizationPendingInitializer
  ): Promise<UserOrganizationPending[]> => {
    return db<UserOrganizationPending>('User_Organization_Pending')
      .insert(field)
      .returning('*');
  },

  loadOrganizationsWithPendingUsers: async (): Promise<
    (Organization & { users: User[] })[]
  > => {
    return db<Organization>('Organization')
      .innerJoin(
        'User_Organization_Pending',
        'User_Organization_Pending.organization_id',
        '=',
        'Organization.id'
      )
      .leftJoin('User', 'User.id', '=', 'User_Organization_Pending.user_id')
      .select('Organization.*', dbRaw('json_agg("User") AS users'))
      .groupBy('Organization.id');
  },

  loadPendingUsers: (opts: QueryUsersArgs): Promise<UserConnection> => {
    const { user } = requestContext.require();
    const loadPendingUserQuery = db<UserGenerated>('User');
    loadPendingUserQuery
      .leftJoin(
        'User_Organization_Pending as UserOrgPendingFilter',
        'User.id',
        'UserOrgPendingFilter.user_id'
      )
      .select('User.*')
      .where(
        'UserOrgPendingFilter.organization_id',
        user.selected_organization_id
      );

    return paginate<UserGenerated, UserConnection>(
      'User',
      opts,
      { unsecured: true },
      loadPendingUserQuery
    );
  },

  loadUserOrganizationPending: (
    field: UserOrganizationPendingMutator
  ): Promise<UserOrganizationPending[]> => {
    return db<UserOrganizationPending>('User_Organization_Pending')
      .where(field)
      .secureQuery();
  },

  removeUserFromOrganizationPending: async (
    user_id: UserId,
    organization_id: OrganizationId
  ) => {
    return db<UserOrganizationPending>('User_Organization_Pending')
      .where({ user_id, organization_id })
      .delete('*')
      .secureQuery();
  },

  bulkRemoveUserFromOrganizationPending: async (
    organizationId: OrganizationId,
    ids: UserId[],
    searchTerm: string | undefined,
    filters: Filter[],
    excludedIds: UserId[]
  ) => {
    const { queryBuilder } = await buildBulkUserFromOrganizationPendingQuery(
      organizationId,
      ids,
      searchTerm,
      filters,
      excludedIds
    );
    return queryBuilder.delete('*');
  },

  bulkGetUserIdsFromOrganizationPending: async (
    organizationId: OrganizationId,
    ids: UserId[],
    searchTerm: string | undefined,
    filters: Filter[],
    excludedIds: UserId[]
  ): Promise<UserId[]> => {
    const { queryBuilder } = await buildBulkUserFromOrganizationPendingQuery(
      organizationId,
      ids,
      searchTerm,
      filters,
      excludedIds
    );
    const results = await queryBuilder.select('user_id');
    return results.map((row) => row.user_id);
  },
};

const buildBulkUserFromOrganizationPendingQuery = async (
  organizationId: OrganizationId,
  ids: UserId[],
  searchTerm: string | undefined,
  filters: Filter[],
  excludedIds: UserId[]
) => {
  const qb = db<UserOrganizationPending>('User_Organization_Pending').where(
    'organization_id',
    '=',
    organizationId
  );
  if (searchTerm) {
    qb.leftJoin('User', 'User.id', 'User_Organization_Pending.user_id');
    await applySearch('User', qb, searchTerm);
  }

  if (filters.length > 0) {
    await applyFilters('User_Organization_Pending', qb, filters);
  }

  if ((filters.length > 0 || searchTerm) && excludedIds.length > 0) {
    qb.whereNotIn('user_id', excludedIds);
  } else if (ids.length > 0) {
    qb.whereIn('user_id', ids);
  }
  return { queryBuilder: qb };
};
