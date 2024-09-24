import pkg, { Knex } from 'knex';
import portalConfig from '../src/config';
import config from 'config';

const DATABASE_TEST: string = "test_database";

const getDbConnection = () => {
        return pkg({
            client: 'pg',
            connection: {
                host: "127.0.0.1",
                port: 5432,
                user: "portal",
                password: "portal-password",
                database: "cloud-portal"
            },
        });

};

const configTestCi: Knex.Config = {
    client: 'pg',
    connection: {
        host: "127.0.0.1",
        port: 5432,
        user: "portal",
        password: "portal-password",
        database: DATABASE_TEST,
    },
    migrations: {
        extension: 'js',
        tableName: 'migrations',
        directory: 'src/migrations',
    },
    seeds: {
        extension: 'js',
        directory: "tests/seeds",
    },
};

export const getDbTestConnection = () => {
        return pkg(configTestCi);
};

export async function createDatabase() {

    const dbConnection = getDbConnection();

    try {
        await dbConnection.raw(
            `DROP DATABASE IF EXISTS ${DATABASE_TEST} WITH (FORCE)`
        );
        await dbConnection.raw('CREATE DATABASE test_database');
        const database = getDbTestConnection();
        await database.migrate.latest();
        await database.seed.run();
        await database.destroy();
    } catch (err) {
        console.log(err);
    } finally {
        await dbConnection.destroy();
    }
}

export async function setup() {
    await createDatabase();
}
