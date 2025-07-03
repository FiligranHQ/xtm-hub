import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { contextAdminUser } from '../../../tests/tests.const';
import { OrganizationCapability } from '../../__generated__/resolvers-types';
import Organization from '../../model/kanel/public/Organization';
import { UserId } from '../../model/kanel/public/User';
import { UserLoadUserBy } from '../../model/user';
import { createUserOrganizationCapability } from '../common/user-organization-capability.domain';
import { createUserOrganizationRelationUnsecure } from '../common/user-organization.domain';
import {
  deleteOrganizationByName,
  loadUnsecureOrganizationBy,
} from '../organizations/organizations.helper';
import { loadUserBy, loadUserCapabilitiesByOrganization } from './users.domain';
import {
  createNewUserFromInvitation,
  preventAdministratorRemovalOfAllOrganizations,
  preventAdministratorRemovalOfOneOrganization,
  removeUser,
} from './users.helper';

describe('User helpers', async () => {
  describe('createNewUserFromInvitation', () => {
    it('should create a new user with Role USER and not add in an existing Organization', async () => {
      const testMail = `testCreateNewUserFromInvitation${uuidv4()}@filigran.io`;
      await createNewUserFromInvitation({
        email: testMail,
      });
      const newUser = await loadUserBy({ email: testMail });
      expect(newUser).toBeTruthy();
      expect(newUser.selected_org_capabilities.length).toBe(1);
      expect(newUser.organizations[0].personal_space).toBe(true);

      // Delete corresponding in order to avoid issue with other tests
      await removeUser(contextAdminUser, { email: newUser.email });
    });
    it('should add new user with Role admin organization with an new Organization', async () => {
      const testMail = `testCreateNewUserFromInvitation${uuidv4()}@test-new-organization.fr`;
      await createNewUserFromInvitation({
        email: testMail,
      });
      const newUser = await loadUserBy({ email: testMail });
      expect(newUser).toBeTruthy();
      const newOrganization = await loadUnsecureOrganizationBy(
        'name',
        'test-new-organization'
      );
      const userOrgCapa = await loadUserCapabilitiesByOrganization(
        newUser.id as UserId,
        newOrganization.id
      );
      expect(userOrgCapa.capabilities.length).toBe(1);
      expect(
        userOrgCapa.capabilities.includes(
          OrganizationCapability.AdministrateOrganization
        )
      ).toBeTruthy();

      expect(newOrganization).toBeTruthy();

      // Delete corresponding in order to avoid issue with other tests
      await removeUser(contextAdminUser, { email: testMail });
      await deleteOrganizationByName('test-new-organization');
    });
  });

  describe('delete last administrator prevention', () => {
    const organizationName = 'test-new-organization';
    let organization: Organization;
    let user: UserLoadUserBy;
    let anotherUser: UserLoadUserBy;

    beforeEach(async () => {
      const userEmail = `testLastOrganizationAdministrator${uuidv4()}@${organizationName}.fr`;
      await createNewUserFromInvitation({
        email: userEmail,
      });
      organization = await loadUnsecureOrganizationBy('name', organizationName);

      expect(organization).toBeTruthy();

      user = await loadUserBy({ email: userEmail });
    });

    afterEach(async () => {
      if (user) {
        await removeUser(contextAdminUser, { email: user.email });
        user = null;
      }
      if (anotherUser) {
        await removeUser(contextAdminUser, { email: anotherUser.email });
        anotherUser = null;
      }
      if (organization) {
        await deleteOrganizationByName(organizationName);
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
        const anotherUserEmail = `testLastOrganizationAdministrator-anotherUser${uuidv4()}@${organizationName}.fr`;
        await createNewUserFromInvitation({
          email: anotherUserEmail,
        });

        anotherUser = await loadUserBy({
          'User.email': anotherUserEmail,
        });

        const [anotherUserOrgRelation] =
          await createUserOrganizationRelationUnsecure({
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
        const call = preventAdministratorRemovalOfAllOrganizations(
          contextAdminUser,
          user.id,
          [
            {
              organizationId: organization.id,
              capabilities: [],
            },
          ]
        );

        await expect(call).rejects.toThrow('CANT_REMOVE_LAST_ADMINISTRATOR');
      });

      it(`should throw an error when user is the last with ${OrganizationCapability.AdministrateOrganization} and we don't specify new capabilities`, async () => {
        const call = preventAdministratorRemovalOfAllOrganizations(
          contextAdminUser,
          user.id,
          []
        );

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
          await createUserOrganizationRelationUnsecure({
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
