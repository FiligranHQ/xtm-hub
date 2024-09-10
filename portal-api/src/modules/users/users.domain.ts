import { db, dbRaw, dbUnsecure, paginate } from '../../../knexfile';
import {
  Capability,
  User as UserGenerated,
  UserConnection,
} from '../../__generated__/resolvers-types';
import { UserWithAuthentication } from './users';
import { v4 as uuidv4 } from 'uuid';
import { PortalContext } from '../../model/portal-context';
import { hashPassword } from '../../utils/hash-password.util';
import CapabilityPortal from '../../model/kanel/public/CapabilityPortal';
import User, { UserId } from '../../model/kanel/public/User';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { UserInfo } from '../../model/user';
import {
  addRolesToUser,
  deleteUserRolePortalByUserId,
} from '../common/user-role-portal';
import { addNewUserWithRoles } from './users.helper';
import { ADMIN_UUID, CAPABILITY_BYPASS } from '../../portal.const';

const completeUserCapability = (user: UserGenerated): UserGenerated => {
  if (user && user.id === ADMIN_UUID) {
    const capabilityIds = user.capabilities.map((c: Capability) => c.id);
    if (!capabilityIds.includes(CAPABILITY_BYPASS.id)) {
      user.capabilities.push(CAPABILITY_BYPASS);
    }
  }
  return user;
};

export const loadUsersByOrganization = async (
  organizationId: string,
  excludedUserId: string
) => {
  return dbUnsecure<User>('User')
    .where('organization_id', organizationId)
    .where('id', '!=', excludedUserId)
    .returning('*');
};

export const loadUserBy = async (
  field: string,
  value: string
): Promise<UserWithAuthentication> => {
  const userQuery = dbUnsecure<User>('User')
    .where(field, value)
    .leftJoin('Organization as org', 'User.organization_id', '=', 'org.id')
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
    // Inspiration from https://github.com/knex/knex/issues/882
    .select([
      'User.*',
      dbRaw(
        "(json_agg(json_build_object('id', org.id, 'name', org.name, '__typename', 'Organization')) ->> 0)::json as organization"
      ),
      dbRaw(
        "case when count(distinct capability.id) = 0 then '[]' else json_agg(distinct capability.*) end as capabilities"
      ),
      dbRaw(
        "case when count(distinct \"user_RolePortal\".role_portal_id) = 0 then '[]' else json_agg( json_build_object( 'id', \"user_RolePortal\".role_portal_id, '__typename', 'RolePortal')) end as roles_portal_id"
      ),
    ])
    .groupBy(['User.id'])
    .first();

  const user = await userQuery;
  // Remove capability null from query
  if (user) {
    const cleanUser = {
      ...user,
      capabilities: user.capabilities.filter(
        (capability: CapabilityPortal) => !!capability
      ),
      roles_portal_id: user.roles_portal_id.filter(
        (role, index, self) =>
          role.id !== null && index === self.findIndex((r) => r.id === role.id)
      ),
    };

    return completeUserCapability(cleanUser) as UserWithAuthentication;
  }

  // Complete admin user with bypass if needed
  return completeUserCapability(user) as UserWithAuthentication;
};

export const loadUsers = async (
  context: PortalContext,
  opts,
  filter
): Promise<UserConnection> => {
  const query = paginate<UserGenerated>(context, 'User', opts);
  if (filter) {
    query.where('email', 'LIKE', filter + '%');
  }

  const userConnection = await query
    .leftJoin('Organization as org', 'User.organization_id', '=', 'org.id')
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
    // Inspiration from https://github.com/knex/knex/issues/882
    .select([
      'User.*',
      dbRaw('(json_agg(org.*) ->> 0)::json as organization'),
      dbRaw(
        "case when count(capability) = 0 then '[]' else json_agg(capability.*) end as capabilities"
      ),
    ])
    .groupBy(['User.id'])
    .asConnection<UserConnection>();

  userConnection.edges = userConnection.edges.map((edge) => {
    return {
      cursor: edge.cursor,
      node: completeUserCapability(edge.node),
    };
  });

  const { totalCount } = await db<User>(context, 'User', opts)
    .countDistinct('id as totalCount')
    .first();
  return {
    totalCount,
    ...userConnection,
  };
};

export const createUser = async (
  userInfo: UserInfo,
  organization_id: OrganizationId = 'ba091095-418f-4b4f-b150-6c9295e232c4' as OrganizationId
) => {
  const { email, first_name, last_name, roles } = userInfo;
  const { salt, hash } = hashPassword('');
  const data: User = {
    id: uuidv4() as UserId,
    salt,
    password: hash,
    organization_id,
    email,
    first_name,
    last_name,
  };
  // Use insert with returning to get the newly created user
  await addNewUserWithRoles(data, roles);
  return await loadUserBy('User.email', email);
};

export const updateUserRoles = async (userInfo: UserInfo, userId: UserId) => {
  const { email, roles } = userInfo;

  // Remove all the role of the User
  await deleteUserRolePortalByUserId(userId);
  await addRolesToUser(userId, roles);

  return await loadUserBy('User.email', email);
};
