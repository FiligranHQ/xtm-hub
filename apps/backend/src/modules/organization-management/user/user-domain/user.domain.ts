import { db, dbRaw, paginate } from '../../../../../knexfile';
import {
  Filter,
  FilterKey,
  Organization,
  OrganizationCapability,
  QueryUsersArgs,
  Subscription,
  UserConnection,
  User as UserGenerated,
} from '../../../../__generated__/resolvers-types';
import { requestContext } from '../../../../context/request.context';
import { OrganizationId } from '../../../../model/kanel/public/Organization';
import User, { UserId, UserMutator } from '../../../../model/kanel/public/User';
import UserService from '../../../../model/kanel/public/UserService';
import {
  UserLoadUserBy,
  UserWithOrganizationsAndRole,
} from '../../../../model/user';
import { ADMIN_UUID, CAPABILITY_BYPASS } from '../../../../portal.const';
import { isUserAdminPlatform } from '../../../../security/access';
import { checkUserCapabilities } from '../../../../security/util/user';
import { auth0Client } from '../../../../thirdparty/auth0/client';
import { hubspotLoginHook } from '../../../../thirdparty/hubspot/hubspot';
import { logApp } from '../../../../utils/app-logger.util';
import { ErrorCode } from '../../../../utils/error/error.code';
import { formatRawAggObject } from '../../../../utils/query-raw.util';
import { addPrefixToObject } from '../../../../utils/typescript';
import { isEmpty } from '../../../../utils/utils';
import { isAdmin } from '../../../role-portal/role-portal.domain';
import { telemetryApp } from '../../../telemetry/telemetry.app';
import { buildLoginEvent } from '../../../telemetry/telemetry.helper';

export const UserDomain = {
  loadUsers: async (userIds: UserId[]): Promise<User[]> => {
    return db<User[]>('User').whereIn('id', userIds);
  },

  loadUser: async (
    field: addPrefixToObject<UserMutator, 'User.'> | UserMutator
  ): Promise<User[]> => {
    return db<User>('User').where(field);
  },

  getOrganizations: (id: string) => {
    return db<Organization>('Organization')
      .leftJoin(
        'User_Organization',
        'Organization.id',
        'User_Organization.organization_id'
      )
      .leftJoin('User', 'User.id', 'User_Organization.user_id')
      .where('User.id', '=', id)
      .groupBy('Organization.id')
      .select('Organization.*');
  },

  getCapabilities: async (id: string) => {
    const capabilities = await db<UserLoadUserBy['capabilities']>(
      'CapabilityPortal'
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
  },

  getRolesPortal: (id: string) => {
    return db<UserLoadUserBy['capabilities']>('RolePortal')
      .leftJoin(
        'User_RolePortal as user_RolePortal',
        'RolePortal.id',
        '=',
        'user_RolePortal.role_portal_id'
      )
      .leftJoin('User', 'User.id', '=', 'user_RolePortal.user_id')
      .where('User.id', '=', id)
      .select('RolePortal.*');
  },

  loadSimpleUserBy: async (
    field: addPrefixToObject<UserMutator, 'User.'> | UserMutator
  ): Promise<User> => {
    return db<User>('User').where(field).first();
  },

  loadUserBy: async (
    field: addPrefixToObject<UserMutator, 'User.'> | UserMutator
  ): Promise<UserLoadUserBy> => {
    const [foundUser] = await db<UserLoadUserBy>('User').where(field);
    if (!foundUser) {
      return;
    }

    if (foundUser.disabled) {
      throw new Error(ErrorCode.UserDisabled);
    }

    const userOrganizationCapabilityQuery = db<UserService>('User_Organization')
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

    const userQuery = db<UserLoadUserBy>('User')
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
  },

  loadUsersByCapabilitiesInOrganization: async (
    organizationId: string,
    capabilities: OrganizationCapability[]
  ): Promise<User[]> => {
    if (!capabilities.length) {
      return [];
    }

    const users: User[] = await db<User>('User')
      .leftJoin('User_Organization', 'User_Organization.user_id', 'User.id')
      .leftJoin(
        'UserOrganization_Capability',
        'UserOrganization_Capability.user_organization_id',
        'User_Organization.id'
      )
      .where('User_Organization.organization_id', '=', organizationId)
      .andWhere((qb) => {
        qb.where('UserOrganization_Capability.name', '=', capabilities[0]);
        for (let i = 1; i < capabilities.length; i++) {
          qb.orWhere('UserOrganization_Capability.name', '=', capabilities[i]);
        }
      })
      .select('User.*')
      .distinct();

    return users;
  },

  loadUserConnection: (opts: QueryUsersArgs) => {
    const { filters } = opts;
    const loadUserQuery = db<UserGenerated>('User');

    const userOrganizationCapabilityQuery = db<UserService>('User_Organization')
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

    if (!isAdmin()) {
      const { user } = requestContext.require();
      loadUserQuery.where(
        'UserOrg.organization_id',
        user.selected_organization_id
      );
    }
    return paginate<UserGenerated, UserConnection>(
      'User',
      {
        ...opts,
        filters: filters?.map(({ key, value }) => {
          if (key === FilterKey.OrganizationId) {
            return {
              key: 'UserOrg.organization_id',
              value,
            } as unknown as Filter;
          }
          return { key, value };
        }),
      },
      undefined,
      loadUserQuery
    );
  },

  resetPassword: async (): Promise<void> => {
    const { user } = requestContext.require();
    await auth0Client.resetPassword(user.email);
  },

  updateUser: async (id: UserId, input: UserMutator): Promise<User> => {
    if (isEmpty(input)) {
      return;
    }
    const { user } = requestContext.require();
    if (!isUserAdminPlatform(user)) {
      await checkUserCapabilities([
        OrganizationCapability.AdministrateOrganization,
        OrganizationCapability.ManageAccess,
      ]);
    }

    const [updatedUser] = await db<User>('User')
      .where({ id })
      .update(input)
      .returning('*');

    return updatedUser;
  },

  deleteUserById: async (userId: UserId) => {
    return db<User>('User').where('id', userId).delete().returning('*');
  },

  loadUserCapabilitiesByOrganization: async (
    user_id: UserId,
    organization_id: OrganizationId
  ): Promise<{ capabilities?: string[] }> => {
    return db('User_Organization')
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
  },

  loadUserDetails: async (
    field: addPrefixToObject<UserMutator, 'User.'> | UserMutator
  ): Promise<UserWithOrganizationsAndRole> => {
    const userOrganizationCapabilityQuery = db<UserService>('User_Organization')
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
    return db<UserWithOrganizationsAndRole>('User')
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
  },

  userHasOrganizationWithSubscription: async () => {
    const { user } = requestContext.require();
    const organizationIds = user.organizations.map((org) => org.id);
    if (organizationIds.length === 0) {
      return false;
    }
    const subscriptions: Subscription[] = await db<Subscription>(
      'Subscription'
    ).whereIn('organization_id', organizationIds);
    return subscriptions.length !== 0;
  },

  updateUserAtLogin: async (user: UserLoadUserBy): Promise<UserLoadUserBy> => {
    await hubspotLoginHook(user.id);

    const organizations = user.organizations.filter((o) => !o.personal_space);
    const fields: UserMutator = {
      last_login: new Date(),
    };
    if (organizations.length === 1) {
      fields.selected_organization_id = organizations[0].id;
    }

    const [updatedUser] = await db<User>('User')
      .where({ id: user.id })
      .update(fields)
      .returning('*');

    try {
      const selectedOrga = user.organizations.find(
        (org) => org.id === updatedUser.selected_organization_id
      );
      const loginEvent = buildLoginEvent(selectedOrga, user.id);
      await telemetryApp.sendTelemetryEvent(loginEvent);
    } catch (error) {
      logApp.error('Unable to send telemetry event for login', {
        error,
      });
    }
    return UserDomain.loadUserBy({ 'User.id': user.id });
  },
};
