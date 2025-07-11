import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { contextAdminUser } from '../../../tests/tests.const';
import { UserId } from '../../model/kanel/public/User';
import { loadOrganizationsByUser } from './organizations.domain';

describe('OrganizationsDomain', () => {
  describe('loadOrganizationsByUser', () => {
    it('should return the user organizations when user exists', async () => {
      const organizations = await loadOrganizationsByUser(
        contextAdminUser,
        contextAdminUser.user.id
      );

      expect(organizations.length).toBe(2);
    });

    it('should return the user organizations when user exists', async () => {
      const userId = uuidv4() as UserId;
      const organizations = await loadOrganizationsByUser(
        contextAdminUser,
        userId
      );

      expect(organizations.length).toBe(0);
    });
  });
});
