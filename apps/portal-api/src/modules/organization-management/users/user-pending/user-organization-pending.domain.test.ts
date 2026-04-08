import { toGlobalId } from 'graphql-relay/node/node';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../../../../knexfile';
import {
  TEST_ORGANIZATIONS,
  requestContextAdminSecondOrga,
  requestContextSimpleUserSecondOrga,
} from '../../../../../tests/tests.const';
import { FilterKey } from '../../../../__generated__/resolvers-types';
import { requestContext } from '../../../../context/request.context';
import User from '../../../../model/kanel/public/User';
import UserOrganizationPending from '../../../../model/kanel/public/UserOrganizationPending';
import { ErrorCode } from '../../../../utils/error/error.code';
import { loadOrganizationBy } from '../../organizations/organizations.domain';
import { createNewUserWithPendingOrga, removeUser } from '../users.helper';
import { insertUser, linkUsersToOrganization } from '../users.test.utils';
import { UserOrganizationPendingDomain } from './user-organization-pending.domain';

describe('UserOrganizationPendingDomain', () => {
  describe('loadOrganizationsWithPendingUsers', () => {
    it('should return list of pending organizations with their pending users', async () => {
      const secondOrgaUsers = [
        await insertUser({
          selected_organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        }),
        await insertUser({
          selected_organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        }),
      ];
      await linkUsersToOrganization(
        secondOrgaUsers,
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
      );

      const filigranUsers = [await insertUser(), await insertUser()];
      await linkUsersToOrganization(
        filigranUsers,
        TEST_ORGANIZATIONS.FILIGRAN.ID
      );

      const result =
        await UserOrganizationPendingDomain.loadOrganizationsWithPendingUsers();

      expect(result.length).toBe(2);

      const secondOrgaResult = result.find(
        (orga) => orga.id === TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
      );
      expect(secondOrgaResult).toBeDefined();
      expect(secondOrgaResult!.users.map(({ id }) => id)).toEqual(
        expect.arrayContaining(secondOrgaUsers.map(({ id }) => id))
      );

      const filigranResult = result.find(
        (orga) => orga.id === TEST_ORGANIZATIONS.FILIGRAN.ID
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
          email: 'testOne@second-orga.com',
          first_name: 'test',
          last_name: 'one',
          picture: null,
        },
        {
          email: 'testTwo@second-orga.com',
          first_name: 'test',
          last_name: 'two',
          picture: null,
        },
      ];
      const secondOrga = await loadOrganizationBy({
        id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
      });

      createdUsers = await Promise.all(
        userList.map((user) => createNewUserWithPendingOrga(user, secondOrga))
      );

      const filigranOrga = await loadOrganizationBy({
        id: TEST_ORGANIZATIONS.FILIGRAN.ID,
      });
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
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
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
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        [],
        undefined,
        [
          {
            key: FilterKey.OrganizationId,
            value: [toGlobalId('Organization', TEST_ORGANIZATIONS.FILIGRAN.ID)],
          },
        ],
        []
      );

      const secondOrgaPendingUsers =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        });
      const filigranPendingUsers =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        });
      expect(secondOrgaPendingUsers).toHaveLength(2);
      expect(filigranPendingUsers).toHaveLength(1);
    });
    it('should remove users by filters and excludedIds', async () => {
      const excludedUser = createdUsers[0];

      await UserOrganizationPendingDomain.bulkRemoveUserFromOrganizationPending(
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        [],
        undefined,
        [
          {
            key: FilterKey.OrganizationId,
            value: [
              toGlobalId(
                'Organization',
                TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
              ),
            ],
          },
        ],
        [excludedUser!.id]
      );

      const secondOrgaPendingUsers =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        });
      expect(secondOrgaPendingUsers).toHaveLength(1);
      expect(secondOrgaPendingUsers[0]!.user_id).toBe(excludedUser!.id);
    });
    it('should remove users by searchTerm', async () => {
      const keptUser = createdUsers.find(
        (user) => user.email === 'testTwo@second-orga.com'
      );

      await UserOrganizationPendingDomain.bulkRemoveUserFromOrganizationPending(
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        [],
        'One',
        [],
        []
      );

      const secondOrgaPendingUsers =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        });

      expect(secondOrgaPendingUsers).toHaveLength(1);
      expect(secondOrgaPendingUsers[0]!.user_id).toBe(keptUser!.id);
    });

    it('should remove users by searchTerm and excludedIds', async () => {
      const keptUser = createdUsers.find(
        (user) => user.email === 'testTwo@second-orga.com'
      );

      await UserOrganizationPendingDomain.bulkRemoveUserFromOrganizationPending(
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        [],
        'test',
        [],
        [keptUser!.id]
      );

      const secondOrgaPendingUsers =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        });

      expect(secondOrgaPendingUsers).toHaveLength(1);
      expect(secondOrgaPendingUsers[0]!.user_id).toBe(keptUser!.id);
    });

    it('should remove users by filter, searchTerm and excludedIds', async () => {
      const keptUser = createdUsers.find(
        (user) => user.email === 'testTwo@second-orga.com'
      );

      await UserOrganizationPendingDomain.bulkRemoveUserFromOrganizationPending(
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        [],
        'test',
        [
          {
            key: FilterKey.OrganizationId,
            value: [
              toGlobalId(
                'Organization',
                TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
              ),
            ],
          },
        ],
        [keptUser!.id]
      );

      const secondOrgaPendingUsers =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        });
      const filigranPendingUsers =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        });

      expect(secondOrgaPendingUsers).toHaveLength(1);
      expect(secondOrgaPendingUsers[0]!.user_id).toBe(keptUser!.id);
      expect(filigranPendingUsers).toHaveLength(1);
    });
    it('should remove only users from the specified organization', async () => {
      await UserOrganizationPendingDomain.bulkRemoveUserFromOrganizationPending(
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        [],
        undefined,
        [],
        []
      );

      const secondOrgaPendingUsers =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        });

      const filigranPendingUsers =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        });

      expect(secondOrgaPendingUsers).toHaveLength(0);
      expect(filigranPendingUsers).toHaveLength(1);
    });
  });
  describe('removeUserFromOrganizationPending', () => {
    let createdUser: User;
    beforeEach(async () => {
      const secondOrga = await loadOrganizationBy({
        id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
      });
      createdUser = await createNewUserWithPendingOrga(
        {
          email: 'testRemovePending@second-orga.com',
          first_name: 'test',
          last_name: 'remove',
          picture: null,
        },
        secondOrga
      );
    });

    afterEach(async () => {
      await db<UserOrganizationPending>('User_Organization_Pending').del();
      await removeUser({ email: createdUser.email });
    });

    it('should remove the pending user when user has the required capability', async () => {
      requestContext.set(requestContextAdminSecondOrga);

      await UserOrganizationPendingDomain.removeUserFromOrganizationPending(
        createdUser.id,
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
      );

      const remaining =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          user_id: createdUser.id,
        });
      expect(remaining).toHaveLength(0);
    });

    it('should throw when user does not have the required capability', async () => {
      requestContext.set(requestContextSimpleUserSecondOrga);

      const call =
        UserOrganizationPendingDomain.removeUserFromOrganizationPending(
          createdUser.id,
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
        );

      await expect(call).rejects.toThrow(
        ErrorCode.MissingCapabilityOnOrganization
      );

      const remaining =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          user_id: createdUser.id,
        });
      expect(remaining).toHaveLength(1);
    });
  });
});
