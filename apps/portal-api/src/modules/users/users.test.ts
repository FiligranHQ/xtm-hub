import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TEST_ORGANIZATIONS } from '../../../tests/tests.const';
import { OrganizationCapability } from '../../__generated__/resolvers-types';
import Organization from '../../model/kanel/public/Organization';
import { UserId } from '../../model/kanel/public/User';
import { UserLoadUserBy } from '../../model/user';
import { createUserOrganizationCapability } from '../common/user-organization-capability.domain';
import { createUserOrganizationRelationAndRemovePending } from '../common/user-organization.helper';
import {
  deleteOrganizationBy,
  loadOrganizationBy,
} from '../organizations/organizations.domain';
import { telemetryApp } from '../telemetry/telemetry.app';
import { TelemetrySource } from '../telemetry/telemetry.const';
import { TelemetryEventType } from '../telemetry/telemetry.types';
import { UserOrganizationPendingDomain } from './users-pending/user-organization-pending.domain';
import { loadUserBy, loadUserCapabilitiesByOrganization } from './users.domain';
import {
  createNewUserFromInvitation,
  preventAdministratorRemovalOfAllOrganizations,
  preventAdministratorRemovalOfOneOrganization,
  removeUser,
} from './users.helper';

describe('User helpers', async () => {
  afterEach(async () => {
    vi.useRealTimers();
  });
  describe('createNewUserFromInvitation', () => {
    it('should create a new user with Role USER and not add in an existing Organization, but in pending organization', async () => {
      const testMail = `testCreateNewUserFromInvitation${uuidv4()}@filigran.io`;
      await createNewUserFromInvitation({
        email: testMail,
      });
      const newUser = await loadUserBy({ email: testMail });
      const newUserPendingOrg =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          user_id: newUser.id,
        });
      expect(newUser).toBeTruthy();
      expect(newUser.selected_org_capabilities.length).toBe(1);
      expect(newUser.organizations[0].personal_space).toBe(true);
      expect(newUserPendingOrg.length).toBe(1);
      expect(newUserPendingOrg[0].organization_id).toBe(
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
      const newUser = await loadUserBy({ email: testMail });
      const newUserPendingOrg =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          user_id: newUser.id,
        });

      expect(newUser).toBeTruthy();
      expect(newUserPendingOrg.length).toBe(0);

      const newOrganization = await loadOrganizationBy({
        name: organizationName,
      });
      const userOrgCapa = await loadUserCapabilitiesByOrganization(
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
        user_id: newUser.id,
        domains: ['test-new-organization.fr'],
      });

      // Delete corresponding in order to avoid issue with other tests
      await removeUser({ email: testMail });
      await deleteOrganizationBy({ name: organizationName });
    });

    it('should create a new user with Role USER and should not add it to pending organization if orga does not exist', async () => {
      const testMail = `testCreateNewUserFromInvitation${uuidv4()}@whatever.io`;
      await createNewUserFromInvitation({
        email: testMail,
      });
      const newUser = await loadUserBy({ email: testMail });
      const newUserPendingOrg =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          user_id: newUser.id,
        });
      expect(newUser).toBeTruthy();
      expect(newUser.selected_org_capabilities.length).toBe(1);

      expect(newUserPendingOrg.length).toBe(0);
    });
  });

  describe('delete last administrator prevention', () => {
    const organizationName = 'test-new-organization.fr';
    let organization: Organization;
    let user: UserLoadUserBy;
    let anotherUser: UserLoadUserBy;

    beforeEach(async () => {
      const userEmail = `testLastOrganizationAdministrator${uuidv4()}@${organizationName}`;
      await createNewUserFromInvitation({
        email: userEmail,
      });
      organization = await loadOrganizationBy({ name: organizationName });

      expect(organization).toBeTruthy();

      user = await loadUserBy({ email: userEmail });
    });

    afterEach(async () => {
      if (user) {
        await removeUser({ email: user.email });
        user = null;
      }
      if (anotherUser) {
        await removeUser({ email: anotherUser.email });
        anotherUser = null;
      }
      if (organization) {
        await deleteOrganizationBy({ name: organizationName });
        organization = null;
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
        const anotherUserEmail = `testLastOrganizationAdministrator-anotherUser${uuidv4()}@${organizationName}`;
        await createNewUserFromInvitation({
          email: anotherUserEmail,
        });

        anotherUser = await loadUserBy({
          'User.email': anotherUserEmail,
        });

        const [anotherUserOrgRelation] =
          await createUserOrganizationRelationAndRemovePending({
            user_id: anotherUser.id,
            organizations_id: [organization.id],
          });
        expect(anotherUserOrgRelation).toBeTruthy();

        await createUserOrganizationCapability({
          user_organization_id: anotherUserOrgRelation.id,
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
        const anotherUserEmail = `testLastOrganizationAdministrator-anotherUser${uuidv4()}@${organizationName}.fr`;
        await createNewUserFromInvitation({
          email: anotherUserEmail,
        });

        anotherUser = await loadUserBy({
          'User.email': anotherUserEmail,
        });

        const [anotherUserOrgRelation] =
          await createUserOrganizationRelationAndRemovePending({
            user_id: anotherUser.id,
            organizations_id: [organization.id],
          });
        expect(anotherUserOrgRelation).toBeTruthy();

        await createUserOrganizationCapability({
          user_organization_id: anotherUserOrgRelation.id,
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
