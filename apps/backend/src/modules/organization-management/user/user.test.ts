import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  // eslint-disable-next-line no-restricted-imports
  requestContextAdminUser,
  TEST_ORGANIZATIONS,
} from '../../../../tests/tests.const';
import { OrganizationCapability } from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import Organization, {
  OrganizationId,
} from '../../../model/kanel/public/Organization';
import { UserId } from '../../../model/kanel/public/User';
import { UserLoadUserBy } from '../../../model/user';
import * as MailService from '../../../server/mail-service';
import { logApp } from '../../../utils/app-logger.util';
import { ErrorCode } from '../../../utils/error/error.code';
import { UserOrganizationCapabilityDomain } from '../../security-management/user-organization-capability/user-organization-capability.domain';
import { TelemetryApp } from '../../telemetry/telemetry.app';
import { TelemetrySource } from '../../telemetry/telemetry.const';
import { TelemetryEventType } from '../../telemetry/telemetry.types';
import { OrganizationDomain } from '../organization/organization.domain';
import { UserDomain } from './user-domain/user.domain';
import { UserOrganizationDomain } from './user-organization/user-organization.domain';
import { UserOrganizationPendingDomain } from './user-pending/user-organization-pending.domain';
import { isUserLastOrganizationAdministrator, UserHelper } from './user.helper';

describe('user helpers', async () => {
  afterEach(async () => {
    vi.useRealTimers();
  });
  describe('createNewUserFromInvitation', () => {
    it('should create a new user with Role USER and not add in an existing Organization, but in pending organization', async () => {
      const testMail = `testCreateNewUserFromInvitation${uuidv4()}@filigran.io`;
      await UserHelper.createNewUserFromInvitation({
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
      await UserHelper.removeUser({ email: newUser.email });
    });
    it('should add new user with Role admin organization with an new Organization', async () => {
      const organizationName = 'test-new-organization.fr';
      const testMail = `testCreateNewUserFromInvitation${uuidv4()}@${organizationName}`;

      vi.useFakeTimers();
      const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
      vi.setSystemTime(date);
      const telemetrySpy = vi
        .spyOn(TelemetryApp, 'sendTelemetryEvent')
        .mockResolvedValue();

      await UserHelper.createNewUserFromInvitation({
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
      await UserHelper.removeUser({ email: testMail });
      await OrganizationDomain.deleteOrganizationBy({ name: organizationName });
    });

    it('should create a new user with Role USER and should not add it to pending organization if orga does not exist', async () => {
      const testMail = `testCreateNewUserFromInvitation${uuidv4()}@whatever.io`;
      await UserHelper.createNewUserFromInvitation({
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

    it('should send a welcome email by default when creating a new user', async () => {
      const sendMailSpy = vi.spyOn(MailService, 'sendMail').mockResolvedValue();
      const testMail = `testWelcomeEmail${uuidv4()}@whatever.io`;

      await UserHelper.createNewUserFromInvitation({ email: testMail });

      expect(sendMailSpy).toHaveBeenCalledWith(
        expect.objectContaining({ to: testMail, template: 'welcome' })
      );

      await UserHelper.removeUser({ email: testMail });
      sendMailSpy.mockRestore();
    });

    it('should not send a welcome email when sendWelcomeEmail is false', async () => {
      const sendMailSpy = vi.spyOn(MailService, 'sendMail').mockResolvedValue();
      const testMail = `testWelcomeEmail${uuidv4()}@whatever.io`;

      await UserHelper.createNewUserFromInvitation(
        { email: testMail },
        { sendWelcomeEmail: false }
      );

      expect(sendMailSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({ template: 'welcome' })
      );

      await UserHelper.removeUser({ email: testMail });
      sendMailSpy.mockRestore();
    });
  });

  describe('delete last administrator prevention', () => {
    const organizationName = 'test-new-organization.fr';
    let organization: Organization;
    let user: UserLoadUserBy;
    let anotherUser: UserLoadUserBy | undefined;

    beforeEach(async () => {
      const userEmail = `testLastOrganizationAdministrator${uuidv4()}@${organizationName}`;
      await UserHelper.createNewUserFromInvitation({
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
        await UserHelper.removeUser({ email: user.email });
      }
      if (anotherUser) {
        await UserHelper.removeUser({ email: anotherUser.email });
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
        const call = UserHelper.preventAdministratorRemovalOfOneOrganization(
          user.id,
          organization.id
        );

        await expect(call).rejects.toThrow('CANT_REMOVE_LAST_ADMINISTRATOR');
      });

      it(`should not throw when another user in the organization has ${OrganizationCapability.AdministrateOrganization}`, async () => {
        requestContext.set(requestContextAdminUser);

        const anotherUserEmail = `testLastOrganizationAdministrator-anotherUser${uuidv4()}@${organizationName}`;
        await UserHelper.createNewUserFromInvitation({
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

        await UserOrganizationCapabilityDomain.createUserOrganizationCapability(
          {
            user_organization_id: anotherUserOrgRelation!.id,
            capabilities_name: [
              OrganizationCapability.AdministrateOrganization,
            ],
          }
        );

        const result =
          await UserHelper.preventAdministratorRemovalOfOneOrganization(
            user.id,
            organization.id
          );

        expect(result).toBeUndefined();
      });
    });

    describe('preventAdministratorRemovalOfAllOrganizations', () => {
      it(`should throw an error when user is the last with ${OrganizationCapability.AdministrateOrganization} and we specify empty capabilities`, async () => {
        const call = UserHelper.preventAdministratorRemovalOfAllOrganizations(
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
        const call = UserHelper.preventAdministratorRemovalOfAllOrganizations(
          user.id,
          []
        );

        await expect(call).rejects.toThrow('CANT_REMOVE_LAST_ADMINISTRATOR');
      });

      it(`should not throw when another user in the organization has ${OrganizationCapability.AdministrateOrganization} and we remove its capabilities`, async () => {
        requestContext.set(requestContextAdminUser);

        const anotherUserEmail = `testLastOrganizationAdministrator-anotherUser${uuidv4()}@${organizationName}.fr`;
        await UserHelper.createNewUserFromInvitation({
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

        await UserOrganizationCapabilityDomain.createUserOrganizationCapability(
          {
            user_organization_id: anotherUserOrgRelation!.id,
            capabilities_name: [
              OrganizationCapability.AdministrateOrganization,
            ],
          }
        );

        const result =
          await UserHelper.preventAdministratorRemovalOfOneOrganization(
            user.id,
            organization.id,
            []
          );

        expect(result).toBeUndefined();
      });
    });
  });

  describe('isUserLastOrganizationAdministrator', () => {
    it('should return false when user does not have administrator capability', async () => {
      const loadUserCapabilitiesByOrganizationSpy = vi
        .spyOn(UserDomain, 'loadUserCapabilitiesByOrganization')
        .mockResolvedValue({
          capabilities: [OrganizationCapability.ManageAccess],
        } as never);
      const countOrganizationAdministratorsSpy = vi.spyOn(
        UserOrganizationDomain,
        'countOrganizationAdministrators'
      );

      const result = await isUserLastOrganizationAdministrator(
        uuidv4() as UserId,
        uuidv4() as OrganizationId
      );

      expect(result).toBe(false);
      expect(countOrganizationAdministratorsSpy).not.toHaveBeenCalled();

      loadUserCapabilitiesByOrganizationSpy.mockRestore();
      countOrganizationAdministratorsSpy.mockRestore();
    });

    it('should log and return true when no administrator is found', async () => {
      const userId = uuidv4() as UserId;
      const organizationId = uuidv4() as OrganizationId;
      const loadUserCapabilitiesByOrganizationSpy = vi
        .spyOn(UserDomain, 'loadUserCapabilitiesByOrganization')
        .mockResolvedValue({
          capabilities: [OrganizationCapability.AdministrateOrganization],
        } as never);
      const countOrganizationAdministratorsSpy = vi
        .spyOn(UserOrganizationDomain, 'countOrganizationAdministrators')
        .mockResolvedValue(0);
      const logErrorSpy = vi.spyOn(logApp, 'error').mockImplementation(() => {
        return undefined as never;
      });

      const result = await isUserLastOrganizationAdministrator(
        userId,
        organizationId
      );

      expect(result).toBe(true);
      expect(logErrorSpy).toHaveBeenCalledWith(
        `Zero administrators found in the organization ${organizationId}`
      );

      loadUserCapabilitiesByOrganizationSpy.mockRestore();
      countOrganizationAdministratorsSpy.mockRestore();
      logErrorSpy.mockRestore();
    });
  });
});
