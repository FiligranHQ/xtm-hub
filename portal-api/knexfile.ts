import portalConfig from "./src/config.js"
import pkg, {Knex} from "knex"
import {Capability, User} from "./src/__generated__/resolvers-types.js";
import {fromGlobalId, toGlobalId} from "graphql-relay/node/node.js"
import {PortalContext} from "./src/index.js"
import {PageInfo} from "graphql-relay/connection/connection.js";
import {TypedNode} from "./src/pub.js";

export const CAPABILITY_BYPASS = {id: '85c9fe6f-901f-4992-a8aa-b8d56a7e2e09', name: 'BYPASS'};

export type DatabaseType = 'User' | 'Organization' | 'Service'
export type ActionType = 'add' | 'edit' | 'delete'

interface Pagination {
    first: number
    after: string
    orderMode: string
    orderBy: string
}

const {knex} = pkg

const config: Knex.Config = {
    client: 'pg',
    connection: {
        host: portalConfig.database.host,
        port: portalConfig.database.port,
        user: portalConfig.database.user,
        password: portalConfig.database.password,
        database: portalConfig.database.database
    },
    migrations: {
        extension: 'js',
        tableName: 'migrations',
        directory: 'src/migrations'
    },
    seeds: {
        extension: 'js',
        directory: 'src/seeds',
    },
    postProcessResponse: (result, queryContext) => {
        if (!queryContext?.__typename) return result;
        const __typename = queryContext.__typename;
        if (Array.isArray(result)) {
            return result.map(row => ({...row, id: toGlobalId(__typename, row.id), __typename}));
        } else {
            return {...result, id: toGlobalId(__typename, result.id), __typename};
        }
    }
}

const database = knex(config)

interface QueryOpts {
    unsecured?: boolean
}

const isUserGranted = (user: User, capability: Capability) => {
    if (!user) return false;
    const ids = user.capabilities.map((c) => c.id);
    return ids.includes(CAPABILITY_BYPASS.id) || ids.includes(capability.id);
}

export const dbRaw = (statement: string) => database.raw(statement)

export const dbTx = () => database.transaction()

export const db = <T>(context: PortalContext, type: DatabaseType, opts: QueryOpts = {}) => {
    const {unsecured = false} = opts;
    const queryContext = database<T>(type).queryContext({__typename: type})
    // If user have bypass do not apply security layer
    if (unsecured || isUserGranted(context?.user, CAPABILITY_BYPASS)) {
        return queryContext
    }
    if (type === 'User') {
        const {id: userId} = fromGlobalId(context.user.id);
        queryContext.where('User.id', userId)
        return queryContext;
    }
    if (type === 'Organization') {
        queryContext.rightJoin('User as security', 'security.organization_id', '=', 'Organization.id')
        return queryContext;
    }
    if (type === 'Service') {
        // Services are always available to all users
        return queryContext;
    }
    throw new Error('Security behavior must be defined for type ' + type)
}

export const dbUnsecure = <T>(type: DatabaseType) => {
    const context = {user: null, req: null, res: null};
    return db<T>(context, type, {unsecured: true});
}

export const isNodeAccessible = (user: User, data: { [action: string]: TypedNode }) => {
    const isInvalidActionSize = Object.keys(data).length !== 1;
    if (isInvalidActionSize) {
        // Event can only be setup to one action
        throw new Error('Invalid action size', data)
    }
    // Getting the node, we don't really care about the action to check the visibility
    const node = Object.values(data)[0];
    const type = node.__typename;
    // If user have bypass do not apply security layer
    if (isUserGranted(user, CAPABILITY_BYPASS)) {
        return true;
    }
    if (type === 'User') {
        // TODO Users can only be dispatched to admin
        return true;
    }
    if (type === 'Organization') {
        // TODO Organization can be dispatched to admin or if user is part of
        return true;
    }
    if (type === 'Service') {
        // Services are always available to all users
        return true;
    }
    throw new Error('Security behavior must be defined for type ' + type)
}

export const dbConnections = <T>(nodes: T[], offset: string | undefined, limit: number) => {
    const currentOffset = offset ? Number(atob(offset)) : 0;
    const edges: { cursor: string, node: T }[] = nodes.map((n, index) => {
        const nextIndex = index + 1;
        return {
            cursor: btoa(String(currentOffset + nextIndex)),
            node: n,
        }
    })
    const pageInfo: PageInfo = {
        startCursor: edges[0]?.cursor,
        endCursor: edges.slice(-1)[0]?.cursor,
        hasNextPage: nodes.length >= limit,
        hasPreviousPage: !offset && nodes.length > 0
    }
    return {edges, pageInfo}
}

export const paginate = <T>(context: PortalContext, type: DatabaseType, pagination: Pagination, opts: QueryOpts = {}) => {
    const {first, after, orderMode, orderBy} = pagination;
    const currentOffset = after ? Number(atob(after)) : 0;
    const queryContext = db<T>(context, type, opts);
    queryContext.queryContext({...queryContext.queryContext(), ...pagination, connection: true});
    queryContext.orderBy([{column: orderBy, order: orderMode}]).offset(currentOffset).limit(first)
    queryContext.asConnection = <U>() => queryContext.then(rows => dbConnections(rows, after, first)) as U
    return queryContext;
}

export const dbMigration = {
    migrate: () => database.migrate.latest(),
    version: () => database.migrate.currentVersion()
};

// noinspection JSUnusedGlobalSymbols
export default config;