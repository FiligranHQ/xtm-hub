import knex from 'knex';
import { db } from './db-connection';
import { DB_NAME, DB_PASSWORD, DB_USER } from './const';

const SNAPSHOT_DATABASE_NAME = 'test_database_snapshot';

export const dbPostgres = knex({
  client: 'pg',
  connection: {
    user: DB_USER,
    host: process.env.E2E_BASE_URL ? process.env.DATABASE_HOST : '127.0.0.1',
    database: 'postgres',
    password: DB_PASSWORD,
    port: process.env.E2E_BASE_URL ? Number(process.env.DATABASE_PORT) : 5434,
  },
});

export const createDBSnapshot = async (): Promise<void> => {
  await disconnectOtherUsers();

  await dbPostgres.raw(`DROP DATABASE IF EXISTS ${SNAPSHOT_DATABASE_NAME}`);

  await dbPostgres.raw(
    `CREATE DATABASE ${SNAPSHOT_DATABASE_NAME} WITH TEMPLATE ${DB_NAME};`
  );

  return new Promise((resolve) => setTimeout(resolve, 400));
};

export const resetDBSnapshot = async (): Promise<void> => {
  await disconnectOtherUsers();

  await dbPostgres.raw(`DROP DATABASE IF EXISTS ${DB_NAME};`);

  await dbPostgres.raw(
    `CREATE DATABASE ${DB_NAME} WITH TEMPLATE ${SNAPSHOT_DATABASE_NAME}`
  );

  return new Promise((resolve) => setTimeout(resolve, 400));
};

export const removeDBSnapshot = async (): Promise<void> => {
  await db.raw(`DROP DATABASE IF EXISTS ${SNAPSHOT_DATABASE_NAME}`);
};

const disconnectOtherUsers = async (): Promise<void> => {
  await dbPostgres.raw(
    `SELECT pg_terminate_backend(pg_stat_activity.pid)
    FROM pg_stat_activity
    WHERE pg_stat_activity.datname = '${DB_NAME}'
    AND pid <> pg_backend_pid();`
  );
};
