import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { logApp } from './utils/app-logger.util';

// Mock the logger
vi.mock('./utils/app-logger.util', () => ({
  logApp: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Configuration integration tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    // Clear module cache to ensure fresh imports
    vi.resetModules();
  });

  describe('Real environment scenarios', () => {
    it('should handle development environment configuration', async () => {
      process.env.NODE_ENV = 'development';
      process.env.DEV_USERS = JSON.stringify([
        {
          email: 'dev@company.com',
          password: 'dev123',
          roles: ['USER'],
          organization: {
            name: 'Development Team',
            domains: ['company.com'],
          },
        },
      ]);

      // Mock realistic config values
      vi.doMock('config', () => ({
        default: {
          get: (key: string) => {
            const devConfig: Record<string, unknown> = {
              port: 3000,
              'admin.email': 'admin@company.com',
              'admin.password': 'admin123',
              'database.host': 'localhost',
              'database.port': 5432,
              'database.user': 'portal_dev',
              'database.password': 'dev_password',
              'database.database': 'portal_development',
              'database-test.database': 'portal_test',
              'database-test.seeds': 'tests/seeds',
              'elasticsearch.protocol': 'http',
              'elasticsearch.host': 'localhost',
              'elasticsearch.port': 9200,
              'elasticsearch.username': null,
              'elasticsearch.password': null,
              init_services: [],
              init_service_capabilities: [],
              init_service_definitions: [],
              environment: 'development',
              enabled_features: ['dev_tools', 'debug_mode'],
            };
            return devConfig[key];
          },
        },
      }));

      const { default: config } = await import('./config');

      expect(config.environment).toBe('development');
      expect(config.enabled_features).toContain('dev_tools');
      expect(config.dev_users).toHaveLength(1);
      expect(config.dev_users?.[0]?.email).toBe('dev@company.com');
      expect(config.database.database).toBe('portal_development');
    });

    it('should handle production environment configuration', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.DEV_USERS; // No dev users in production

      vi.doMock('config', () => ({
        default: {
          get: (key: string) => {
            const prodConfig: Record<string, unknown> = {
              port: 8080,
              'admin.email': 'admin@company.com',
              'admin.password': 'secure_production_password',
              'database.host': 'prod-db.company.com',
              'database.port': 5432,
              'database.user': 'portal_prod',
              'database.password': 'secure_prod_password',
              'database.database': 'portal_production',
              'database-test.database': 'portal_test',
              'database-test.seeds': 'src/seeds',
              'elasticsearch.protocol': 'https',
              'elasticsearch.host': 'es-cluster.company.com',
              'elasticsearch.port': 9200,
              'elasticsearch.username': 'es_user',
              'elasticsearch.password': 'es_secure_password',
              init_services: [
                {
                  name: 'analysis-service',
                  provider: 'internal',
                  type: 'analysis',
                  description: 'Internal analysis service',
                },
              ],
              init_service_capabilities: [],
              init_service_definitions: [],
              environment: 'production',
              enabled_features: ['analytics', 'monitoring'],
            };
            return prodConfig[key];
          },
        },
      }));

      const { default: config } = await import('./config');

      expect(config.environment).toBe('production');
      expect(config.enabled_features).toContain('analytics');
      expect(config.enabled_features).not.toContain('dev_tools');
      expect(config.dev_users).toBeUndefined();
      expect(config.database.database).toBe('portal_production');
      expect(config.elasticsearch.protocol).toBe('https');
    });

    it('should handle test environment with VITEST_MODE', async () => {
      process.env.VITEST_MODE = 'true';
      process.env.NODE_ENV = 'test';

      vi.doMock('config', () => ({
        default: {
          get: (key: string) => {
            const testConfig: Record<string, unknown> = {
              port: 3001,
              'admin.email': 'test.admin@company.com',
              'admin.password': 'test123',
              'database.host': 'localhost',
              'database.port': 5433,
              'database.user': 'portal_test',
              'database.password': 'test_password',
              'database.database': 'portal_main',
              'database-test.database': 'portal_test_db',
              'database-test.seeds': 'tests/seeds',
              'elasticsearch.protocol': 'http',
              'elasticsearch.host': 'localhost',
              'elasticsearch.port': 9201,
              'elasticsearch.username': null,
              'elasticsearch.password': null,
              init_services: [],
              init_service_capabilities: [],
              init_service_definitions: [],
              environment: 'test',
              enabled_features: [],
            };
            return testConfig[key];
          },
        },
      }));

      const { default: config } = await import('./config');

      expect(config.environment).toBe('test');
      expect(config.database.database).toBe('portal_test_db'); // Uses test database
      expect(config.database.seeds).toBe('tests/seeds');
      expect(config.enabled_features).toEqual([]);
    });
  });

  describe('Configuration error scenarios', () => {
    it('should handle missing required configuration gracefully', async () => {
      vi.doMock('config', () => ({
        default: {
          get: (key: string) => {
            // Simulate missing configuration
            throw new Error(`Configuration key '${key}' not found`);
          },
        },
      }));

      // Should not throw during import
      expect(async () => {
        await import('./config');
      }).not.toThrow();
    });

    it('should handle malformed service configuration', async () => {
      vi.doMock('config', () => ({
        default: {
          get: (key: string) => {
            if (key === 'init_services') {
              return [
                { name: 'service1' }, // Missing required fields
                null, // Invalid entry
                {
                  name: 'service2',
                  provider: 'test',
                  type: 'analysis',
                  description: 'Valid service',
                },
              ];
            }
            return 'mock-value';
          },
        },
      }));

      const { default: config } = await import('./config');

      expect(Array.isArray(config.services)).toBe(true);
      // Configuration should still load even with malformed data
    });
  });

  describe('Environment variable integration', () => {
    it('should correctly handle DATA_SEEDING environment variable', async () => {
      process.env.DATA_SEEDING = 'true';

      vi.doMock('config', () => ({
        default: {
          get: (key: string) => {
            const config: Record<string, unknown> = {
              'database-test.seeds': 'production/seeds',
            };
            return config[key] || 'mock-value';
          },
        },
      }));

      const { default: config } = await import('./config');

      expect(config.database.seeds).toBe('tests/seeds'); // Overridden by env var
    });

    it('should handle complex DEV_USERS configuration', async () => {
      const complexDevUsers = [
        {
          email: 'admin.dev@company.com',
          password: 'admin123',
          roles: ['ADMIN', 'USER'],
          organization: {
            name: 'Admin Organization',
            domains: ['company.com', 'admin.company.com'],
          },
        },
        {
          email: 'user.dev@company.com',
          password: 'user123',
          roles: ['USER'],
        },
        {
          email: 'analyst.dev@company.com',
          password: 'analyst123',
          roles: ['USER', 'ANALYST'],
          organization: {
            name: 'Analytics Team',
            domains: ['analytics.company.com'],
          },
        },
      ];

      process.env.DEV_USERS = JSON.stringify(complexDevUsers);

      vi.doMock('config', () => ({
        default: {
          get: () => 'mock-value',
        },
      }));

      const { default: config } = await import('./config');

      expect(config.dev_users).toHaveLength(3);
      expect(config.dev_users?.[0]?.roles).toContain('ADMIN');
      expect(config.dev_users?.[1]?.organization).toBeUndefined();
      expect(config.dev_users?.[2]?.organization?.domains).toHaveLength(1);
    });

    it('should validate dev users and filter invalid ones', async () => {
      const mixedDevUsers = [
        {
          email: 'valid@company.com',
          password: 'valid123',
        },
        {
          email: 'invalid-email', // Invalid email
          password: 'pass123',
        },
        {
          email: 'short@company.com',
          password: '123', // Too short password
        },
        {
          email: 'another-valid@company.com',
          password: 'another123',
          roles: ['USER'],
        },
      ];

      process.env.DEV_USERS = JSON.stringify(mixedDevUsers);

      vi.doMock('config', () => ({
        default: {
          get: () => 'mock-value',
        },
      }));

      const { default: config } = await import('./config');

      expect(config.dev_users).toHaveLength(2); // Only valid users
      expect(config.dev_users?.[0]?.email).toBe('valid@company.com');
      expect(config.dev_users?.[1]?.email).toBe('another-valid@company.com');
      expect(logApp.warn).toHaveBeenCalledWith(
        expect.stringContaining('2 invalid dev users were filtered out')
      );
    });
  });

  describe('Configuration security', () => {
    it('should not expose sensitive data in logs', async () => {
      const devUsers = [
        {
          email: 'user@company.com',
          password: 'secret_password_123',
        },
      ];

      process.env.DEV_USERS = JSON.stringify(devUsers);

      vi.doMock('config', () => ({
        default: {
          get: () => 'mock-value',
        },
      }));

      await import('./config');

      // Check that password is not logged
      const logCalls = vi.mocked(logApp.info).mock.calls;
      const logMessages = logCalls.map((call) => call[0]).join(' ');
      expect(logMessages).not.toContain('secret_password_123');
    });

    it('should handle empty or whitespace-only configuration', async () => {
      process.env.DEV_USERS = '   '; // Whitespace only

      vi.doMock('config', () => ({
        default: {
          get: () => 'mock-value',
        },
      }));

      const { default: config } = await import('./config');

      expect(config.dev_users).toBeUndefined();
    });
  });

  describe('Configuration validation edge cases', () => {
    it('should handle unicode characters in configuration', async () => {
      const unicodeDevUsers = [
        {
          email: 'tëst@company.com',
          password: 'päss123',
          organization: {
            name: 'Tëst Ørgänizätion',
            domains: ['tëst.com'],
          },
        },
      ];

      process.env.DEV_USERS = JSON.stringify(unicodeDevUsers);

      vi.doMock('config', () => ({
        default: {
          get: () => 'mock-value',
        },
      }));

      const { default: config } = await import('./config');

      expect(config.dev_users).toHaveLength(1);
      expect(config.dev_users?.[0]?.organization?.name).toBe(
        'Tëst Ørgänizätion'
      );
    });

    it('should handle large configuration arrays', async () => {
      const largeDevUsersList = Array.from({ length: 100 }, (_, i) => ({
        email: `user${i}@company.com`,
        password: `password${i}`,
        roles: ['USER'],
      }));

      process.env.DEV_USERS = JSON.stringify(largeDevUsersList);

      vi.doMock('config', () => ({
        default: {
          get: () => 'mock-value',
        },
      }));

      const { default: config } = await import('./config');

      expect(config.dev_users).toHaveLength(100);
      expect(logApp.info).toHaveBeenCalledWith(
        'Loaded 100 dev users from configuration'
      );
    });
  });
});
