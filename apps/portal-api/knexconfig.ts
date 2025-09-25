import type { Knex } from 'knex';
import portalConfig from './src/config';

export const baseConfig: Knex.Config = {
  asyncStackTraces:
    process.env.LOCAL_DEV === 'true' ||
    ['development', 'test'].includes(process.env.NODE_ENV),
  client: 'pg',
  connection: {
    host: portalConfig.database.host,
    port: portalConfig.database.port,
    user: portalConfig.database.user,
    password: portalConfig.database.password,
    database: portalConfig.database.database,
  },
};
