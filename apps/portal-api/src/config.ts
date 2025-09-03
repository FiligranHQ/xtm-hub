// https://github.com/node-config/node-config
import config from 'config';
import ServiceCapability from './model/kanel/public/ServiceCapability';
import {
  DevUser,
  parseAndValidateDevUsers,
} from './utils/config-validation.util';

interface Services {
  name: string;
  provider: string;
  type: string;
  description: string;
}

interface ServiceDefinitions {
  name: string;
  route_name: string;
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
  elasticsearch: {
    protocol: string;
    host: string;
    port: number;
    username: string | null;
    password: string | null;
    tls: {
      reject_unauthorized: boolean;
    };
  };
  services: Services[];
  serviceCapabilities: ServiceCapability[];
  service_definitions: ServiceDefinitions[];
  environment: string;
  enabled_features: string[];
  dev_users?: DevUser[];
}

const portalConfig: PortalConfig = {
  port: config.get<number>('port'),
  admin: {
    email: config.get<string>('admin.email'),
    password: config.get<string>('admin.password'),
  },
  database: {
    host: config.get<string>('database.host'),
    port: config.get<number>('database.port'),
    user: config.get<string>('database.user'),
    password: config.get<string>('database.password'),
    database:
      process.env.VITEST_MODE || process.env.NODE_ENV === 'test'
        ? config.get<string>('database-test.database')
        : config.get<string>('database.database'),
    seeds: process.env.DATA_SEEDING
      ? 'tests/seeds'
      : process.env.VITEST_MODE || process.env.NODE_ENV === 'test'
        ? config.get<string>('database-test.seeds')
        : 'src/seeds',
  },
  elasticsearch: {
    protocol: config.get<string | null>('elasticsearch.protocol') ?? 'https',
    host: config.get<string>('elasticsearch.host'),
    port: config.get<number>('elasticsearch.port'),
    username: config.get<string | null>('elasticsearch.username'),
    password: config.get<string | null>('elasticsearch.password'),
    tls: {
      reject_unauthorized: config.get<boolean>(
        'elasticsearch.tls.reject_unauthorized'
      ),
    },
  },
  services: config.get('init_services'),
  serviceCapabilities: config.get('init_service_capabilities'),
  service_definitions: config.get('init_service_definitions'),
  environment: config.get<string>('environment'),
  enabled_features: config.get<string[]>('enabled_features') ?? [],
  dev_users: parseAndValidateDevUsers(),
};
export default portalConfig;
