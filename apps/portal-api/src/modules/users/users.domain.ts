import {
  db,
  dbRaw,
  dbTx,
  dbUnsecure,
  paginate,
  QueryOpts,
} from '../../../knexfile';
import {
  Filter,
  FilterKey,
  Organization,
  OrganizationCapability,
  QueryUsersArgs,
  Subscription,
  UserConnection,
  User as UserGenerated,
} from '../../__generated__/resolvers-types';
import { OrganizationId } from '../../model/kanel/public/Organization';
import User, { UserId, UserMutator } from '../../model/kanel/public/User';
import UserService from '../../model/kanel/public/UserService';
import { PortalContext } from '../../model/portal-context';
import { UserLoadUserBy, UserWithOrganizationsAndRole } from '../../model/user';
import { ADMIN_UUID, CAPABILITY_BYPASS } from '../../portal.const';
import { dispatch } from '../../pub';
import { auth0Client } from '../../thirdparty/auth0/client';
import { hubspotLoginHook } from '../../thirdparty/hubspot/hubspot';
import { logApp } from '../../utils/app-logger.util';
import { ForbiddenAccess } from '../../utils/error.util';
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

export const loadOrganizationAdministrators = async (
  context: PortalContext,
  organizationId: string
): Promise<User[]> => {
  const users: User[] = await db<User>(context, 'User')
    .leftJoin('User_Organization', 'User_Organization.user_id', 'User.id')
    .leftJoin(
      'UserOrganization_Capability',
      'UserOrganization_Capability.user_organization_id',
      'User_Organization.id'
    )
    .where('User_Organization.organization_id', '=', organizationId)
    .andWhere((qb) => {
      qb.where(
        'UserOrganization_Capability.name',
        '=',
        OrganizationCapability.AdministrateOrganization
      ).orWhere(
        'UserOrganization_Capability.name',
        '=',
        OrganizationCapability.ManageOctiEnrollment
      );
    })
    .select('User.*')
    .distinct();

  return users;
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

export const resetPassword = async (context: PortalContext): Promise<void> => {
  await auth0Client.resetPassword(context.user.email);
};

export const updateUser = async (
  context: PortalContext,
  id: UserId,
  input: UserMutator,
  secure: boolean = true
): Promise<User> => {
  if (isEmpty(input)) {
    return;
  }
  const trx = await dbTx();
  try {
    const [updatedUser] = secure
      ? await db<User>(context, 'User')
          .where({ id })
          .update(input)
          .returning('*')
          .transacting(trx)
          .secureQuery()
      : await dbUnsecure<User>('User')
          .where({ id })
          .update(input)
          .returning('*')
          .transacting(trx);

    if (input.disabled) {
      await dispatch('User', 'delete', updatedUser);
      await dispatch('MeUser', 'delete', updatedUser, 'User');
    }

    try {
      await auth0Client.updateUser({
        ...input,
        email: updatedUser.email,
      });
    } catch (err) {
      logApp.error(err);
    }

    await trx.commit();
    return updatedUser;
  } catch (err) {
    await trx.rollback();
    throw err;
  }
};

export const deleteUserById = async (userId: UserId) => {
  return dbUnsecure<User>('User').where('id', userId).delete().returning('*');
};
export const loadUserCapabilitiesByOrganization = async (
  user_id: UserId,
  organization_id: OrganizationId
): Promise<{ capabilities?: string[] }> => {
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
      dbRaw(
        formatRawAggObject({
          columnName: 'rolePortal',
          typename: 'RolePortal',
          as: 'roles_portal',
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
export const updateUserAtLogin = async (
  context: PortalContext,
  user: UserLoadUserBy
): Promise<UserLoadUserBy> => {
  // Send data to HubSpot, fire-and-forget, don't wait for promise
  hubspotLoginHook(user.id);

  const organizations = user.organizations.filter((o) => !o.personal_space);
  const fields: UserMutator = {
    last_login: new Date(),
  };
  if (organizations.length === 1) {
    fields.selected_organization_id = organizations[0].id;
  }

  // TODO: Refactor, this function has mixed responsibilities and needs to be separated.
  const updatedUser = await updateUser(context, user.id, fields, false);
  return {
    ...user,
    selected_organization_id: updatedUser.selected_organization_id,
  };
};
