import { toGlobalId } from 'graphql-relay/node/node';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../../../knexfile';
import {
  FILIGRAN_ORGA_ID,
  THALES_ORGA_ID,
} from '../../../../tests/tests.const';
import { FilterKey } from '../../../__generated__/resolvers-types';
import User from '../../../model/kanel/public/User';
import UserOrganizationPending from '../../../model/kanel/public/UserOrganizationPending';
import { PLATFORM_ORGANIZATION_UUID } from '../../../portal.const';
import { loadOrganizationBy } from '../../organizations/organizations.domain';
import { createNewUserWithPendingOrga, removeUser } from '../users.helper';
import { insertUser, linkUsersToOrganization } from '../users.test.utils';
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
  describe('removeUserFromOrganizationPendingBulk', () => {
    let createdUsers: User[];
    beforeEach(async () => {
      const userList = [
        {
          email: 'testOne@thales.com',
          first_name: 'test',
          last_name: 'one',
          picture: null,
        },
        {
          email: 'testTwo@thales.com',
          first_name: 'test',
          last_name: 'two',
          picture: null,
        },
      ];
      const thalesOrga = await loadOrganizationBy({ id: THALES_ORGA_ID });

      createdUsers = await Promise.all(
        userList.map((user) => createNewUserWithPendingOrga(user, thalesOrga))
      );

      const filigranOrga = await loadOrganizationBy({ id: FILIGRAN_ORGA_ID });
      const filigranUser = await createNewUserWithPendingOrga(
        {
          email: 'testFiligran@filigran.io',
          first_name: 'test',
          last_name: 'filigran',
          picture: null,
        },
        filigranOrga
      );
      createdUsers.push(filigranUser);
    });
    afterEach(async () => {
      await db<UserOrganizationPending>('User_Organization_Pending').del();
      await Promise.all(
        createdUsers.map((user) => removeUser({ email: user.email }))
      );
    });
    it('should remove users by id', async () => {
      const userToRemove = createdUsers[0];
      const userToKeep = createdUsers[1];

      await UserOrganizationPendingDomain.bulkRemoveUserFromOrganizationPending(
        THALES_ORGA_ID,
        [userToRemove!.id],
        undefined,
        [],
        []
      );

      const removed =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          user_id: userToRemove!.id,
        });
      const kept =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          user_id: userToKeep!.id,
        });
      expect(removed).toHaveLength(0);
      expect(kept).toHaveLength(1);
    });

    it('should remove users by filter', async () => {
      await UserOrganizationPendingDomain.bulkRemoveUserFromOrganizationPending(
        THALES_ORGA_ID,
        [],
        undefined,
        [
          {
            key: FilterKey.OrganizationId,
            value: [toGlobalId('Organization', FILIGRAN_ORGA_ID)],
          },
        ],
        []
      );

      const thalesPendingUsers =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          organization_id: THALES_ORGA_ID,
        });
      const filigranPendingUsers =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          organization_id: FILIGRAN_ORGA_ID,
        });
      expect(thalesPendingUsers).toHaveLength(2);
      expect(filigranPendingUsers).toHaveLength(1);
    });
    it('should remove users by filters and excludedIds', async () => {
      const excludedUser = createdUsers[0];

      await UserOrganizationPendingDomain.bulkRemoveUserFromOrganizationPending(
        THALES_ORGA_ID,
        [],
        undefined,
        [
          {
            key: FilterKey.OrganizationId,
            value: [toGlobalId('Organization', THALES_ORGA_ID)],
          },
        ],
        [excludedUser!.id]
      );

      const thalesPendingUsers =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          organization_id: THALES_ORGA_ID,
        });
      expect(thalesPendingUsers).toHaveLength(1);
      expect(thalesPendingUsers[0]!.user_id).toBe(excludedUser!.id);
    });
    it('should remove users by searchTerm', async () => {
      const keptUser = createdUsers.find(
        (user) => user.email === 'testTwo@thales.com'
      );

      await UserOrganizationPendingDomain.bulkRemoveUserFromOrganizationPending(
        THALES_ORGA_ID,
        [],
        'One',
        [],
        []
      );

      const thalesPendingUsers =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          organization_id: THALES_ORGA_ID,
        });

      expect(thalesPendingUsers).toHaveLength(1);
      expect(thalesPendingUsers[0]!.user_id).toBe(keptUser!.id);
    });

    it('should remove users by searchTerm and excludedIds', async () => {
      const keptUser = createdUsers.find(
        (user) => user.email === 'testTwo@thales.com'
      );

      await UserOrganizationPendingDomain.bulkRemoveUserFromOrganizationPending(
        THALES_ORGA_ID,
        [],
        'test',
        [],
        [keptUser!.id]
      );

      const thalesPendingUsers =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          organization_id: THALES_ORGA_ID,
        });

      expect(thalesPendingUsers).toHaveLength(1);
      expect(thalesPendingUsers[0]!.user_id).toBe(keptUser!.id);
    });

    it('should remove users by filter, searchTerm and excludedIds', async () => {
      const keptUser = createdUsers.find(
        (user) => user.email === 'testTwo@thales.com'
      );

      await UserOrganizationPendingDomain.bulkRemoveUserFromOrganizationPending(
        THALES_ORGA_ID,
        [],
        'test',
        [
          {
            key: FilterKey.OrganizationId,
            value: [toGlobalId('Organization', THALES_ORGA_ID)],
          },
        ],
        [keptUser!.id]
      );

      const thalesPendingUsers =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          organization_id: THALES_ORGA_ID,
        });
      const filigranPendingUsers =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          organization_id: FILIGRAN_ORGA_ID,
        });

      expect(thalesPendingUsers).toHaveLength(1);
      expect(thalesPendingUsers[0]!.user_id).toBe(keptUser!.id);
      expect(filigranPendingUsers).toHaveLength(1);
    });
    it('should remove only users from the specified organization', async () => {
      await UserOrganizationPendingDomain.bulkRemoveUserFromOrganizationPending(
        THALES_ORGA_ID,
        [],
        undefined,
        [],
        []
      );

      const thalesPendingUsers =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          organization_id: THALES_ORGA_ID,
        });

      const filigranPendingUsers =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          organization_id: FILIGRAN_ORGA_ID,
        });

      expect(thalesPendingUsers).toHaveLength(0);
      expect(filigranPendingUsers).toHaveLength(1);
    });
  });
});
