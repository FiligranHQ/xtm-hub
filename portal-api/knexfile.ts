import portalConfig from "./src/config.js";
import pkg from "knex";
const { knex } = pkg;

const config = {
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
};

export const database = knex(config);

// noinspection JSUnusedGlobalSymbols
export default config;