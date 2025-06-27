import knex from 'knex';

export const db = knex({
  client: 'pg',
  connection: {
    user: process.env.E2E_BASE_URL ? process.env.POSTGRES_USER : 'portal',
    host: process.env.E2E_BASE_URL ? process.env.DATABASE_HOST : '127.0.0.1',
    database: process.env.E2E_BASE_URL
      ? process.env.POSTGRES_DB
      : 'test_database',
    password: process.env.E2E_BASE_URL
      ? process.env.POSTGRES_PASSWORD
      : 'portal-password',
    port: process.env.E2E_BASE_URL ? Number(process.env.DATABASE_PORT) : 5434,
  },
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
