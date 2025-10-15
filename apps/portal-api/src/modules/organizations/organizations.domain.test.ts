import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { contextAdminUser, THALES_ORGA_ID } from '../../../tests/tests.const';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { UserId } from '../../model/kanel/public/User';
import {
  loadOrganizationsByUser,
  loadUserByOrganization,
} from './organizations.domain';

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

  describe('loadUserByOrganization', () => {
    it('should return the user of organization when user exists', async () => {
      const users = await loadUserByOrganization(THALES_ORGA_ID);

      expect(users.length).toBe(2);
    });

    it('should return empty user list of organization when user is not in organization', async () => {
      const orgaId = uuidv4() as OrganizationId;
      const users = await loadUserByOrganization(orgaId);

      expect(users.length).toBe(0);
    });
  });
});
