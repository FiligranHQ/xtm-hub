import portalConfig from "./src/config.js"
import pkg, {Knex} from "knex"
import {fromGlobalId, toGlobalId} from "graphql-relay/node/node.js"
import {PortalContext} from "./src/index.js"
import {PageInfo} from "graphql-relay/connection/connection.js";

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
            return result.map(row => ({ ...row, id: toGlobalId(__typename, row.id), __typename }));
        } else {
            return {...result, id: toGlobalId(__typename, result.id), __typename};
        }
    }
}

const database = knex(config)

interface QueryOpts {
    unsecured?: boolean
}

export const dbRaw = database.raw

export const db = <T>(context: PortalContext, type: string, opts: QueryOpts = {}) => {
    const {unsecured = false} = opts;
    const queryContext = database<T>(type).queryContext({__typename: type})
    // If user have bypass do not apply security layer
    if (unsecured || context.user?.id === 'root') {
        return queryContext
    }
    // Each type must describe how the element must be filtered regarding of the user.
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

interface Pagination {
    first: number
    after: string
    orderMode: string
    orderBy: string
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
    return { edges, pageInfo }
}

export const paginate = <T>(context: PortalContext, type: string, pagination: Pagination, opts: QueryOpts = {}) => {
    const { first, after, orderMode, orderBy } = pagination;
    const currentOffset = after ? Number(atob(after)) : 0;
    const queryContext = db<T>(context, type, opts);
    queryContext.queryContext({ ...queryContext.queryContext(), ...pagination, connection: true });
    queryContext.orderBy([{ column: orderBy, order: orderMode}]).offset(currentOffset).limit(first)
    return {
        ...queryContext,
        select: (columnName: string | string[]) => queryContext.select(columnName).then(rows => dbConnections(rows, after, first))
    };
}

export const dbMigration = {
    migrate: () => database.migrate.latest(),
    version: () => database.migrate.currentVersion()
};

// noinspection JSUnusedGlobalSymbols
export default config;