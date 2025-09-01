import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('Portal Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Basic Configuration Structure', () => {
    it('should load configuration without errors', async () => {
      const { default: portalConfig } = await import('./config');

      expect(portalConfig).toBeDefined();
      expect(portalConfig.port).toBeDefined();
      expect(portalConfig.admin).toBeDefined();
      expect(portalConfig.database).toBeDefined();
      expect(portalConfig.elasticsearch).toBeDefined();
      expect(portalConfig.environment).toBeDefined();
    });

    it('should have dev_users property that can be undefined or array', async () => {
      const { default: portalConfig } = await import('./config');

      // dev_users should either be undefined or an array
      expect(
        portalConfig.dev_users === undefined ||
          Array.isArray(portalConfig.dev_users)
      ).toBe(true);
    });

    it('should handle missing DEV_USERS environment variable', async () => {
      delete process.env.DEV_USERS;

      const { default: portalConfig } = await import('./config');

      expect(portalConfig.dev_users).toBeUndefined();
    });

    it('should have required database configuration', async () => {
      const { default: portalConfig } = await import('./config');

      expect(portalConfig.database.host).toBeDefined();
      expect(portalConfig.database.port).toBeDefined();
      expect(portalConfig.database.user).toBeDefined();
      expect(portalConfig.database.password).toBeDefined();
      expect(portalConfig.database.database).toBeDefined();
    });

    it('should have admin configuration', async () => {
      const { default: portalConfig } = await import('./config');

      expect(portalConfig.admin.email).toBeDefined();
      expect(portalConfig.admin.password).toBeDefined();
    });

    it('should have elasticsearch configuration', async () => {
      const { default: portalConfig } = await import('./config');

      expect(portalConfig.elasticsearch.host).toBeDefined();
      expect(portalConfig.elasticsearch.port).toBeDefined();
      expect(portalConfig.elasticsearch.protocol).toBeDefined();
    });

    it('should have environment and features configuration', async () => {
      const { default: portalConfig } = await import('./config');

      expect(portalConfig.environment).toBeDefined();
      expect(Array.isArray(portalConfig.enabled_features)).toBe(true);
    });
  });
});
