import config from 'config';
import pkg, { Knex } from 'knex';
import portalConfig from '../src/config';
import { logApp } from '../src/utils/app-logger.util';

const DATABASE_TEST: string =
  config.get('database-test.database') || 'test_database';

const getDbConnection = () => {
  return pkg({
    client: 'pg',
    connection: {
      host: portalConfig.database.host,
      port: portalConfig.database.port,
      user: portalConfig.database.user,
      password: portalConfig.database.password,
      database: config.get<string>('database.database'),
    },
  });
};

const configTest: Knex.Config = {
  client: 'pg',
  connection: {
    host: portalConfig.database.host,
    port: portalConfig.database.port,
    user: portalConfig.database.user,
    password: portalConfig.database.password,
    database: DATABASE_TEST,
  },
  migrations: {
    extension: 'js',
    tableName: 'migrations',
    directory: 'src/migrations',
  },
  seeds: {
    extension: 'js',
    directory: portalConfig.database.seeds,
  },
};
export const getDbTestConnection = () => {
  return pkg(configTest);
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
  } catch (err) {
    logApp.error(err);
    throw err;
  } finally {
    await dbConnection.destroy();
  }
}

export async function cleanDatabase() {
  const dbConnection = getDbConnection();
  try {
    await dbConnection.raw(
      `DROP DATABASE IF EXISTS ${DATABASE_TEST} WITH (FORCE)`
    );
    await dbConnection.raw('CREATE DATABASE test_database');
  } catch (err) {
    logApp.error(err);
    throw err;
  } finally {
    await dbConnection.destroy();
  }
}

export async function setup() {
  await createDatabase();
}
