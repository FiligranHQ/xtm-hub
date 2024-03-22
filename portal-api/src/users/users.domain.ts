import { CAPABILITY_BYPASS, dbRaw, dbUnsecure, paginate } from '../../knexfile';
import { Capability, User, UserConnection } from '../__generated__/resolvers-types';
import { ADMIN_UUID } from '../server/initialize';
import { UserWithAuthentication } from './users';
import { v4 as uuidv4 } from 'uuid';
import { PortalContext } from '../model/portal-context';
import { hashPassword } from '../utils/hash-password.util';
import CapabilityPortal from '../model/kanel/public/CapabilityPortal';

const completeUserCapability = (user: User): User => {
  if (user && user.id === ADMIN_UUID) {
    const capabilityIds = user.capabilities.map((c: Capability) => c.id);
    if (!capabilityIds.includes(CAPABILITY_BYPASS.id)) {
      user.capabilities.push(CAPABILITY_BYPASS);
    }
  }
  return user;
};

export const loadUserBy = async (field: string, value: string): Promise<UserWithAuthentication> => {
  const userQuery = dbUnsecure<User>('User').where(field, value)
    .leftJoin('Organization as org', 'User.organization_id', '=', 'org.id')
    .leftJoin('User_RolePortal as user_RolePortal', 'User.id', '=', 'user_RolePortal.user_id')
    .leftJoin('RolePortal_CapabilityPortal as rolePortal_CapabilityPortal', 'user_RolePortal.role_portal_id', '=', 'rolePortal_CapabilityPortal.role_portal_id')
    .leftJoin('CapabilityPortal as capability', 'capability.id', '=', 'rolePortal_CapabilityPortal.capability_portal_id')
    // Inspiration from https://github.com/knex/knex/issues/882
    .select([
      'User.*',
      dbRaw('(json_agg(json_build_object(\'id\', org.id, \'name\', org.name, \'__typename\', \'Organization\')) ->> 0)::json as organization'),
      dbRaw('case when count(distinct capability.id) = 0 then \'[]\' else json_agg(distinct capability.*) end as capabilities'),
    ])
    .groupBy(['User.id'])
    .first();

  const user = await userQuery;

  // Remove capability null from query
  const cleanUser = {
    ...user,
    capabilities: user.capabilities.filter((capability: CapabilityPortal) => !!capability),
  };

  // Complete admin user with bypass if needed
  return completeUserCapability(cleanUser) as UserWithAuthentication;
};

export const loadUsers = async (context: PortalContext, opts): Promise<UserConnection> => {
  const userConnection = await paginate<User>(context, 'User', opts)
    .leftJoin('Organization as org', 'User.organization_id', '=', 'org.id')
    .leftJoin('User_RolePortal as user_RolePortal', 'User.id', '=', 'user_RolePortal.user_id')
    .leftJoin('RolePortal_CapabilityPortal as rolePortal_CapabilityPortal', 'user_RolePortal.role_portal_id', '=', 'rolePortal_CapabilityPortal.role_portal_id')
    .leftJoin('CapabilityPortal as capability', 'capability.id', '=', 'rolePortal_CapabilityPortal.capability_portal_id')
    // Inspiration from https://github.com/knex/knex/issues/882
    .select(['User.*', dbRaw('(json_agg(org.*) ->> 0)::json as organization'), dbRaw('case when count(capability) = 0 then \'[]\' else json_agg(capability.*) end as capabilities')])
    .groupBy(['User.id']).asConnection<UserConnection>();
  // Complete admin user with bypass if needed
  userConnection.edges = userConnection.edges.map((edge) => {
    return {
      cursor: edge.cursor,
      node: completeUserCapability(edge.node),
    };
  });
  return userConnection;
};

export const createUser = async (email: string, organization_id = 'ba091095-418f-4b4f-b150-6c9295e232c4', role_portal_id = '6b632cf2-9105-46ec-a463-ad59ab58c770') => {
  const { salt, hash } = hashPassword('');
  const data = {
    id: uuidv4(),
    email: email,
    salt,
    password: hash,
    organization_id,
    external: true,
  };

  // Use insert with returning to get the newly created user
  const [addedUser] = await dbUnsecure('User')
    .insert(data)
    .returning('*');

  await createUserRolePortal(addedUser.id, role_portal_id);

  return addedUser;
};

export const createUserRolePortal = async (user_id, role_portal_id = '6b632cf2-9105-46ec-a463-ad59ab58c770') => {
  const addedUserRole = await dbUnsecure('User_RolePortal')
    .insert({ user_id, role_portal_id });
  return addedUserRole;
};

export const loadRolePortal = async () => {
  const roles = await dbUnsecure('RolePortal');
  return roles;
};

export const loadRolePortalByUserId = async (user_id) => {
  const userRole = await dbUnsecure('User_RolePortal')
    .where({ user_id })
    .join('RolePortal', 'role_portal_id', '=', 'RolePortal.id')
    .returning('*');
  return userRole;
};
