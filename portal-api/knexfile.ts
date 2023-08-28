import portalConfig from "./src/config.js";
import pkg, { Knex } from "knex";
import {toGlobalId} from "graphql-relay/node/node.js";
const { knex } = pkg;

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
};

export const database = knex(config);

export const dbFrom = <T>(type: string) => {
    return database<T>(type).queryContext({ __typename: type })
}

// noinspection JSUnusedGlobalSymbols
export default config;