import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  // eslint-disable-next-line no-restricted-imports
  requestContextAdminUser,
  TEST_ORGANIZATIONS,
} from '../../../../tests/tests.const';
import { OrganizationCapability } from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import Organization from '../../../model/kanel/public/Organization';
import { UserId } from '../../../model/kanel/public/User';
import { UserLoadUserBy } from '../../../model/user';
import { ErrorCode } from '../../../utils/error/error.code';
import { createUserOrganizationCapability } from '../../security-management/user-organization-capability/user-organization-capability.domain';
import { telemetryApp } from '../../telemetry/telemetry.app';
import { TelemetrySource } from '../../telemetry/telemetry.const';
import { TelemetryEventType } from '../../telemetry/telemetry.types';
import { OrganizationDomain } from '../organization/organization.domain';
import { UserDomain } from './user-domain/user.domain';
import { UserOrganizationDomain } from './user-organization/user-organization.domain';
import { UserOrganizationPendingDomain } from './user-pending/user-organization-pending.domain';
import {
  createNewUserFromInvitation,
  preventAdministratorRemovalOfAllOrganizations,
  preventAdministratorRemovalOfOneOrganization,
  removeUser,
} from './user.helper';

describe('user helpers', async () => {
  afterEach(async () => {
    vi.useRealTimers();
  });
  describe('createNewUserFromInvitation', () => {
    it('should create a new user with Role USER and not add in an existing Organization, but in pending organization', async () => {
      const testMail = `testCreateNewUserFromInvitation${uuidv4()}@filigran.io`;
      await createNewUserFromInvitation({
        email: testMail,
      });
      const newUser = (await UserDomain.loadUserBy({ email: testMail }))!;
      const newUserPendingOrg =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          user_id: newUser.id,
        });
      expect(newUser).toBeTruthy();
      expect(newUser.selected_org_capabilities).toHaveLength(1);
      expect(newUser.organizations[0]?.personal_space).toBe(true);
      expect(newUserPendingOrg).toHaveLength(1);
      expect(newUserPendingOrg[0]?.organization_id).toBe(
        TEST_ORGANIZATIONS.FILIGRAN.ID
      );

      // Delete corresponding in order to avoid issue with other tests
      await removeUser({ email: newUser.email });
    });
    it('should add new user with Role admin organization with an new Organization', async () => {
      const organizationName = 'test-new-organization.fr';
      const testMail = `testCreateNewUserFromInvitation${uuidv4()}@${organizationName}`;

      vi.useFakeTimers();
      const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
      vi.setSystemTime(date);
      const telemetrySpy = vi
        .spyOn(telemetryApp, 'sendTelemetryEvent')
        .mockResolvedValue();

      await createNewUserFromInvitation({
        email: testMail,
      });
      const newUser = (await UserDomain.loadUserBy({ email: testMail }))!;
      const newUserPendingOrg =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          user_id: newUser.id,
        });

      expect(newUser).toBeTruthy();
      expect(newUserPendingOrg).toHaveLength(0);

      const newOrganization = await OrganizationDomain.loadOrganizationBy({
        name: organizationName,
      });
      if (!newOrganization) {
        throw new Error(ErrorCode.OrganizationNotFound);
      }
      const userOrgCapa = await UserDomain.loadUserCapabilitiesByOrganization(
        newUser.id as UserId,
        newOrganization.id
      );
      expect(userOrgCapa.capabilities?.length).toBe(1);
      expect(
        userOrgCapa.capabilities?.includes(
          OrganizationCapability.AdministrateOrganization
        )
      ).toBeTruthy();

      expect(newOrganization).toBeTruthy();

      expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
        '@timestamp': '2025-02-03T13:12:15.000Z',
        event_type: TelemetryEventType.CREATE_ORGANIZATION,
        organization_id: expect.any(String),
        organization_name: newOrganization.name,
        organization_type: 'Professional',
        source: TelemetrySource.XTMHUB,
        user_id: newUser!.id,
        domains: ['test-new-organization.fr'],
      });

      // Delete corresponding in order to avoid issue with other tests
      await removeUser({ email: testMail });
      await OrganizationDomain.deleteOrganizationBy({ name: organizationName });
    });

    it('should create a new user with Role USER and should not add it to pending organization if orga does not exist', async () => {
      const testMail = `testCreateNewUserFromInvitation${uuidv4()}@whatever.io`;
      await createNewUserFromInvitation({
        email: testMail,
      });
      const newUser = (await UserDomain.loadUserBy({ email: testMail }))!;
      const newUserPendingOrg =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          user_id: newUser.id,
        });
      expect(newUser).toBeTruthy();
      expect(newUser.selected_org_capabilities).toHaveLength(1);

      expect(newUserPendingOrg).toHaveLength(0);
    });
  });

  describe('delete last administrator prevention', () => {
    const organizationName = 'test-new-organization.fr';
    let organization: Organization;
    let user: UserLoadUserBy;
    let anotherUser: UserLoadUserBy | undefined;

    beforeEach(async () => {
      const userEmail = `testLastOrganizationAdministrator${uuidv4()}@${organizationName}`;
      await createNewUserFromInvitation({
        email: userEmail,
      });
      const loadedOrganization = await OrganizationDomain.loadOrganizationBy({
        name: organizationName,
      });

      expect(loadedOrganization).toBeTruthy();
      organization = loadedOrganization!;
      const loadedUser = await UserDomain.loadUserBy({ email: userEmail });
      user = loadedUser!;
    });

    afterEach(async () => {
      if (user) {
        await removeUser({ email: user.email });
      }
      if (anotherUser) {
        await removeUser({ email: anotherUser.email });
        anotherUser = undefined;
      }
      if (organization) {
        await OrganizationDomain.deleteOrganizationBy({
          name: organizationName,
        });
      }
    });

    describe('preventAdministratorRemovalOfOneOrganization', () => {
      it(`should throw an error when user is the last with ${OrganizationCapability.AdministrateOrganization}`, async () => {
        const call = preventAdministratorRemovalOfOneOrganization(
          user.id,
          organization.id
        );

        await expect(call).rejects.toThrow('CANT_REMOVE_LAST_ADMINISTRATOR');
      });

      it(`should not throw when another user in the organization has ${OrganizationCapability.AdministrateOrganization}`, async () => {
        requestContext.set(requestContextAdminUser);

        const anotherUserEmail = `testLastOrganizationAdministrator-anotherUser${uuidv4()}@${organizationName}`;
        await createNewUserFromInvitation({
          email: anotherUserEmail,
        });

        anotherUser = (await UserDomain.loadUserBy({
          'User.email': anotherUserEmail,
        }))!;

        const [anotherUserOrgRelation] =
          await UserOrganizationDomain.createUserOrganizationRelationAndRemovePending(
            {
              user_id: anotherUser.id,
              organizations_id: [organization.id],
            }
          );
        expect(anotherUserOrgRelation).toBeTruthy();

        await createUserOrganizationCapability({
          user_organization_id: anotherUserOrgRelation!.id,
          capabilities_name: [OrganizationCapability.AdministrateOrganization],
        });

        const result = await preventAdministratorRemovalOfOneOrganization(
          user.id,
          organization.id
        );

        expect(result).toBeUndefined();
      });
    });

    describe('preventAdministratorRemovalOfAllOrganizations', () => {
      it(`should throw an error when user is the last with ${OrganizationCapability.AdministrateOrganization} and we specify empty capabilities`, async () => {
        const call = preventAdministratorRemovalOfAllOrganizations(user.id, [
          {
            organizationId: organization.id,
            capabilities: [],
          },
        ]);

        await expect(call).rejects.toThrow('CANT_REMOVE_LAST_ADMINISTRATOR');
      });

      it(`should throw an error when user is the last with ${OrganizationCapability.AdministrateOrganization} and we don't specify new capabilities`, async () => {
        const call = preventAdministratorRemovalOfAllOrganizations(user.id, []);

        await expect(call).rejects.toThrow('CANT_REMOVE_LAST_ADMINISTRATOR');
      });

      it(`should not throw when another user in the organization has ${OrganizationCapability.AdministrateOrganization} and we remove its capabilities`, async () => {
        requestContext.set(requestContextAdminUser);

        const anotherUserEmail = `testLastOrganizationAdministrator-anotherUser${uuidv4()}@${organizationName}.fr`;
        await createNewUserFromInvitation({
          email: anotherUserEmail,
        });

        anotherUser = (await UserDomain.loadUserBy({
          'User.email': anotherUserEmail,
        }))!;

        const [anotherUserOrgRelation] =
          await UserOrganizationDomain.createUserOrganizationRelationAndRemovePending(
            {
              user_id: anotherUser.id,
              organizations_id: [organization.id],
            }
          );
        expect(anotherUserOrgRelation).toBeTruthy();

        await createUserOrganizationCapability({
          user_organization_id: anotherUserOrgRelation!.id,
          capabilities_name: [OrganizationCapability.AdministrateOrganization],
        });

        const result = await preventAdministratorRemovalOfOneOrganization(
          user.id,
          organization.id,
          []
        );

        expect(result).toBeUndefined();
      });
    });
  });
});
