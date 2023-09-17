import {CAPABILITY_BYPASS, dbRaw, dbUnsecure, paginate} from "../../knexfile.js";
import {Capability, User, UserConnection} from "../__generated__/resolvers-types.js";
import {PortalContext} from "../index.js";
import {ADMIN_UUID} from "../server/initialize.js";
import {UserWithAuthentication} from "./users.js";

const completeUserCapability = (user: User): User => {
    if (user && user.id === ADMIN_UUID) {
        const capabilityIds = user.capabilities.map((c: Capability) => c.id);
        if (!capabilityIds.includes(CAPABILITY_BYPASS.id)) {
            user.capabilities.push(CAPABILITY_BYPASS);
        }
    }
    return user;
}

export const loadUserBy = async (field: string, value: string): Promise<UserWithAuthentication> => {
    const user = await dbUnsecure<User>('User').where(field, value)
        .leftJoin('Organization as org', 'User.organization_id', '=', 'org.id')
        .leftJoin('User_RolePortal as user_RolePortal', 'User.id', '=', 'user_RolePortal.user_id')
        .leftJoin('RolePortal_CapabilityPortal as rolePortal_CapabilityPortal', 'user_RolePortal.role_portal_id', '=', 'rolePortal_CapabilityPortal.role_portal_id')
        .leftJoin('CapabilityPortal as capability', 'capability.id', '=', 'rolePortal_CapabilityPortal.capability_portal_id')
        // Inspiration from https://github.com/knex/knex/issues/882
        .select([
            'User.*',
            dbRaw('(json_agg(json_build_object(\'id\', org.id, \'name\', org.name, \'__typename\', \'Organization\')) ->> 0)::json as organization'),
            dbRaw('case when count(capability) = 0 then \'[]\' else json_agg(capability.*) end as capabilities')
        ])
        .groupBy(['User.id'])
        .first();
    // Complete admin user with bypass if needed
    return completeUserCapability(user) as UserWithAuthentication;
}

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
            node: completeUserCapability(edge.node)
        }
    });
    return userConnection;
}