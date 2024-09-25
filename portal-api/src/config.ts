// https://github.com/node-config/node-config
import config from 'config';
interface Services {
  name: string;
  provider: string;
  type: string;
  description: string;
}
interface PortalConfig {
  port: number;
  admin: {
    email: string;
    password: string;
  };
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    seeds: string;
  };
  services: Services[];
}

const portalConfig: PortalConfig = {
  port: config.get<number>('port'),
  admin: {
    email: config.get<string>('admin.email'),
    password: config.get<string>('admin.password'),
  },
  database: {
    host: process.env.TEST_MODE ? "postgres" : config.get<string>('database.host'),
    port: config.get<number>('database.port'),
    user: process.env.TEST_MODE ? "postgres_user" : config.get<string>('database.user'),
    password: process.env.TEST_MODE ? "postgres_password" : config.get<string>('database.password'),
    database: 'postgres_db',
    seeds:
        process.env.TEST_MODE || process.env.NODE_ENV === 'test'
            ? config.get<string>('database-test.seeds')
            : 'src/seeds',
  },
  services: config.get('init_services'),
};
export default portalConfig;