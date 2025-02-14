import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { db, dbRaw, dbUnsecure, paginate } from '../../../knexfile';
import {
  AddUserInput,
  EditMeUserInput,
  EditUserInput,
  QueryUsersArgs,
  Subscription,
  UserConnection,
  UserFilter,
  User as UserGenerated,
} from '../../__generated__/resolvers-types';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { RolePortalId } from '../../model/kanel/public/RolePortal';
import User, {
  UserId,
  UserInitializer,
  UserMutator,
} from '../../model/kanel/public/User';
import { PortalContext } from '../../model/portal-context';
import {
  UserInfo,
  UserLoadUserBy,
  UserWithOrganizations,
  UserWithOrganizationsAndRole,
} from '../../model/user';
import {
  ADMIN_UUID,
  CAPABILITY_BYPASS,
  PLATFORM_ORGANIZATION_UUID,
} from '../../portal.const';
import { dispatch } from '../../pub';
import { ForbiddenAccess } from '../../utils/error.util';
import { hashPassword } from '../../utils/hash-password.util';
import { formatRawAggObject } from '../../utils/queryRaw.util';
import { addPrefixToObject } from '../../utils/typescript';
import { extractId, isEmpty } from '../../utils/utils';
import { updateUserOrg } from '../common/user-organization.helper';
import { updateUserRolePortal } from '../common/user-role-portal.helper';
import { addNewUserWithRoles } from './users.helper';

const completeUserCapability = (user: UserLoadUserBy): UserLoadUserBy => {
  if (user && user.id === ADMIN_UUID) {
    const capabilityIds = user.capabilities.map((c) => c.id);
    if (!capabilityIds.includes(CAPABILITY_BYPASS.id)) {
      user.capabilities.push(CAPABILITY_BYPASS);
    }
  }
  return user;
};

export const loadUsersByOrganization = async (
  organizationId: string,
  excludedUserId: string,
  role: string
) => {
  return dbUnsecure<User>('User')
    .select('User.*')
    .rightJoin('User_RolePortal', function () {
      this.on('User_RolePortal.user_id', '=', 'User.id').andOnVal(
        'User_RolePortal.role_portal_id',
        '=',
        role
      );
    })
    .leftJoin('User_Organization', 'User.id', 'User_Organization.user_id')
    .leftJoin(
      'Organization as org',
      'User_Organization.organization_id',
      '=',
      'org.id'
    )
    .where('org.id', organizationId)
    .where('User.id', '!=', excludedUserId);
};

export const loadUnsecureUser = async (
  field: addPrefixToObject<UserMutator, 'User.'> | UserMutator
) => {
  return dbUnsecure<User>('User').where(field);
};

export const loadUserBy = async (
  field: addPrefixToObject<UserMutator, 'User.'> | UserMutator
): Promise<UserLoadUserBy> => {
  const [foundUser] = await dbUnsecure<UserLoadUserBy>('User').where(field);
  if (!foundUser) {
    return;
  }

  if (foundUser.disabled) {
    throw ForbiddenAccess('You can not login');
  }

  const userQuery = dbUnsecure<UserLoadUserBy>('User')
    .where(field)
    .leftJoin('User_Organization', 'User.id', 'User_Organization.user_id')
    .leftJoin(
      'Organization as org',
      'User_Organization.organization_id',
      '=',
      'org.id'
    )
    .leftJoin(
      'User_RolePortal as user_RolePortal',
      'User.id',
      '=',
      'user_RolePortal.user_id'
    )
    .leftJoin(
      'RolePortal_CapabilityPortal as rolePortal_CapabilityPortal',
      'user_RolePortal.role_portal_id',
      '=',
      'rolePortal_CapabilityPortal.role_portal_id'
    )
    .leftJoin(
      'CapabilityPortal as capability',
      'capability.id',
      '=',
      'rolePortal_CapabilityPortal.capability_portal_id'
    )
    .leftJoin(
      'RolePortal as rolePortal',
      'user_RolePortal.role_portal_id',
      '=',
      'rolePortal.id'
    )
    // Inspiration from https://github.com/knex/knex/issues/882
    .select([
      'User.*',
      dbRaw(
        formatRawAggObject({
          columnName: 'org',
          typename: 'Organization',
          as: 'Organizations',
        })
      ),
      dbRaw(
        formatRawAggObject({
          columnName: 'rolePortal',
          typename: 'RolePortal',
          as: 'roles_portal',
        })
      ),
      dbRaw(
        formatRawAggObject({
          columnName: 'capability',
          typename: 'CapabilityPortal',
          as: 'capabilities',
        })
      ),
    ])
    .groupBy(['User.id'])
    .first();

  const user = await userQuery;

  // Complete admin user with bypass if needed
  return completeUserCapability(user);
};

export const loadUsers = async (
  context: PortalContext,
  opts: QueryUsersArgs,
  filter: UserFilter
): Promise<UserConnection> => {
  const query = paginate<UserGenerated>(context, 'User', opts);

  const addWhereClauses = (query: Knex.QueryInterface) => {
    if (filter.search) {
      query.where((builder) =>
        builder
          .where('email', 'ILIKE', `%${filter.search}%`)
          .orWhere('first_name', 'ILIKE', `%${filter.search}%`)
          .orWhere('last_name', 'ILIKE', `%${filter.search}%`)
      );
    }
    if (filter.organization) {
      const organizationId = extractId(filter.organization);
      query.andWhere('UserOrgFilter.organization_id', '=', organizationId);
    }
  };

  const loadUsersQuery = query
    .leftJoin('User_Organization', 'User.id', 'User_Organization.user_id')
    .leftJoin(
      'User_Organization as UserOrgFilter',
      'User.id',
      'UserOrgFilter.user_id'
    )
    .leftJoin(
      'Organization as org',
      'User_Organization.organization_id',
      '=',
      'org.id'
    )
    .leftJoin(
      'User_RolePortal as user_RolePortal',
      'User.id',
      '=',
      'user_RolePortal.user_id'
    )
    .leftJoin(
      'RolePortal_CapabilityPortal as rolePortal_CapabilityPortal',
      'user_RolePortal.role_portal_id',
      '=',
      'rolePortal_CapabilityPortal.role_portal_id'
    )
    .leftJoin(
      'CapabilityPortal as capability',
      'capability.id',
      '=',
      'rolePortal_CapabilityPortal.capability_portal_id'
    )
    .leftJoin(
      'RolePortal as rolePortal',
      'user_RolePortal.role_portal_id',
      '=',
      'rolePortal.id'
    )
    // Inspiration from https://github.com/knex/knex/issues/882
    .select([
      'User.*',
      dbRaw(
        formatRawAggObject({
          columnName: 'org',
          typename: 'Organization',
          as: 'Organizations',
        })
      ),
      dbRaw(
        formatRawAggObject({
          columnName: 'capability',
          typename: 'CapabilityPortal',
          as: 'capabilities',
        })
      ),
      dbRaw(
        formatRawAggObject({
          columnName: 'rolePortal',
          typename: 'RolePortal',
          as: 'roles_portal',
        })
      ),
    ])
    .groupBy(['User.id']);

  addWhereClauses(loadUsersQuery);

  const userConnection = await loadUsersQuery.asConnection<UserConnection>();

  userConnection.edges = userConnection.edges.map((edge) => {
    const edgeUser = edge.node as unknown as UserLoadUserBy;
    return {
      cursor: edge.cursor,
      node: completeUserCapability(edgeUser) as unknown as UserGenerated,
    };
  });

  const queryTotalCount = db<User>(context, 'User')
    .leftJoin(
      'User_Organization as UserOrgFilter',
      'User.id',
      'UserOrgFilter.user_id'
    )
    .countDistinct('User.id as totalCount')
    .first();

  addWhereClauses(queryTotalCount);

  const { totalCount } = await queryTotalCount;

  return {
    totalCount,
    ...userConnection,
  };
};

export const createUser = async (
  userInfo: UserInfo,
  organization_id: OrganizationId = PLATFORM_ORGANIZATION_UUID as OrganizationId
) => {
  const { email, first_name, last_name, roles } = userInfo;
  const { salt, hash } = hashPassword('');
  const uuid = uuidv4();
  const data: User = {
    id: uuid as UserId,
    salt,
    password: hash,
    selected_organization_id: organization_id,
    email,
    first_name,
    last_name,
    picture: null,
    disabled: false,
  };
  // Use insert with returning to get the newly created user
  await addNewUserWithRoles(data, roles);
  return await loadUserBy({ email });
};

export const loadUnsecureUserBy = async (field: UserMutator) => {
  return dbUnsecure<User>('User').where(field);
};

export const updateSelectedOrganization = async (
  id,
  selected_organization_id
) => {
  const [updatedUser] = await dbUnsecure<User>('User')
    .where({ id: id as UserId })
    .update({ selected_organization_id })
    .returning('*');
  return updatedUser;
};

export const updateMeUser = async (userId: UserId, input: EditMeUserInput) => {
  const [updatedUser] = await dbUnsecure<User>('User')
    .where({ id: userId })
    .update({ first_name: input.first_name, last_name: input.last_name })
    .returning('*');
  return updatedUser;
};

export const updateUser = async (
  context: PortalContext,
  id: UserId,
  input: EditUserInput
) => {
  const { organizations, roles_id, ...user } = input;

  if (!isEmpty(user)) {
    const updatedUser = await db<User>(context, 'User')
      .where({ id })
      .update(user)
      .returning('*');
    if (input.disabled) {
      await dispatch('User', 'delete', updatedUser);
      await dispatch('MeUser', 'delete', updatedUser, 'User');
    }
  }

  if (roles_id) {
    const rolePortalIds = roles_id?.map(extractId<RolePortalId>);
    await updateUserRolePortal(context, id, rolePortalIds);
  }

  if (organizations) {
    const organizationsIds = organizations.map(extractId<OrganizationId>);
    await updateUserOrg(context, id, organizationsIds);
  }
};
export const deleteUserById = async (userId: UserId) => {
  return dbUnsecure<User>('User').where('id', userId).delete().returning('*');
};
export const loadUserRoles = async (userId: UserId) => {
  return dbUnsecure('User')
    .leftJoin('User_RolePortal', 'User.id', 'User_RolePortal.user_id')
    .leftJoin('RolePortal', 'User_RolePortal.role_portal_id', 'RolePortal.id')
    .where('User.id', userId)
    .select([
      'User.*',
      dbRaw('json_agg("RolePortal".name) as roles'), // Aggregate role names into an array
    ])
    .groupBy('User.id') // Group by User.id to ensure proper aggregation
    .first();
};

export const addNewUser = async (
  context: PortalContext,
  {
    input,
    userId,
    selected_organization_id,
  }: {
    input: AddUserInput;
    userId: string;
    selected_organization_id: OrganizationId;
  }
) => {
  const { salt, hash } = hashPassword(input.password ?? '');
  const data: UserInitializer = {
    id: userId as UserId,
    email: input.email,
    salt,
    password: hash,
    selected_organization_id,
  };
  const [addedUser] = await db<User>(context, 'User')
    .insert(data)
    .returning('*');
  return addedUser;
};

export const loadUserDetails = async (
  field: addPrefixToObject<UserMutator, 'User.'> | UserMutator
): Promise<UserWithOrganizationsAndRole> => {
  return dbUnsecure<UserWithOrganizationsAndRole>('User')
    .where(field)
    .leftJoin('User_Organization', 'User.id', 'User_Organization.user_id')
    .leftJoin(
      'Organization as org',
      'User_Organization.organization_id',
      '=',
      'org.id'
    )
    .leftJoin(
      'User_RolePortal as user_RolePortal',
      'User.id',
      '=',
      'user_RolePortal.user_id'
    )
    .leftJoin(
      'RolePortal as rolePortal',
      'user_RolePortal.role_portal_id',
      '=',
      'rolePortal.id'
    )
    .leftJoin(
      'RolePortal_CapabilityPortal as roleCapaPortal',
      'rolePortal.id',
      '=',
      'roleCapaPortal.role_portal_id'
    )
    .leftJoin(
      'CapabilityPortal as capabilityPortal',
      'roleCapaPortal.capability_portal_id',
      '=',
      'capabilityPortal.id'
    )
    .select([
      'User.*',
      dbRaw(
        formatRawAggObject({
          columnName: 'org',
          typename: 'Organization',
          as: 'Organizations',
        })
      ),
      dbRaw(
        formatRawAggObject({
          columnName: 'rolePortal',
          typename: 'RolePortal',
          as: 'roles_portal',
        })
      ),
      dbRaw(
        formatRawAggObject({
          columnName: 'capabilityPortal',
          typename: 'CapabilityPortal',
          as: 'capabilities',
        })
      ),
    ])
    .groupBy(['User.id'])
    .first();
};

export const userHasOrganizationWithSubscription = async (
  context: PortalContext
) => {
  const organizationIds = context.user.organizations.map((org) => org.id);
  if (organizationIds.length === 0) {
    return false;
  }
  const subscriptions: Subscription[] = await db<Subscription>(
    context,
    'Subscription'
  ).whereIn('organization_id', organizationIds);
  return subscriptions.length !== 0;
};

/**
 * #185: If the user has only ONE organization, land him on it rather than its personal space
 */
export const selectOrganizationAtLogin = async <
  T extends UserWithOrganizations,
>(
  user: T
): Promise<T> => {
  const organizations = user.organizations.filter((o) => !o.personal_space);
  if (organizations.length === 1) {
    const updatedUser = await updateSelectedOrganization(
      user.id,
      organizations[0].id
    );
    return {
      ...user,
      selected_organization_id: updatedUser.selected_organization_id,
    };
  }
  return user;
};
