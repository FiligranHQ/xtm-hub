import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { dbTx, dbUnsecure } from '../../knexfile';
import Organization from '../model/kanel/public/Organization';
import { UserInitializer } from '../model/kanel/public/User';
import UserOrganization from '../model/kanel/public/UserOrganization';
import {
  CAPABILITY_BYPASS,
  PLATFORM_ORGANIZATION_UUID,
  ROLE_ADMIN,
  ROLE_USER,
} from '../portal.const';
import { DevUser } from '../utils/config-validation.util';
import {
  ensureCapabilityExists,
  ensureDevOrganizationExists,
  ensureDevUserExists,
  ensureRoleExists,
  ensureRoleHasCapability,
  initializeDevUsers,
} from './initialize.helper';

describe('Dev users seeding', () => {
  // Set up required roles before all tests
  beforeAll(async () => {
    const trx = await dbTx();
    try {
      // Ensure required capabilities and roles exist
      await ensureCapabilityExists(CAPABILITY_BYPASS, trx);
      await ensureRoleExists(ROLE_ADMIN, trx);
      await ensureRoleExists(ROLE_USER, trx);
      await ensureRoleHasCapability(ROLE_ADMIN, CAPABILITY_BYPASS, trx);
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  });

  // Clean up test data after all tests
  afterAll(async () => {
    // Clean up test users and their data
    const testUsers = await dbUnsecure<UserInitializer>('User').where(
      'email',
      'like',
      '%@test-dev.com'
    );

    for (const user of testUsers) {
      // Clean user roles
      await dbUnsecure('User_RolePortal').where('user_id', user.id).del();

      // Clean user organizations
      await dbUnsecure('User_Organization').where('user_id', user.id).del();

      // Clean personal space organization
      await dbUnsecure('Organization').where('id', user.id).del();
    }

    // Clean test users
    await dbUnsecure('User').where('email', 'like', '%@test-dev.com').del();

    // Clean test organizations
    await dbUnsecure('Organization')
      .where('name', 'like', '%Test%')
      .where('personal_space', false)
      .del();
  });

  describe('ensureDevOrganizationExists', () => {
    it('should create a new organization', async () => {
      const orgConfig = {
        name: 'Test Organization',
        domains: ['test-dev.com'],
      };

      const result = await ensureDevOrganizationExists(orgConfig);

      expect(result.name).toBe('Test Organization');
      expect(result.domains).toEqual(['test-dev.com']);
      expect(result.personal_space).toBe(false);

      // Verify in database
      const dbOrg = await dbUnsecure<Organization>('Organization')
        .where({ name: 'Test Organization' })
        .first();

      expect(dbOrg).toBeDefined();
      expect(dbOrg?.domains).toEqual(['test-dev.com']);
    });

    it('should return existing organization', async () => {
      const orgConfig = {
        name: 'Existing Test Org',
        domains: ['existing.com'],
      };

      // Create organization first time
      const firstResult = await ensureDevOrganizationExists(orgConfig);

      // Create same organization second time
      const secondResult = await ensureDevOrganizationExists(orgConfig);

      expect(firstResult.id).toBe(secondResult.id);
      expect(secondResult.name).toBe('Existing Test Org');
    });
  });

  describe('ensureDevUserExists', () => {
    it('should create a simple user with default USER role', async () => {
      const userConfig: DevUser = {
        email: 'simple@test-dev.com',
        password: 'password123',
      };

      await ensureDevUserExists(userConfig);

      // Verify user exists
      const user = await dbUnsecure<UserInitializer>('User')
        .where({ email: 'simple@test-dev.com' })
        .first();

      expect(user).toBeDefined();
      expect(user?.email).toBe('simple@test-dev.com');

      // Verify user has USER role
      const userRole = await dbUnsecure('User_RolePortal')
        .join('RolePortal', 'User_RolePortal.role_portal_id', 'RolePortal.id')
        .where('User_RolePortal.user_id', user?.id)
        .where('RolePortal.name', 'USER')
        .first();

      expect(userRole).toBeDefined();

      // Verify platform organization membership
      const platformMembership = await dbUnsecure<UserOrganization>(
        'User_Organization'
      )
        .where({
          user_id: user?.id,
          organization_id: PLATFORM_ORGANIZATION_UUID,
        })
        .first();

      expect(platformMembership).toBeDefined();

      // Verify personal space exists
      const personalSpace = await dbUnsecure<Organization>('Organization')
        .where({ id: user?.id, personal_space: true })
        .first();

      expect(personalSpace).toBeDefined();
    });

    it('should create admin user with ADMIN role', async () => {
      const adminConfig: DevUser = {
        email: 'admin@test-dev.com',
        password: 'adminpass123',
        roles: ['ADMIN'],
      };

      await ensureDevUserExists(adminConfig);

      const user = await dbUnsecure<UserInitializer>('User')
        .where({ email: 'admin@test-dev.com' })
        .first();

      expect(user).toBeDefined();

      // Verify user has ADMIN role
      const adminRole = await dbUnsecure('User_RolePortal')
        .join('RolePortal', 'User_RolePortal.role_portal_id', 'RolePortal.id')
        .where('User_RolePortal.user_id', user?.id)
        .where('RolePortal.name', 'ADMIN')
        .first();

      expect(adminRole).toBeDefined();
    });

    it('should create user with organization', async () => {
      const userWithOrgConfig: DevUser = {
        email: 'orguser@test-dev.com',
        password: 'orgpass123',
        organization: {
          name: 'User Test Organization',
          domains: ['userorg.test-dev.com'],
        },
      };

      await ensureDevUserExists(userWithOrgConfig);

      const user = await dbUnsecure<UserInitializer>('User')
        .where({ email: 'orguser@test-dev.com' })
        .first();

      expect(user).toBeDefined();

      // Verify organization was created
      const org = await dbUnsecure<Organization>('Organization')
        .where({ name: 'User Test Organization' })
        .first();

      expect(org).toBeDefined();
      expect(org?.domains).toEqual(['userorg.test-dev.com']);

      // Verify user is member of the organization
      const orgMembership = await dbUnsecure<UserOrganization>(
        'User_Organization'
      )
        .where({
          user_id: user?.id,
          organization_id: org?.id,
        })
        .first();

      expect(orgMembership).toBeDefined();
    });

    it('should update existing user password', async () => {
      const userConfig: DevUser = {
        email: 'update@test-dev.com',
        password: 'originalpass',
      };

      // Create user first time
      await ensureDevUserExists(userConfig);

      const originalUser = await dbUnsecure<UserInitializer>('User')
        .where({ email: 'update@test-dev.com' })
        .first();

      const originalPassword = originalUser?.password;

      // Update user with new password
      const updatedConfig: DevUser = {
        email: 'update@test-dev.com',
        password: 'newpassword123',
      };

      await ensureDevUserExists(updatedConfig);

      const updatedUser = await dbUnsecure<UserInitializer>('User')
        .where({ email: 'update@test-dev.com' })
        .first();

      // User ID should be the same
      expect(updatedUser?.id).toBe(originalUser?.id);

      // Password should be different
      expect(updatedUser?.password).not.toBe(originalPassword);
    });
  });

  describe('initializeDevUsers', () => {
    it('should create multiple users from config', async () => {
      const devUsers: DevUser[] = [
        {
          email: 'dev1@test-dev.com',
          password: 'dev1pass',
        },
        {
          email: 'dev2@test-dev.com',
          password: 'dev2pass',
          roles: ['ADMIN'],
        },
        {
          email: 'dev3@test-dev.com',
          password: 'dev3pass',
          organization: {
            name: 'Multi User Test Org',
            domains: ['multi.test-dev.com'],
          },
        },
      ];

      // Mock config
      const portalConfig = await import('../config');
      const originalDevUsers = portalConfig.default.dev_users;
      portalConfig.default.dev_users = devUsers;

      try {
        await initializeDevUsers();

        // Verify all users were created
        const createdUsers = await dbUnsecure<UserInitializer>('User').whereIn(
          'email',
          ['dev1@test-dev.com', 'dev2@test-dev.com', 'dev3@test-dev.com']
        );

        expect(createdUsers).toHaveLength(3);

        // Verify admin role for dev2
        const dev2 = createdUsers.find((u) => u.email === 'dev2@test-dev.com');
        const adminRole = await dbUnsecure('User_RolePortal')
          .join('RolePortal', 'User_RolePortal.role_portal_id', 'RolePortal.id')
          .where('User_RolePortal.user_id', dev2?.id)
          .where('RolePortal.name', 'ADMIN')
          .first();

        expect(adminRole).toBeDefined();

        // Verify organization for dev3
        const org = await dbUnsecure<Organization>('Organization')
          .where({ name: 'Multi User Test Org' })
          .first();

        expect(org).toBeDefined();
      } finally {
        // Restore original config
        portalConfig.default.dev_users = originalDevUsers;
      }
    });

    it('should handle invalid roles gracefully', async () => {
      const devUsers: DevUser[] = [
        {
          email: 'invalidrole@test-dev.com',
          password: 'password123',
          roles: ['INVALID_ROLE', 'USER'],
        },
      ];

      const portalConfig = await import('../config');
      const originalDevUsers = portalConfig.default.dev_users;
      portalConfig.default.dev_users = devUsers;

      try {
        await initializeDevUsers();

        // User should still be created
        const user = await dbUnsecure<UserInitializer>('User')
          .where({ email: 'invalidrole@test-dev.com' })
          .first();

        expect(user).toBeDefined();

        // Should have USER role (valid role was processed)
        const userRole = await dbUnsecure('User_RolePortal')
          .join('RolePortal', 'User_RolePortal.role_portal_id', 'RolePortal.id')
          .where('User_RolePortal.user_id', user?.id)
          .where('RolePortal.name', 'USER')
          .first();

        expect(userRole).toBeDefined();
      } finally {
        portalConfig.default.dev_users = originalDevUsers;
      }
    });

    it('should do nothing when no dev users configured', async () => {
      const portalConfig = await import('../config');
      const originalDevUsers = portalConfig.default.dev_users;
      portalConfig.default.dev_users = undefined;

      try {
        await initializeDevUsers();

        // Should not create any test users
        const testUsers = await dbUnsecure<UserInitializer>('User').where(
          'email',
          'like',
          '%@test-dev.com'
        );

        expect(testUsers).toHaveLength(0);
      } finally {
        portalConfig.default.dev_users = originalDevUsers;
      }
    });
  });
});
