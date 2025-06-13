import knex from 'knex';
import { DB_NAME, DB_PASSWORD, DB_USER } from './const';

export const db = knex({
  client: 'pg',
  connection: {
    user: DB_USER,
    host: process.env.E2E_BASE_URL ? process.env.DATABASE_HOST : '127.0.0.1',
    database: DB_NAME,
    password: DB_PASSWORD,
    port: process.env.E2E_BASE_URL ? Number(process.env.DATABASE_PORT) : 5434,
  },
});
