import portalConfig from "./src/config.js"
import pkg, { Knex } from "knex"
import {fromGlobalId, toGlobalId} from "graphql-relay/node/node.js"
import { PortalContext } from "./src/index.js"
const { knex } = pkg

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
        if(!queryContext?.__typename) return result;
        const __typename = queryContext.__typename;
        if (Array.isArray(result)) {
            return result.map(row => ({ ...row, id: toGlobalId(__typename, row.id), __typename }));
        } else {
            return { ...result, id: toGlobalId(__typename, result.id), __typename };
        }
    }
}

const database = knex(config)

interface QueryOpts {
    unsecured?: boolean
}

export const dbRaw = database.raw

export const dbFrom = <T>(context: PortalContext, type: string, opts: QueryOpts = {}) => {
    const { unsecured = false } = opts;
    const queryContext = database<T>(type).queryContext({ __typename: type })
    // If user have bypass do not apply security layer
    if (unsecured || context.user?.id === 'root') {
        return queryContext
    }
    // Each type must describe how the element must be filtered regarding of the user.
    if (type === 'User') {
        const { id: userId } = fromGlobalId(context.user.id);
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

export const dbMigration = {
    migrate: () => database.migrate.latest(),
    version: () => database.migrate.currentVersion()
};

// noinspection JSUnusedGlobalSymbols
export default config;