import pkg, { Knex } from 'knex';
import portalConfig from '../src/config';
import config from 'config';

const DATABASE_TEST: string = 'postgres_db';

const getDbConnection = () => {
  return pkg({
    client: 'pg',
    connection: {
      host: "postgres",
      port: 5432,
      user: "postgres_user",
      password: "postgres_password",
      database: process.env.TEST_MODE ? 'postgres_db' : 'cloud-portal',
    },
  });
}


const configTest: Knex.Config = {
  client: 'pg',
  connection: {
    host: "postgres",
    port: 5432,
    user: "postgres_user",
    password: "postgres_password",
    database: 'postgres_db',
  },
  migrations: {
    extension: 'js',
    tableName: 'migrations',
    directory: 'src/migrations',
  },
  seeds: {
    extension: 'js',
    directory: 'tests/seeds',
  },
};
export const getDbTestConnection = () => {
  return pkg(configTest);
};

export const createDatabase = async() => {
  const dbConnection = getDbConnection();
  try {
    console.log("*****************")
    // await dbConnection.raw(
    //   `DROP DATABASE IF EXISTS ${DATABASE_TEST} WITH (FORCE)`
    // );
    await dbConnection.raw('CREATE DATABASE test_database');
    const database = getDbTestConnection();
    console.log("----------------------------------------")
    await database.migrate.latest();
    try {
      const result = await database.seed.run();
      console.log("seeds applieds : ", result)

    } catch (err) {
      console.log("**** seed error : ", err)
    }

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
