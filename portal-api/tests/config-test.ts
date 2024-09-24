import pkg, { Knex } from 'knex';
import portalConfig from '../src/config';
import config from 'config';

const DATABASE_TEST: string =
  config.get('database-test.database') || 'test_database';

const getDbConnection = () => {
  return pkg({
    client: 'pg',
    connection: {
      host: portalConfig.database.host,
      port: 5432,
      user: portalConfig.database.user,
      password: portalConfig.database.password,
      database: config.get<string>('database.database'),
    },
  });
}


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

export const createDatabase = async() => {
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
