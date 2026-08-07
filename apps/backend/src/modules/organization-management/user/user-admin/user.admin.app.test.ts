import { MockInstance } from '@vitest/spy';
import { toGlobalId } from 'graphql-relay/node/node';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  TEST_ORGANIZATIONS,
  requestContextAdminSecondOrga,
  // eslint-disable-next-line no-restricted-imports -- needed to test platform admin bypass behavior in editUser authorization
  requestContextAdminUser,
  requestContextSimpleUserSecondOrga,
} from '../../../../../tests/tests.const';
import {
  FilterKey,
  OrganizationCapability,
} from '../../../../__generated__/resolvers-types';
import { requestContext } from '../../../../context/request.context';
import { OrganizationId } from '../../../../model/kanel/public/Organization';
import User from '../../../../model/kanel/public/User';
import { UserLoadUserBy } from '../../../../model/user';
import { ErrorCode } from '../../../../utils/error/error.code';
import { OrganizationDomain } from '../../organization/organization.domain';
import { UserDomain } from '../user-domain/user.domain';
import { UserOrganizationPendingDomain } from '../user-pending/user-organization-pending.domain';
import { UserHelper } from '../user.helper';
import { UserAdminApp } from './user.admin.app';

describe('users admin app', () => {
  describe('editUser', () => {
    describe('authorization', () => {
      it('should reject a user without org capabilities', async () => {
        requestContext.set(requestContextSimpleUserSecondOrga);

        const call = UserAdminApp.editUser({
          userId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID,
          input: { organization_capabilities: [] },
        });

        await expect(call).rejects.toThrow(
          ErrorCode.MissingCapabilityOnOrganization
        );
      });

      it('should reject an org admin trying to edit a user from a different organization', async () => {
        requestContext.set(requestContextAdminSecondOrga);

        const call = UserAdminApp.editUser({
          userId: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE.ID,
          input: { organization_capabilities: [] },
        });

        await expect(call).rejects.toThrow(ErrorCode.UserIsNotInOrganization);
      });

      it('should reject an org admin trying to set capabilities on an organization they do not control', async () => {
        requestContext.set(requestContextAdminSecondOrga);

        const call = UserAdminApp.editUser({
          userId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID,
          input: {
            organization_capabilities: [
              {
                organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
                capabilities: [],
              },
              {
                organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
                capabilities: [OrganizationCapability.AdministrateOrganization],
              },
            ],
          },
        });

        await expect(call).rejects.toThrow(
          ErrorCode.MissingCapabilityOnOrganization
        );
      });

      it('should allow a platform admin to edit a user from any organization', async () => {
        requestContext.set(requestContextAdminUser);

        const call = UserAdminApp.editUser({
          userId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID,
          input: { organization_capabilities: [], first_name: 'Updated' },
        });

        await expect(call).rejects.not.toThrow(
          ErrorCode.UserIsNotInOrganization
        );
      });
    });

    describe('organization capabilities update', () => {
      let simpleUser: UserLoadUserBy;

      beforeEach(async () => {
        requestContext.set(requestContextAdminUser);
        simpleUser = (await UserDomain.loadUserBy({
          'User.id': TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE.ID,
        }))!;
      });

      afterEach(async () => {
        requestContext.set(requestContextAdminUser);
        await UserAdminApp.editUser({
          userId: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE.ID,
          input: {
            organization_capabilities: (
              simpleUser.organization_capabilities ?? []
            ).map((oc) => ({
              organization_id: oc.organization.id,
              capabilities: oc.capabilities,
            })),
          },
        });
      });

      it('should update organization_capabilities', async () => {
        await UserAdminApp.editUser({
          userId: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE.ID,
          input: {
            organization_capabilities: [
              {
                organization_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE
                  .ID as unknown as OrganizationId,
                capabilities: [
                  OrganizationCapability.ManageAccess,
                  OrganizationCapability.ManageSubscription,
                ],
              },
              {
                organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
                capabilities: [
                  OrganizationCapability.ManageAccess,
                  OrganizationCapability.ManageSubscription,
                ],
              },
              {
                organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
                capabilities: [],
              },
            ],
          },
        });
        const result = (await UserDomain.loadUserBy({
          'User.id': TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE.ID,
        }))!;
        expect(result.organization_capabilities).toHaveLength(3);
      });

      it('should not update other user fields', async () => {
        const result = await UserAdminApp.editUser({
          userId: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE.ID,
          input: {
            organization_capabilities: [
              {
                organization_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE
                  .ID as unknown as OrganizationId,
                capabilities: [
                  OrganizationCapability.ManageAccess,
                  OrganizationCapability.ManageSubscription,
                ],
              },
              {
                organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
                capabilities: [
                  OrganizationCapability.ManageAccess,
                  OrganizationCapability.ManageSubscription,
                ],
              },
            ],
          },
        });

        expect(result.first_name).toBe(simpleUser.first_name);
        expect(result.email).toBe(simpleUser.email);
      });
    });

    describe('last administrator protection', () => {
      it('should prevent deletion of the last organization administrator', async () => {
        requestContext.set(requestContextAdminUser);

        const call = UserAdminApp.editUser({
          userId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID,
          input: {
            organization_capabilities: [
              {
                organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
                capabilities: [],
              },
            ],
          },
        });

        await expect(call).rejects.toThrow(
          ErrorCode.CantRemoveLastAdministrator
        );
      });
    });
  });

  describe('pending request cleanup', () => {
    const email = 'testPendingCleanup@second-orga.com';
    let createdUser: User;

    beforeEach(async () => {
      requestContext.set(requestContextAdminSecondOrga);
      const secondOrga = (await OrganizationDomain.loadOrganizationBy({
        id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
      }))!;
      createdUser = await UserHelper.createNewUserWithPendingOrga(
        { email, first_name: 'pending', last_name: 'cleanup', picture: null },
        secondOrga
      );
    });

    afterEach(async () => {
      vi.restoreAllMocks();
      await UserHelper.removeUser({ email });
    });

    it('should remove the pending request when an admin adds the user directly to the organization', async () => {
      requestContext.set(requestContextAdminSecondOrga);

      const pendingBefore =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          user_id: createdUser.id,
          organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        });
      expect(pendingBefore).toHaveLength(1);

      await UserAdminApp.addUser({
        email,
        organization_capabilities: [
          {
            organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
            capabilities: [],
          },
        ],
      });

      const pendingAfter =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          user_id: createdUser.id,
          organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        });
      expect(pendingAfter).toHaveLength(0);
    });

    it('should remove the pending request when an admin edits the user into the organization', async () => {
      requestContext.set(requestContextAdminUser);

      const pendingBefore =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          user_id: createdUser.id,
          organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        });
      expect(pendingBefore).toHaveLength(1);

      await UserAdminApp.editUser({
        userId: createdUser.id,
        input: {
          organization_capabilities: [
            {
              organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
              capabilities: [],
            },
          ],
        },
      });

      const pendingAfter =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          user_id: createdUser.id,
          organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        });
      expect(pendingAfter).toHaveLength(0);
    });

    it('should not notify the deletion when the transaction rolls back', async () => {
      requestContext.set(requestContextAdminSecondOrga);

      const dispatchSpy = vi.spyOn(UserHelper, 'dispatchPendingDeleted');
      vi.spyOn(UserDomain, 'loadUserBy').mockRejectedValueOnce(
        new Error('boom')
      );

      const call = UserAdminApp.addUser({
        email,
        organization_capabilities: [
          {
            organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
            capabilities: [],
          },
        ],
      });

      await expect(call).rejects.toThrow('boom');
      expect(dispatchSpy).not.toHaveBeenCalled();

      // the pending request must survive the rollback
      const pendingAfter =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          user_id: createdUser.id,
          organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        });
      expect(pendingAfter).toHaveLength(1);
    });
  });

  describe('bulkAcceptPendingUserInOrganization', () => {
    let createdUsers: User[];
    let mockAcceptPendingUser: MockInstance<
      typeof UserHelper.acceptPendingUserWithCapabilities
    >;
    beforeEach(async () => {
      createdUsers = [];
      mockAcceptPendingUser = vi.spyOn(
        UserHelper,
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
      const secondOrga = (await OrganizationDomain.loadOrganizationBy({
        id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
      }))!;

      createdUsers = await Promise.all(
        userList.map((user) =>
          UserHelper.createNewUserWithPendingOrga(user, secondOrga)
        )
      );

      const filigranOrga = (await OrganizationDomain.loadOrganizationBy({
        id: TEST_ORGANIZATIONS.FILIGRAN.ID,
      }))!;
      const filigranUser = await UserHelper.createNewUserWithPendingOrga(
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
        createdUsers.map((user) => UserHelper.removeUser({ email: user.email }))
      );
      vi.clearAllMocks();
    });

    it('should throw if user is not allowed on orga', async () => {
      requestContext.set(requestContextAdminSecondOrga);
      const userToRemove = createdUsers[0];

      const call = UserAdminApp.bulkAcceptPendingUserInOrganization(
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
      await UserAdminApp.bulkAcceptPendingUserInOrganization(
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
      await UserAdminApp.bulkAcceptPendingUserInOrganization(
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

      await UserAdminApp.bulkAcceptPendingUserInOrganization(
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

      await UserAdminApp.bulkAcceptPendingUserInOrganization(
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

      await UserAdminApp.bulkAcceptPendingUserInOrganization(
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
      await UserAdminApp.bulkAcceptPendingUserInOrganization(
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

      await UserAdminApp.bulkAcceptPendingUserInOrganization(
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
      const filigranOrga = (await OrganizationDomain.loadOrganizationBy({
        id: TEST_ORGANIZATIONS.FILIGRAN.ID,
      }))!;
      const filigranUser = await UserHelper.createNewUserWithPendingOrga(
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
        createdUsers.map((user) => UserHelper.removeUser({ email: user.email }))
      );
    });
    it('should throw if user is not allowed on orga', async () => {
      requestContext.set(requestContextAdminSecondOrga);
      const filigranOrga = (await OrganizationDomain.loadOrganizationBy({
        id: TEST_ORGANIZATIONS.FILIGRAN.ID,
      }))!;
      const filigranUser = await UserHelper.createNewUserWithPendingOrga(
        {
          email: 'testFiligran@filigran.io',
          first_name: 'test',
          last_name: 'filigran',
          picture: null,
        },
        filigranOrga
      );

      const call = UserAdminApp.bulkRemovePendingUserFromOrganization(
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
