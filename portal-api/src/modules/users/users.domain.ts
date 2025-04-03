import { db, dbRaw, dbUnsecure, paginate, QueryOpts } from '../../../knexfile';
import {
  AddUserInput,
  EditMeUserInput,
  EditUserInput,
  Filter,
  FilterKey,
  Organization,
  QueryUsersArgs,
  Subscription,
  UserConnection,
  User as UserGenerated,
} from '../../__generated__/resolvers-types';
import { OrganizationId } from '../../model/kanel/public/Organization';
import User, {
  UserId,
  UserInitializer,
  UserMutator,
} from '../../model/kanel/public/User';
import UserService from '../../model/kanel/public/UserService';
import { PortalContext } from '../../model/portal-context';
import {
  UserLoadUserBy,
  UserWithOrganizations,
  UserWithOrganizationsAndRole,
} from '../../model/user';
import { ADMIN_UUID, CAPABILITY_BYPASS } from '../../portal.const';
import { dispatch } from '../../pub';
import { ForbiddenAccess } from '../../utils/error.util';
import { hashPassword } from '../../utils/hash-password.util';
import { formatRawAggObject } from '../../utils/queryRaw.util';
import { addPrefixToObject } from '../../utils/typescript';
import { isEmpty } from '../../utils/utils';
import { isAdmin } from '../role-portal/role-portal.domain';

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

export const getOrganizations = (
  context: PortalContext,
  id: string,
  opts?: Partial<QueryOpts>
) => {
  return db<Organization>(context, 'Organization', opts)
    .leftJoin(
      'User_Organization',
      'Organization.id',
      'User_Organization.organization_id'
    )
    .leftJoin('User', 'User.id', 'User_Organization.user_id')
    .where('User.id', '=', id)
    .groupBy('Organization.id')
    .select('Organization.*');
};

export const getCapabilities = async (
  context: PortalContext,
  id: string,
  opts?: Partial<QueryOpts>
) => {
  const capabilities = await db<UserLoadUserBy['capabilities']>(
    context,
    'CapabilityPortal',
    opts
  )
    .leftJoin(
      'RolePortal_CapabilityPortal as rolePortal_CapabilityPortal',
      'CapabilityPortal.id',
      '=',
      'rolePortal_CapabilityPortal.capability_portal_id'
    )
    .leftJoin(
      'User_RolePortal as user_RolePortal',
      'rolePortal_CapabilityPortal.role_portal_id',
      '=',
      'user_RolePortal.role_portal_id'
    )
    .leftJoin('User', 'User.id', '=', 'user_RolePortal.user_id')
    .where('User.id', '=', id)
    .groupBy('CapabilityPortal.id')
    .select('CapabilityPortal.*');
  if (id === ADMIN_UUID) {
    const capabilityIds = capabilities.map((c) => c.id);
    if (!capabilityIds.includes(CAPABILITY_BYPASS.id)) {
      capabilities.push(CAPABILITY_BYPASS);
    }
  }
  return capabilities;
};

export const getRolesPortal = (
  context: PortalContext,
  id: string,
  opts?: Partial<QueryOpts>
) => {
  return db<UserLoadUserBy['capabilities']>(context, 'RolePortal', opts)
    .leftJoin(
      'User_RolePortal as user_RolePortal',
      'RolePortal.id',
      '=',
      'user_RolePortal.role_portal_id'
    )
    .leftJoin('User', 'User.id', '=', 'user_RolePortal.user_id')
    .where('User.id', '=', id)
    .select('RolePortal.*');
};

export const loadUserBy = async (
  field: addPrefixToObject<UserMutator, 'User.'> | UserMutator
): Promise<UserLoadUserBy> => {
  const [foundUser] = await dbUnsecure<UserLoadUserBy>('User').where(field);
  if (!foundUser) {
    return;
  }

  if (foundUser.disabled) {
    throw ForbiddenAccess('User disabled');
  }

  const userOrganizationCapabilityQuery = dbUnsecure<UserService>(
    'User_Organization'
  )
    .leftJoin(
      'UserOrganization_Capability',
      'User_Organization.id',
      'UserOrganization_Capability.user_organization_id'
    )
    .select(
      dbRaw(
        `COALESCE(
                    json_agg(DISTINCT "UserOrganization_Capability".name)
                    FILTER (WHERE "UserOrganization_Capability".name IS NOT NULL),
                    '[]'::json
    ) AS capabilities`
      )
    )
    .whereRaw(
      `"UserOrganization_Capability"."user_organization_id" = "UserOrg"."id"`
    );

  const userQuery = dbUnsecure<UserLoadUserBy>('User')
    .where(field)
    .leftJoin('User_Organization as UserOrg', 'User.id', 'UserOrg.user_id')
    .leftJoin('User_Organization as selected_user_orga', function () {
      this.on(
        'User.selected_organization_id',
        '=',
        'selected_user_orga.organization_id'
      ).andOn('User.id', '=', 'selected_user_orga.user_id');
    })
    .leftJoin(
      'UserOrganization_Capability',
      'selected_user_orga.id',
      'UserOrganization_Capability.user_organization_id'
    )
    .leftJoin('Organization as org', 'UserOrg.organization_id', '=', 'org.id')
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
      dbRaw(
        `COALESCE(
    json_agg(DISTINCT "UserOrganization_Capability".name)
    FILTER (WHERE "UserOrganization_Capability".name IS NOT NULL),
    '[]'
  )::json AS selected_org_capabilities`
      ),
      dbRaw(
        `COALESCE(
          json_agg( DISTINCT jsonb_build_object(
              '__typename', 'User_Organization',
              'id', "UserOrg".id,
              'organization', to_jsonb("org") || jsonb_build_object('__typename', 'Organization'),
              'capabilities', (${userOrganizationCapabilityQuery})
          ) )
            FILTER (WHERE "org".id IS NOT NULL), '[]'
        )::json AS organization_capabilities`
      ),
    ])
    .groupBy(['User.id'])
    .first();

  return userQuery;
};

export const loadUsers = (context: PortalContext, opts: QueryUsersArgs) => {
  const { filters } = opts;
  const loadUserQuery = db<UserGenerated>(context, 'User', opts);

  const userOrganizationCapabilityQuery = db<UserService>(
    context,
    'User_Organization'
  )
    .leftJoin(
      'UserOrganization_Capability',
      'User_Organization.id',
      'UserOrganization_Capability.user_organization_id'
    )
    .select(
      dbRaw(
        `COALESCE(
                    json_agg(DISTINCT "UserOrganization_Capability".name)
                    FILTER (WHERE "UserOrganization_Capability".name IS NOT NULL),
                    '[]'::json
    ) AS capabilities`
      )
    )
    .whereRaw(
      `"UserOrganization_Capability"."user_organization_id" = "UserOrg"."id"`
    );
  loadUserQuery
    .leftJoin('User_Organization as UserOrg', 'User.id', 'UserOrg.user_id')
    .leftJoin(
      'User_Organization as UserOrgFilter',
      'User.id',
      'UserOrgFilter.user_id'
    )
    .leftJoin('Organization as org', 'UserOrg.organization_id', '=', 'org.id')
    // Inspiration from https://github.com/knex/knex/issues/882
    .select([
      'User.*',
      dbRaw(
        `COALESCE(
          json_agg( DISTINCT jsonb_build_object(
              '__typename', 'User_Organization',
              'id', "UserOrg".id,
              'organization', to_jsonb("org") || jsonb_build_object('__typename', 'Organization'),
              'capabilities', (${userOrganizationCapabilityQuery})
          ) )
           FILTER (WHERE "org".id IS NOT NULL), '[]'
        )::json AS organization_capabilities`
      ),
    ])
    .groupBy(['User.id']);

  if (!isAdmin(context)) {
    loadUserQuery.where(
      'UserOrg.organization_id',
      context.user.selected_organization_id
    );
  }
  return paginate<UserGenerated, UserConnection>(
    context,
    'User',
    {
      ...opts,
      filters: filters?.map(({ key, value }) => {
        if (key === FilterKey.OrganizationId) {
          return {
            key: 'UserOrgFilter.organization_id',
            value,
          } as unknown as Filter;
        }
        return { key, value };
      }),
    },
    undefined,
    loadUserQuery
  );
};

export const loadUnsecureUserBy = async (field: UserMutator) => {
  return dbUnsecure<User>('User').where(field);
};

export const updateSelectedOrganization = async (
  id: UserId,
  selected_organization_id: OrganizationId,
  updateLastLogin?: boolean
) => {
  const [updatedUser] = await dbUnsecure<User>('User')
    .where({ id: id as UserId })
    .update({
      selected_organization_id,
      ...(updateLastLogin ? { last_login: new Date() } : {}),
    })
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
  input: Omit<EditUserInput, 'organization_capabilities'>
) => {
  if (!isEmpty(input)) {
    const [updatedUser] = await db<User>(context, 'User', {
      queryType: 'update',
    })
      .where({ id })
      .update(input)
      .returning('*');
    if (input.disabled) {
      await dispatch('User', 'delete', updatedUser);
      await dispatch('MeUser', 'delete', updatedUser, 'User');
    }
  }
};
export const deleteUserById = async (userId: UserId) => {
  return dbUnsecure<User>('User').where('id', userId).delete().returning('*');
};
export const loadUserCapacityByOrganization = async (
  user_id: UserId,
  organization_id: OrganizationId
) => {
  return dbUnsecure('User_Organization')
    .leftJoin(
      'UserOrganization_Capability',
      'User_Organization.id',
      'UserOrganization_Capability.user_organization_id'
    )
    .where({ user_id, organization_id })
    .select([
      dbRaw('json_agg("UserOrganization_Capability".name) as capabilities'),
    ])
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
  const userOrganizationCapabilityQuery = dbUnsecure<UserService>(
    'User_Organization'
  )
    .leftJoin(
      'UserOrganization_Capability',
      'User_Organization.id',
      'UserOrganization_Capability.user_organization_id'
    )
    .select(
      dbRaw(
        `COALESCE(
                    json_agg(DISTINCT "UserOrganization_Capability".name)
                    FILTER (WHERE "UserOrganization_Capability".name IS NOT NULL),
                    '[]'::json
    ) AS capabilities`
      )
    )
    .whereRaw(
      `"UserOrganization_Capability"."user_organization_id" = "UserOrg"."id"`
    );
  return dbUnsecure<UserWithOrganizationsAndRole>('User')
    .where(field)
    .leftJoin('User_Organization as UserOrg', 'User.id', 'UserOrg.user_id')
    .leftJoin('Organization as org', 'UserOrg.organization_id', '=', 'org.id')
    .select([
      'User.*',
      dbRaw(
        `COALESCE(
          json_agg( DISTINCT jsonb_build_object(
              '__typename', 'User_Organization',
              'id', "UserOrg".id,
              'organization', to_jsonb("org") || jsonb_build_object('__typename', 'Organization'),
              'capabilities', (${userOrganizationCapabilityQuery})
          ) )
            FILTER (WHERE "org".id IS NOT NULL), '[]'
        )::json AS organization_capabilities`
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
      organizations[0].id,
      true
    );
    return {
      ...user,
      selected_organization_id: updatedUser.selected_organization_id,
    };
  }
  return user;
};
