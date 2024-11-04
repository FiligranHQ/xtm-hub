import { v4 as uuidv4 } from 'uuid';
import { db, dbRaw, dbUnsecure, paginate } from '../../../knexfile';
import {
  AddUserInput,
  EditUserInput,
  UserConnection,
  User as UserGenerated,
} from '../../__generated__/resolvers-types';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { RolePortalId } from '../../model/kanel/public/RolePortal';
import User, { UserId, UserMutator } from '../../model/kanel/public/User';
import { PortalContext } from '../../model/portal-context';
import {
  UserInfo,
  UserLoadUserBy,
  UserWithOrganizations,
} from '../../model/user';
import {
  ADMIN_UUID,
  CAPABILITY_BYPASS,
  PLATFORM_ORGANIZATION_UUID,
} from '../../portal.const';
import { hashPassword } from '../../utils/hash-password.util';
import { addPrefixToObject } from '../../utils/typescript';
import { extractId } from '../../utils/utils';
import {
  createUserRolePortal,
  deleteUserRolePortalByUserId,
} from '../common/user-role-portal.helper';
import { loadOrganizationBy } from '../organizations/organizations.domain';
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
  excludedUserId: string
) => {
  return dbUnsecure<User>('User')
    .where('organization_id', organizationId)
    .where('id', '!=', excludedUserId)
    .returning('*');
};

export const loadUserBy = async (
  field: addPrefixToObject<UserMutator, 'User.'> | UserMutator
): Promise<UserLoadUserBy> => {
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
    // Inspiration from https://github.com/knex/knex/issues/882
    .select([
      'User.*',
      dbRaw(
        "COALESCE( json_agg(distinct jsonb_build_object('id', org.id, 'name', CASE WHEN org.name = \"User\".email THEN 'Personal space' ELSE org.name END, '__typename', 'Organization', 'selected', org.id = \"User\".selected_organization_id) ) FILTER (WHERE org.id IS NOT NULL), '[]' )::json AS organizations"
      ),
      dbRaw(
        "COALESCE( json_agg(distinct jsonb_build_object( 'id', \"user_RolePortal\".role_portal_id, '__typename', 'RolePortal' )) FILTER (WHERE \"user_RolePortal\".id IS NOT NULL), '[]' ) as roles_portal_id"
      ),
      dbRaw(
        'COALESCE( json_agg(distinct jsonb_build_object( \'id\', "capability"."id", \'name\', "capability"."name" )) FILTER (WHERE "capability".id IS NOT NULL), \'[]\' ) as capabilities'
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
  opts,
  filter
): Promise<UserConnection> => {
  const query = paginate<UserGenerated>(context, 'User', opts);
  if (filter) {
    query.where('email', 'LIKE', filter + '%');
  }

  const userConnection = await query
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
    // Inspiration from https://github.com/knex/knex/issues/882
    .select([
      'User.*',
      dbRaw(
        "COALESCE( json_agg(distinct jsonb_build_object('id', org.id, 'name', org.name, '__typename', 'Organization') ) FILTER (WHERE org.id IS NOT NULL), '[]' )::json AS organizations"
      ),
      dbRaw(
        'COALESCE( json_agg(distinct jsonb_build_object( \'id\', "capability"."id", \'name\', "capability"."name" )) FILTER (WHERE "capability".id IS NOT NULL), \'[]\' ) as capabilities'
      ),
    ])
    .groupBy(['User.id'])
    .asConnection<UserConnection>();

  userConnection.edges = userConnection.edges.map((edge) => {
    const edgeUser = edge.node as unknown as UserLoadUserBy;
    return {
      cursor: edge.cursor,
      node: completeUserCapability(edgeUser) as unknown as UserGenerated,
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
  };
  // Use insert with returning to get the newly created user
  await addNewUserWithRoles(data, roles);
  return await loadUserBy({ email });
};

export const loadUnsecureUserBy = async (field: UserMutator) => {
  return dbUnsecure<User>('User').where(field);
};

export const updateSelectedOrganization = async (
  context,
  id,
  selected_organization_id
) => {
  const [updatedUser] = await db<User>(context, 'User')
    .where({ id: id as UserId })
    .update({ selected_organization_id })
    .returning('*');
  return updatedUser;
};

export const updateUser = async (
  context: PortalContext,
  id: string,
  input: EditUserInput
) => {
  const selected_organization_id = extractId(
    input.organization_id
  ) as OrganizationId;
  const { roles_id, ...inputWithoutRoles } = input;
  const rolePortalIds = roles_id.map(extractId);
  const update = {
    ...inputWithoutRoles,
    selected_organization_id,
  } as UserMutator;
  const [updatedUser] = await db<User>(context, 'User')
    .where({ id: id as UserId })
    .update(update)
    .returning('*');

  await deleteUserRolePortalByUserId(updatedUser.id);

  const roles_portal_id = await Promise.all(
    rolePortalIds.map(async (rolePortalId) => {
      await createUserRolePortal({
        user_id: updatedUser.id as UserId,
        role_portal_id: rolePortalId as RolePortalId,
      });
      return { id: rolePortalId };
    })
  );
  const organization = await loadOrganizationBy(
    context,
    'Organization.id',
    selected_organization_id
  );

  return {
    ...updatedUser,
    organization,
    roles_portal_id,
  };
};
export const deleteUserById = async (userId: UserId) => {
  return dbUnsecure<User>('User')
    .where('id', userId)
    .delete('*')
    .returning('*');
};
export const loadUserRoles = async (userId: UserId) => {
  return dbUnsecure('User')
    .leftJoin('User_RolePortal', 'User.id', 'User_RolePortal.user_id')
    .leftJoin('RolePortal', 'User_RolePortal.role_portal_id', 'RolePortal.id')
    .where('User.id', userId)
    .select([
      'User.*', // Select all columns from the User table
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
  const { salt, hash } = hashPassword(input.password);
  const data: User = {
    id: userId as UserId,
    email: input.email,
    salt,
    password: hash,
    first_name: input.first_name,
    last_name: input.last_name,
    selected_organization_id,
  };
  const [addedUser] = await db<User>(context, 'User')
    .insert(data)
    .returning('*');
  return addedUser;
};

export const loadUserWithOrganizations = async (
  field: addPrefixToObject<UserMutator, 'User.'> | UserMutator
): Promise<UserWithOrganizations> => {
  return dbUnsecure<UserWithOrganizations>('User')
    .where(field)
    .leftJoin('User_Organization', 'User.id', 'User_Organization.user_id')
    .leftJoin(
      'Organization as org',
      'User_Organization.organization_id',
      '=',
      'org.id'
    )
    .select([
      'User.*',
      dbRaw(
        "COALESCE( json_agg(distinct jsonb_build_object('id', org.id, 'name', CASE WHEN org.name = \"User\".email THEN 'Personal space' ELSE org.name END, '__typename', 'Organization' ) FILTER (WHERE org.id IS NOT NULL), '[]' )::json AS organizations"
      ),
    ])
    .groupBy(['User.id'])
    .first();
};
