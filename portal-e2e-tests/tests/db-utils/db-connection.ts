import knex from 'knex';

const e2eConnection = {
  user: process.env.POSTGRES_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: Number(process.env.DATABASE_PORT),
};

const localConnection = {
  user: 'portal',
  host: '127.0.0.1',
  database: 'test_database',
  password: 'portal-password',
  port: 5434,
};

export const db = knex({
  client: 'pg',
  connection: process.env.E2E_BASE_URL ? e2eConnection : localConnection,
  migrations: {
    extension: 'js',
    tableName: 'migrations',
    directory: process.env.MIGRATIONS_PATH
      ? process.env.MIGRATIONS_PATH
      : process.cwd() + '/../portal-api/src/migrations',
  },
  seeds: {
    extension: 'js',
    directory: process.env.SEEDS_PATH
      ? process.env.SEEDS_PATH
      : process.cwd() + '/../portal-api/tests/seeds',
  },
});
