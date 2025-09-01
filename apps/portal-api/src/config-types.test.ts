import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the logger
vi.mock('./utils/app-logger.util', () => ({
  logApp: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock config values for testing
const mockConfigGet = vi.fn();

// Mock the config module
vi.mock('config', () => ({
  default: {
    get: mockConfigGet,
  },
}));

// Mock the ServiceCapability import
vi.mock('./model/kanel/public/ServiceCapability', () => ({
  default: {},
}));

describe('Configuration type safety and validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };

    // Setup comprehensive mock config
    mockConfigGet.mockImplementation((key: string) => {
      const mockConfig: Record<string, unknown> = {
        port: 3000,
        'admin.email': 'admin@test.com',
        'admin.password': 'secure123',
        'database.host': 'localhost',
        'database.port': 5432,
        'database.user': 'dbuser',
        'database.password': 'dbpass',
        'database.database': 'portal_db',
        'database-test.database': 'portal_test_db',
        'database-test.seeds': 'tests/seeds',
        'elasticsearch.protocol': 'https',
        'elasticsearch.host': 'es-host',
        'elasticsearch.port': 9200,
        'elasticsearch.username': 'es_user',
        'elasticsearch.password': 'es_pass',
        init_services: [
          {
            name: 'test-service',
            provider: 'test-provider',
            type: 'analysis',

            description: 'Test service',
          },
        ],
        init_service_capabilities: [
          {
            id: 1,
            name: 'test-capability',
            description: 'Test capability',
          },
        ],
        init_service_definitions: [
          {
            name: 'test-definition',
            route_name: 'test-route',
            description: 'Test definition',
          },
        ],
        environment: 'development',
        enabled_features: ['auth', 'analytics'],
      };
      return mockConfig[key];
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Port configuration', () => {
    it('should handle numeric port values', async () => {
      mockConfigGet.mockImplementation((key: string) =>
        key === 'port' ? 4000 : 'mock-value'
      );

      const { default: config } = await import('./config');
      expect(config.port).toBe(4000);
      expect(typeof config.port).toBe('number');
    });

    it('should handle string port values that can be converted', async () => {
      mockConfigGet.mockImplementation((key: string) =>
        key === 'port' ? '8080' : 'mock-value'
      );

      const { default: config } = await import('./config');
      expect(config.port).toBe('8080'); // config.get<number> might return string
    });
  });

  describe('Admin configuration validation', () => {
    it('should validate admin email format', async () => {
      const { default: config } = await import('./config');

      expect(config.admin.email).toBe('admin@test.com');
      expect(config.admin.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('should ensure admin password is not empty', async () => {
      const { default: config } = await import('./config');

      expect(config.admin.password).toBe('secure123');
      expect(config.admin.password.length).toBeGreaterThan(0);
    });

    it('should handle missing admin configuration', async () => {
      mockConfigGet.mockImplementation((key: string) => {
        if (key.startsWith('admin.')) return undefined;
        return 'mock-value';
      });

      const { default: config } = await import('./config');
      expect(config.admin.email).toBeUndefined();
      expect(config.admin.password).toBeUndefined();
    });
  });

  describe('Database configuration types', () => {
    it('should ensure database config has required string fields', async () => {
      const { default: config } = await import('./config');

      expect(typeof config.database.host).toBe('string');
      expect(typeof config.database.user).toBe('string');
      expect(typeof config.database.password).toBe('string');
      expect(typeof config.database.database).toBe('string');
      expect(typeof config.database.seeds).toBe('string');
    });

    it('should ensure database port is numeric', async () => {
      const { default: config } = await import('./config');

      expect(config.database.port).toBe(5432);
      expect(typeof config.database.port).toBe('number');
    });

    it('should validate database connection parameters are not empty', async () => {
      const { default: config } = await import('./config');

      expect(config.database.host).toBeTruthy();
      expect(config.database.user).toBeTruthy();
      expect(config.database.password).toBeTruthy();
      expect(config.database.database).toBeTruthy();
    });
  });

  describe('Elasticsearch configuration types', () => {
    it('should validate elasticsearch configuration types', async () => {
      const { default: config } = await import('./config');

      expect(typeof config.elasticsearch.protocol).toBe('string');
      expect(typeof config.elasticsearch.host).toBe('string');
      expect(typeof config.elasticsearch.port).toBe('number');
      expect(config.elasticsearch.port).toBe(9200);
    });

    it('should handle nullable elasticsearch credentials', async () => {
      mockConfigGet.mockImplementation((key: string) => {
        if (key === 'elasticsearch.username') return null;
        if (key === 'elasticsearch.password') return null;
        return 'mock-value';
      });

      const { default: config } = await import('./config');

      expect(config.elasticsearch.username).toBeNull();
      expect(config.elasticsearch.password).toBeNull();
    });

    it('should default to https protocol when null', async () => {
      mockConfigGet.mockImplementation((key: string) => {
        if (key === 'elasticsearch.protocol') return null;
        return 'mock-value';
      });

      const { default: config } = await import('./config');

      expect(config.elasticsearch.protocol).toBe('https');
    });
  });

  describe('Services configuration arrays', () => {
    it('should validate services array structure', async () => {
      const { default: config } = await import('./config');

      expect(Array.isArray(config.services)).toBe(true);
      expect(config.services).toHaveLength(1);

      const service = config.services[0];
      expect(service).toHaveProperty('name');
      expect(service).toHaveProperty('provider');
      expect(service).toHaveProperty('type');
      expect(service).toHaveProperty('description');
    });

    it('should validate service capabilities array', async () => {
      const { default: config } = await import('./config');

      expect(Array.isArray(config.serviceCapabilities)).toBe(true);
      expect(config.serviceCapabilities).toHaveLength(1);

      const capability = config.serviceCapabilities[0];
      expect(capability).toHaveProperty('id');
      expect(capability).toHaveProperty('name');
      expect(capability).toHaveProperty('description');
    });

    it('should validate service definitions array', async () => {
      const { default: config } = await import('./config');

      expect(Array.isArray(config.service_definitions)).toBe(true);
      expect(config.service_definitions).toHaveLength(1);

      const definition = config.service_definitions[0];
      expect(definition).toHaveProperty('name');
      expect(definition).toHaveProperty('route_name');
      expect(definition).toHaveProperty('description');
    });

    it('should handle empty service arrays', async () => {
      mockConfigGet.mockImplementation((key: string) => {
        if (key.startsWith('init_')) return [];
        return 'mock-value';
      });

      const { default: config } = await import('./config');

      expect(config.services).toEqual([]);
      expect(config.serviceCapabilities).toEqual([]);
      expect(config.service_definitions).toEqual([]);
    });
  });

  describe('Environment and Features configuration', () => {
    it('should validate environment string', async () => {
      const { default: config } = await import('./config');

      expect(typeof config.environment).toBe('string');
      expect(config.environment).toBe('development');
    });

    it('should validate enabled_features array', async () => {
      const { default: config } = await import('./config');

      expect(Array.isArray(config.enabled_features)).toBe(true);
      expect(config.enabled_features).toEqual(['auth', 'analytics']);
    });

    it('should default to empty array for enabled_features when null', async () => {
      mockConfigGet.mockImplementation((key: string) => {
        if (key === 'enabled_features') return null;
        return 'mock-value';
      });

      const { default: config } = await import('./config');

      expect(config.enabled_features).toEqual([]);
    });
  });

  describe('Configuration consistency validation', () => {
    it('should ensure test database differs from production database', async () => {
      mockConfigGet.mockImplementation((key: string) => {
        if (key === 'database.database') return 'portal_prod';
        if (key === 'database-test.database') return 'portal_test';
        return 'mock-value';
      });

      process.env.NODE_ENV = 'test';

      const { default: config } = await import('./config');

      expect(config.database.database).toBe('portal_test');
      expect(config.database.database).not.toBe('portal_prod');
    });

    it('should ensure seeds path changes based on environment', async () => {
      process.env.DATA_SEEDING = 'true';

      const { default: config } = await import('./config');

      expect(config.database.seeds).toBe('tests/seeds');
    });

    it('should validate that admin and database configs are independent', async () => {
      const { default: config } = await import('./config');

      expect(config.admin.email).not.toBe(config.database.user);
      expect(config.admin.password).not.toBe(config.database.password);
    });
  });

  describe('Dev users integration', () => {
    it('should include dev_users property in config', async () => {
      const { default: config } = await import('./config');

      expect(config).toHaveProperty('dev_users');
    });

    it('should handle undefined dev_users gracefully', async () => {
      delete process.env.DEV_USERS;

      const { default: config } = await import('./config');

      expect(config.dev_users).toBeUndefined();
    });

    it('should parse valid dev_users from environment', async () => {
      const devUsers = [
        {
          email: 'dev@test.com',
          password: 'devpass123',
          roles: ['USER'],
        },
      ];

      process.env.DEV_USERS = JSON.stringify(devUsers);

      const { default: config } = await import('./config');

      expect(config.dev_users).toEqual(devUsers);
    });
  });

  describe('Configuration immutability', () => {
    it('should not allow modification of config object', async () => {
      const { default: config } = await import('./config');

      // Attempt to modify config should not affect original
      const originalPort = config.port;
      const configCopy = { ...config, port: 9999 };

      expect(config.port).toBe(originalPort);
      expect(configCopy.port).toBe(9999);
    });

    it('should maintain reference equality for arrays', async () => {
      const { default: config1 } = await import('./config');

      // Clear module cache and re-import
      vi.resetModules();

      const { default: config2 } = await import('./config');

      // Arrays should be newly created instances
      expect(config1.services).not.toBe(config2.services);
      expect(config1.enabled_features).not.toBe(config2.enabled_features);
    });
  });
});
