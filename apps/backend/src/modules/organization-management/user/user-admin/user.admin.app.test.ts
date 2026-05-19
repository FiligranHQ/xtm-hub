import { MockInstance } from '@vitest/spy';
import { toGlobalId } from 'graphql-relay/node/node';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  TEST_ORGANIZATIONS,
  requestContextAdminSecondOrga,
} from '../../../../../tests/tests.const';
import { FilterKey } from '../../../../__generated__/resolvers-types';
import { requestContext } from '../../../../context/request.context';
import User from '../../../../model/kanel/public/User';
import { ErrorCode } from '../../../../utils/error/error.code';
import { OrganizationDomain } from '../../organization/organization.domain';
import * as UsersHelper from '../user.helper';
import { createNewUserWithPendingOrga, removeUser } from '../user.helper';
import { userAdminApp } from './user.admin.app';

describe('users admin app', () => {
  describe('bulkAcceptPendingUserInOrganization', () => {
    let createdUsers: User[];
    let mockAcceptPendingUser: MockInstance<
      typeof UsersHelper.acceptPendingUserWithCapabilities
    >;
    beforeEach(async () => {
      createdUsers = [];
      mockAcceptPendingUser = vi.spyOn(
        UsersHelper,
        'acceptPendingUserWithCapabilities'
      );
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
      const secondOrga = await OrganizationDomain.loadOrganizationBy({
        id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
      });

      createdUsers = await Promise.all(
        userList.map((user) => createNewUserWithPendingOrga(user, secondOrga))
      );

      const filigranOrga = await OrganizationDomain.loadOrganizationBy({
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
      await Promise.all(
        createdUsers.map((user) => removeUser({ email: user.email }))
      );
      vi.clearAllMocks();
    });

    it('should throw if user is not allowed on orga', async () => {
      requestContext.set(requestContextAdminSecondOrga);
      const userToRemove = createdUsers[0];

      const call = userAdminApp.bulkAcceptPendingUserInOrganization(
        TEST_ORGANIZATIONS.FILIGRAN.ID,
        [userToRemove!.id],
        undefined,
        [],
        []
      );
      await expect(call).rejects.toThrow(
        ErrorCode.MissingCapabilityOnOrganization
      );
    });
    it('should accept users by id', async () => {
      requestContext.set(requestContextAdminSecondOrga);
      const userToRemove = createdUsers[0];
      await userAdminApp.bulkAcceptPendingUserInOrganization(
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        [userToRemove!.id],
        undefined,
        [],
        []
      );

      expect(mockAcceptPendingUser).toHaveBeenCalledExactlyOnceWith({
        user_id: userToRemove!.id,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        orgCapabilities: [],
      });
    });

    it('should accept users by filter', async () => {
      requestContext.set(requestContextAdminSecondOrga);
      await userAdminApp.bulkAcceptPendingUserInOrganization(
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
        []
      );

      expect(mockAcceptPendingUser).toHaveBeenCalledWith({
        user_id: createdUsers[0]!.id,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        orgCapabilities: [],
      });
      expect(mockAcceptPendingUser).toHaveBeenCalledWith({
        user_id: createdUsers[1]!.id,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        orgCapabilities: [],
      });
    });
    it('should accept users by filters and excludedIds', async () => {
      requestContext.set(requestContextAdminSecondOrga);
      const excludedUser = createdUsers[0];

      await userAdminApp.bulkAcceptPendingUserInOrganization(
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

      expect(mockAcceptPendingUser).toHaveBeenCalledExactlyOnceWith({
        user_id: createdUsers[1]!.id,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        orgCapabilities: [],
      });
    });
    it('should accept users by searchTerm', async () => {
      requestContext.set(requestContextAdminSecondOrga);
      const acceptedUser = createdUsers.find(
        (user) => user.email === 'testOne@second-orga.com'
      );

      await userAdminApp.bulkAcceptPendingUserInOrganization(
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        [],
        'One',
        [],
        []
      );

      expect(mockAcceptPendingUser).toHaveBeenCalledExactlyOnceWith({
        user_id: acceptedUser!.id,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        orgCapabilities: [],
      });
    });

    it('should accept users by searchTerm and excludedIds', async () => {
      requestContext.set(requestContextAdminSecondOrga);
      const acceptedUser = createdUsers.find(
        (user) => user.email === 'testTwo@second-orga.com'
      );
      const nonAcceptedUser = createdUsers.find(
        (user) => user.email === 'testOne@second-orga.com'
      );

      await userAdminApp.bulkAcceptPendingUserInOrganization(
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        [],
        'test',
        [],
        [nonAcceptedUser!.id]
      );

      expect(mockAcceptPendingUser).toHaveBeenCalledExactlyOnceWith({
        user_id: acceptedUser!.id,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        orgCapabilities: [],
      });
    });

    it('should accept users by filter, searchTerm and excludedIds', async () => {
      requestContext.set(requestContextAdminSecondOrga);
      const acceptedUser = createdUsers.find(
        (user) => user.email === 'testTwo@second-orga.com'
      );
      const nonAcceptedUser = createdUsers.find(
        (user) => user.email === 'testOne@second-orga.com'
      );
      await userAdminApp.bulkAcceptPendingUserInOrganization(
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
        [nonAcceptedUser!.id]
      );

      expect(mockAcceptPendingUser).toHaveBeenCalledExactlyOnceWith({
        user_id: acceptedUser!.id,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        orgCapabilities: [],
      });
    });
    it('should accept only users from the specified organization', async () => {
      const acceptedUser = createdUsers.find(
        (user) => user.email === 'testFiligran@filigran.io'
      );

      await userAdminApp.bulkAcceptPendingUserInOrganization(
        TEST_ORGANIZATIONS.FILIGRAN.ID,
        [],
        undefined,
        [],
        []
      );

      expect(mockAcceptPendingUser).toHaveBeenCalledExactlyOnceWith({
        user_id: acceptedUser!.id,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        orgCapabilities: [],
      });
    });
  });
  describe('bulkRemovePendingUserFromOrganization', () => {
    let createdUsers: User[];
    beforeEach(async () => {
      createdUsers = [];
      const filigranOrga = await OrganizationDomain.loadOrganizationBy({
        id: TEST_ORGANIZATIONS.FILIGRAN.ID,
      });
      const filigranUser = await createNewUserWithPendingOrga(
        {
          email: 'testFiligranRemoveBulk@filigran.io',
          first_name: 'test',
          last_name: 'filigran',
          picture: null,
        },
        filigranOrga
      );
      createdUsers.push(filigranUser);
    });

    afterEach(async () => {
      await Promise.all(
        createdUsers.map((user) => removeUser({ email: user.email }))
      );
    });
    it('should throw if user is not allowed on orga', async () => {
      requestContext.set(requestContextAdminSecondOrga);
      const filigranOrga = await OrganizationDomain.loadOrganizationBy({
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

      const call = userAdminApp.bulkRemovePendingUserFromOrganization(
        TEST_ORGANIZATIONS.FILIGRAN.ID,
        [filigranUser!.id],
        undefined,
        [],
        []
      );
      await expect(call).rejects.toThrow(
        ErrorCode.MissingCapabilityOnOrganization
      );
    });
  });
});
