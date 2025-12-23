import { describe, expect, it } from 'vitest';
import { db } from '../../../knexfile';
import { THALES_ORGA_ID } from '../../../tests/tests.const';
import { PLATFORM_ORGANIZATION_UUID } from '../../portal.const';
import { insertUser, linkUsersToOrganization } from '../users/users.test.utils';
import { UserOrganizationPendingDomain } from './user-organization-pending.domain';

describe('UserOrganizationPendingDomain', () => {
  describe('loadOrganizationsWithPendingUsers', () => {
    it('should return list of pending organizations with their pending users', async () => {
      const thalesUsers = [
        await insertUser({ selected_organization_id: THALES_ORGA_ID }),
        await insertUser({ selected_organization_id: THALES_ORGA_ID }),
      ];
      await linkUsersToOrganization(thalesUsers, THALES_ORGA_ID);

      const filigranUsers = [await insertUser(), await insertUser()];
      await linkUsersToOrganization(filigranUsers, PLATFORM_ORGANIZATION_UUID);

      const result =
        await UserOrganizationPendingDomain.loadOrganizationsWithPendingUsers();

      expect(result.length).toBe(2);

      const thalesResult = result.find((orga) => orga.id === THALES_ORGA_ID);
      expect(thalesResult).toBeDefined();
      expect(thalesResult!.users.map(({ id }) => id)).toEqual(
        expect.arrayContaining(thalesUsers.map(({ id }) => id))
      );

      const filigranResult = result.find(
        (orga) => orga.id === PLATFORM_ORGANIZATION_UUID
      );
      expect(filigranResult).toBeDefined();
      expect(filigranResult!.users.map(({ id }) => id)).toEqual(
        expect.arrayContaining(filigranUsers.map(({ id }) => id))
      );
    });

    it('should return an empty list when organizations does not have pending users', async () => {
      await db('User_Organization_Pending').del();
      const result =
        await UserOrganizationPendingDomain.loadOrganizationsWithPendingUsers();

      expect(result.length).toBe(0);
    });
  });
});
