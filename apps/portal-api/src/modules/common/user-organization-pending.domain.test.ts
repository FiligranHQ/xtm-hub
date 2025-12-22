import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { db } from '../../../knexfile';
import { THALES_ORGA_ID } from '../../../tests/tests.const';
import { OrganizationId } from '../../model/kanel/public/Organization';
import User, { UserId } from '../../model/kanel/public/User';
import UserOrganizationPending from '../../model/kanel/public/UserOrganizationPending';
import { PLATFORM_ORGANIZATION_UUID } from '../../portal.const';
import { UserOrganizationPendingDomain } from './user-organization-pending.domain';

describe('UserOrganizationPendingDomain', () => {
  describe('loadOrganizationsWithPendingUsers', () => {
    it('should return list of pending organizations with their pending users', async () => {
      const [thalesUser1] = await db<User>('User')
        .insert({
          id: uuidv4() as UserId,
          salt: 'Fleur de sel',
          password: 'Le mot de passe',
          selected_organization_id:
            '015c0488-848d-4c89-95e3-8a243971f594' as OrganizationId,
        })
        .returning('*');
      const [thalesUser2] = await db<User>('User')
        .insert({
          id: uuidv4() as UserId,
          salt: 'Fleur de sel',
          password: 'Le mot de passe',
          selected_organization_id:
            '015c0488-848d-4c89-95e3-8a243971f594' as OrganizationId,
        })
        .returning('*');
      await db<UserOrganizationPending>('User_Organization_Pending').insert({
        organization_id: THALES_ORGA_ID,
        user_id: thalesUser1!.id,
      });

      await db<UserOrganizationPending>('User_Organization_Pending').insert({
        organization_id: THALES_ORGA_ID,
        user_id: thalesUser2!.id,
      });

      const [filigranUser1] = await db<User>('User')
        .insert({
          id: uuidv4() as UserId,
          salt: 'Fleur de sel',
          password: 'Le mot de passe',
          selected_organization_id:
            '015c0488-848d-4c89-95e3-8a243971f594' as OrganizationId,
        })
        .returning('*');
      const [filigranUser2] = await db<User>('User')
        .insert({
          id: uuidv4() as UserId,
          salt: 'Fleur de sel',
          password: 'Le mot de passe',
          selected_organization_id:
            '015c0488-848d-4c89-95e3-8a243971f594' as OrganizationId,
        })
        .returning('*');

      await db<UserOrganizationPending>('User_Organization_Pending').insert({
        organization_id: PLATFORM_ORGANIZATION_UUID,
        user_id: filigranUser1!.id,
      });

      await db<UserOrganizationPending>('User_Organization_Pending').insert({
        organization_id: PLATFORM_ORGANIZATION_UUID,
        user_id: filigranUser2!.id,
      });

      const result =
        await UserOrganizationPendingDomain.loadOrganizationsWithPendingUsers();

      expect(result.length).toBe(2);

      const thales = result.find((orga) => orga.id === THALES_ORGA_ID);
      expect(thales).toBeDefined();
      expect(thales!.users.length).toBe(2);
      expect(
        thales!.users.find((user) => user.id === thalesUser1!.id)
      ).toBeDefined();
      expect(
        thales!.users.find((user) => user.id === thalesUser2!.id)
      ).toBeDefined();

      const filigran = result.find(
        (orga) => orga.id === PLATFORM_ORGANIZATION_UUID
      );
      expect(filigran).toBeDefined();
      expect(filigran!.users.length).toBe(2);
      expect(
        filigran!.users.find((user) => user.id === filigranUser1!.id)
      ).toBeDefined();
      expect(
        filigran!.users.find((user) => user.id === filigranUser2!.id)
      ).toBeDefined();
    });

    it('should return an empty list when organizations does not have pending users', async () => {
      await db('User_Organization_Pending').del();
      const result =
        await UserOrganizationPendingDomain.loadOrganizationsWithPendingUsers();

      expect(result.length).toBe(0);
    });
  });
});
