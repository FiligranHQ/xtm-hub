import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { contextAdminUser } from '../../../tests/tests.const';
import { UserId } from '../../model/kanel/public/User';
import { loadUserOrganizations } from './organizations.domain';

describe('OrganizationsDomain', () => {
  describe('loadUserOrganizations', () => {
    it('should return the user organizations when user exists', async () => {
      const organizations = await loadUserOrganizations(contextAdminUser);

      expect(organizations.length).toBe(2);
    });

    it('should return the user organizations when user exists', async () => {
      const userId = uuidv4();
      const organizations = await loadUserOrganizations({
        ...contextAdminUser,
        user: {
          ...contextAdminUser.user,
          id: userId as UserId,
        },
      });

      expect(organizations.length).toBe(0);
    });
  });
});
