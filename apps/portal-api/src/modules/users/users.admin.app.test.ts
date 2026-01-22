import { MockInstance } from '@vitest/spy';
import { toGlobalId } from 'graphql-relay/node/node';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FILIGRAN_ORGA_ID,
  requestContextThalesUser,
  THALES_ORGA_ID,
} from '../../../tests/tests.const';
import { FilterKey } from '../../__generated__/resolvers-types';
import { requestContext } from '../../context/request.context';
import User from '../../model/kanel/public/User';
import { ErrorCode } from '../../utils/error/error.code';
import { loadOrganizationBy } from '../organizations/organizations.domain';
import { usersAdminApp } from './users.admin.app';
import * as UsersHelper from './users.helper';
import { createNewUserWithPendingOrga, removeUser } from './users.helper';

describe('Users admin app', () => {
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
      await Promise.all(
        createdUsers.map((user) => removeUser({ email: user.email }))
      );
      vi.clearAllMocks();
    });

    it('should throw if user is not allowed on orga', async () => {
      requestContext.set(requestContextThalesUser);
      const userToRemove = createdUsers[0];

      const call = usersAdminApp.bulkAcceptPendingUserInOrganization(
        FILIGRAN_ORGA_ID,
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
      requestContext.set(requestContextThalesUser);
      const userToRemove = createdUsers[0];
      await usersAdminApp.bulkAcceptPendingUserInOrganization(
        THALES_ORGA_ID,
        [userToRemove!.id],
        undefined,
        [],
        []
      );

      expect(mockAcceptPendingUser).toHaveBeenCalledExactlyOnceWith({
        user_id: userToRemove!.id,
        organization_id: THALES_ORGA_ID,
        orgCapabilities: [],
      });
    });

    it('should accept users by filter', async () => {
      requestContext.set(requestContextThalesUser);
      await usersAdminApp.bulkAcceptPendingUserInOrganization(
        THALES_ORGA_ID,
        [],
        undefined,
        [
          {
            key: FilterKey.OrganizationId,
            value: [toGlobalId('Organization', THALES_ORGA_ID)],
          },
        ],
        []
      );

      expect(mockAcceptPendingUser).toHaveBeenCalledWith({
        user_id: createdUsers[0]!.id,
        organization_id: THALES_ORGA_ID,
        orgCapabilities: [],
      });
      expect(mockAcceptPendingUser).toHaveBeenCalledWith({
        user_id: createdUsers[1]!.id,
        organization_id: THALES_ORGA_ID,
        orgCapabilities: [],
      });
    });
    it('should accept users by filters and excludedIds', async () => {
      requestContext.set(requestContextThalesUser);
      const excludedUser = createdUsers[0];

      await usersAdminApp.bulkAcceptPendingUserInOrganization(
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

      expect(mockAcceptPendingUser).toHaveBeenCalledExactlyOnceWith({
        user_id: createdUsers[1]!.id,
        organization_id: THALES_ORGA_ID,
        orgCapabilities: [],
      });
    });
    it('should accept users by searchTerm', async () => {
      requestContext.set(requestContextThalesUser);
      const acceptedUser = createdUsers.find(
        (user) => user.email === 'testOne@thales.com'
      );

      await usersAdminApp.bulkAcceptPendingUserInOrganization(
        THALES_ORGA_ID,
        [],
        'One',
        [],
        []
      );

      expect(mockAcceptPendingUser).toHaveBeenCalledExactlyOnceWith({
        user_id: acceptedUser!.id,
        organization_id: THALES_ORGA_ID,
        orgCapabilities: [],
      });
    });

    it('should accept users by searchTerm and excludedIds', async () => {
      requestContext.set(requestContextThalesUser);
      const acceptedUser = createdUsers.find(
        (user) => user.email === 'testTwo@thales.com'
      );
      const nonAcceptedUser = createdUsers.find(
        (user) => user.email === 'testOne@thales.com'
      );

      await usersAdminApp.bulkAcceptPendingUserInOrganization(
        THALES_ORGA_ID,
        [],
        'test',
        [],
        [nonAcceptedUser!.id]
      );

      expect(mockAcceptPendingUser).toHaveBeenCalledExactlyOnceWith({
        user_id: acceptedUser!.id,
        organization_id: THALES_ORGA_ID,
        orgCapabilities: [],
      });
    });

    it('should accept users by filter, searchTerm and excludedIds', async () => {
      requestContext.set(requestContextThalesUser);
      const acceptedUser = createdUsers.find(
        (user) => user.email === 'testTwo@thales.com'
      );
      const nonAcceptedUser = createdUsers.find(
        (user) => user.email === 'testOne@thales.com'
      );
      await usersAdminApp.bulkAcceptPendingUserInOrganization(
        THALES_ORGA_ID,
        [],
        'test',
        [
          {
            key: FilterKey.OrganizationId,
            value: [toGlobalId('Organization', THALES_ORGA_ID)],
          },
        ],
        [nonAcceptedUser!.id]
      );

      expect(mockAcceptPendingUser).toHaveBeenCalledExactlyOnceWith({
        user_id: acceptedUser!.id,
        organization_id: THALES_ORGA_ID,
        orgCapabilities: [],
      });
    });
    it('should accept only users from the specified organization', async () => {
      const acceptedUser = createdUsers.find(
        (user) => user.email === 'testFiligran@filigran.io'
      );

      await usersAdminApp.bulkAcceptPendingUserInOrganization(
        FILIGRAN_ORGA_ID,
        [],
        undefined,
        [],
        []
      );

      expect(mockAcceptPendingUser).toHaveBeenCalledExactlyOnceWith({
        user_id: acceptedUser!.id,
        organization_id: FILIGRAN_ORGA_ID,
        orgCapabilities: [],
      });
    });
  });
  describe('bulkRemovePendingUserFromOrganization', () => {
    let createdUsers: User[];
    beforeEach(async () => {
      createdUsers = [];
      const filigranOrga = await loadOrganizationBy({ id: FILIGRAN_ORGA_ID });
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
      requestContext.set(requestContextThalesUser);
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

      const call = usersAdminApp.bulkRemovePendingUserFromOrganization(
        FILIGRAN_ORGA_ID,
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
