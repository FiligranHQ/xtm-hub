import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { logApp } from './utils/app-logger.util';

// Mock the logger
vi.mock('./utils/app-logger.util', () => ({
  logApp: {
    warn: vi.fn(),
  },
}));

// Mock config values for testing
const mockConfigGet = vi.fn();

// Mock the config module to avoid loading actual config
vi.mock('config', () => ({
  default: {
    get: mockConfigGet,
  },
}));

// Mock the ServiceCapability import
vi.mock('./model/kanel/public/ServiceCapability', () => ({
  default: {},
}));

describe('Portal configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment
    process.env = { ...originalEnv };

    // Setup default mock config values
    mockConfigGet.mockImplementation((key: string) => {
      const mockConfig = {
        port: 3000,
        'admin.email': 'admin@example.com',
        'admin.password': 'admin123',
        'database.host': 'localhost',
        'database.port': 5432,
        'database.user': 'testuser',
        'database.password': 'testpass',
        'database.database': 'testdb',
        'database-test.database': 'test_testdb',
        'database-test.seeds': 'test/seeds',
        'elasticsearch.protocol': 'https',
        'elasticsearch.host': 'localhost',
        'elasticsearch.port': 9200,
        'elasticsearch.username': null,
        'elasticsearch.password': null,
        init_services: [],
        init_service_capabilities: [],
        init_service_definitions: [],
        environment: 'test',
        enabled_features: ['feature1', 'feature2'],
      };
      return mockConfig[key] || 'mock-value';
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Basic configuration loading', () => {
    it('should load all required configuration sections', async () => {
      // Re-import config to trigger parsing
      const { default: portalConfig } = await import('./config');

      expect(portalConfig.port).toBe(3000);
      expect(portalConfig.admin.email).toBe('admin@example.com');
      expect(portalConfig.admin.password).toBe('admin123');
      expect(portalConfig.database.host).toBe('localhost');
      expect(portalConfig.database.port).toBe(5432);
      expect(portalConfig.elasticsearch.protocol).toBe('https');
      expect(portalConfig.environment).toBe('test');
      expect(portalConfig.enabled_features).toEqual(['feature1', 'feature2']);
    });

    it('should handle test environment database switching', async () => {
      process.env.NODE_ENV = 'test';

      const { default: portalConfig } = await import('./config');

      expect(portalConfig.database.database).toBe('test_testdb');
    });

    it('should handle VITEST_MODE database switching', async () => {
      process.env.VITEST_MODE = 'true';

      const { default: portalConfig } = await import('./config');

      expect(portalConfig.database.database).toBe('test_testdb');
    });

    it('should use DATA_SEEDING environment for seeds path', async () => {
      process.env.DATA_SEEDING = 'true';

      const { default: portalConfig } = await import('./config');

      expect(portalConfig.database.seeds).toBe('tests/seeds');
    });

    it('should default elasticsearch protocol when not set', async () => {
      mockConfigGet.mockImplementation((key: string) => {
        if (key === 'elasticsearch.protocol') return null;
        return 'mock-value';
      });

      const { default: portalConfig } = await import('./config');

      expect(portalConfig.elasticsearch.protocol).toBe('https');
    });

    it('should handle empty enabled_features array', async () => {
      mockConfigGet.mockImplementation((key: string) => {
        if (key === 'enabled_features') return null;
        return 'mock-value';
      });

      const { default: portalConfig } = await import('./config');

      expect(portalConfig.enabled_features).toEqual([]);
    });

    describe('Configuration error handling', () => {
      it('should handle missing config values gracefully', async () => {
        mockConfigGet.mockImplementation(() => {
          throw new Error('Config key not found');
        });

        // Should not throw, but will use default values or error handling
        expect(async () => {
          await import('./config');
        }).not.toThrow();
      });

      it('should handle null elasticsearch credentials', async () => {
        mockConfigGet.mockImplementation((key: string) => {
          if (
            key === 'elasticsearch.username' ||
            key === 'elasticsearch.password'
          ) {
            return null;
          }
          return 'mock-value';
        });

        const { default: portalConfig } = await import('./config');

        expect(portalConfig.elasticsearch.username).toBeNull();
        expect(portalConfig.elasticsearch.password).toBeNull();
      });
    });

    describe('Environment variable precedence', () => {
      it('should prioritize NODE_ENV=test for database selection', async () => {
        process.env.NODE_ENV = 'test';
        delete process.env.VITEST_MODE;

        const { default: portalConfig } = await import('./config');

        expect(portalConfig.database.database).toBe('test_testdb');
      });

      it('should prioritize VITEST_MODE over NODE_ENV', async () => {
        process.env.NODE_ENV = 'production';
        process.env.VITEST_MODE = 'true';

        const { default: portalConfig } = await import('./config');

        expect(portalConfig.database.database).toBe('test_testdb');
      });

      it('should use production database when neither test env is set', async () => {
        delete process.env.NODE_ENV;
        delete process.env.VITEST_MODE;

        const { default: portalConfig } = await import('./config');

        expect(portalConfig.database.database).toBe('testdb');
      });
    });
  });

  describe('Dev users configuration', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      vi.clearAllMocks();
      // Reset environment
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should return undefined when DEV_USERS is not set', async () => {
      delete process.env.DEV_USERS;

      // Re-import config to trigger parsing
      const { default: portalConfig } = await import('./config');

      expect(portalConfig.dev_users).toBeUndefined();
    });

    it('should parse valid DEV_USERS JSON', async () => {
      const validUsers = [
        {
          email: 'test@example.com',
          password: 'pass123',
          roles: ['USER'],
        },
        {
          email: 'admin@example.com',
          password: 'admin123',
          organization: {
            name: 'Test Org',
            domains: ['example.com'],
          },
        },
      ];

      process.env.DEV_USERS = JSON.stringify(validUsers);

      // Re-import config to trigger parsing
      const { default: portalConfig } = await import('./config');

      expect(portalConfig.dev_users).toEqual(validUsers);
      expect(logApp.warn).not.toHaveBeenCalled();
    });

    it('should handle invalid JSON gracefully', async () => {
      process.env.DEV_USERS = 'invalid-json';

      // Re-import config to trigger parsing
      const { default: portalConfig } = await import('./config');

      expect(portalConfig.dev_users).toBeUndefined();
      expect(logApp.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse DEV_USERS JSON')
      );
    });

    it('should warn when DEV_USERS is not an array', async () => {
      process.env.DEV_USERS = JSON.stringify({ email: 'test@example.com' });

      // Re-import config to trigger parsing
      const { default: portalConfig } = await import('./config');

      expect(portalConfig.dev_users).toBeUndefined();
      expect(logApp.warn).toHaveBeenCalledWith(
        'DEV_USERS should be an array, ignoring'
      );
    });

    it('should filter out invalid users and warn', async () => {
      const mixedUsers = [
        {
          email: 'valid@example.com',
          password: 'pass123',
        },
        {
          email: 'invalid-user', // missing password
        },
        {
          password: 'pass456', // missing email
        },
        {
          email: 'another-valid@example.com',
          password: 'pass789',
          roles: ['ADMIN'],
        },
      ];

      process.env.DEV_USERS = JSON.stringify(mixedUsers);

      // Re-import config to trigger parsing
      const { default: portalConfig } = await import('./config');

      expect(portalConfig.dev_users).toHaveLength(2);
      expect(portalConfig.dev_users?.[0].email).toBe('valid@example.com');
      expect(portalConfig.dev_users?.[1].email).toBe(
        'another-valid@example.com'
      );
      expect(logApp.warn).toHaveBeenCalledWith(
        'Invalid dev user config: missing email or password'
      );
      expect(logApp.warn).toHaveBeenCalledTimes(2); // Called twice for the two invalid users
    });

    it('should handle empty array', async () => {
      process.env.DEV_USERS = JSON.stringify([]);

      // Re-import config to trigger parsing
      const { default: portalConfig } = await import('./config');

      expect(portalConfig.dev_users).toEqual([]);
      expect(logApp.warn).not.toHaveBeenCalled();
    });

    it('should preserve all valid fields in user config', async () => {
      const userWithAllFields = [
        {
          email: 'full@example.com',
          password: 'pass123',
          roles: ['USER', 'ADMIN'],
          organization: {
            name: 'Full Org',
            domains: ['example.com', 'test.com'],
          },
        },
      ];

      process.env.DEV_USERS = JSON.stringify(userWithAllFields);

      // Re-import config to trigger parsing
      const { default: portalConfig } = await import('./config');

      expect(portalConfig.dev_users).toEqual(userWithAllFields);
      expect(portalConfig.dev_users?.[0].organization?.domains).toEqual([
        'example.com',
        'test.com',
      ]);
    });
  });
});
