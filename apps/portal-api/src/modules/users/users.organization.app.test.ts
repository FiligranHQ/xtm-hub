import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import portalConfig from '../../config';
import User, { UserId } from '../../model/kanel/public/User';
import { PLATFORM_ORGANIZATION_UUID } from '../../portal.const';
import * as MailService from '../../server/mail-service';
import { UserOrganizationPendingDomain } from './users-pending/user-organization-pending.domain';
import { UsersOrganizationApp } from './users.organization.app';

describe('UsersOrganizationApp', () => {
  describe('sendPendingUsersDigest', () => {
    let originalEnabledEmails: typeof portalConfig.enabled_emails;

    beforeEach(async () => {
      originalEnabledEmails = portalConfig.enabled_emails;
    });

    afterEach(async () => {
      portalConfig.enabled_emails = originalEnabledEmails;
      vi.restoreAllMocks();
    });

    const mockLoadOrganizationsWithPendingUsers = (users: User[]) => {
      vi.spyOn(
        UserOrganizationPendingDomain,
        'loadOrganizationsWithPendingUsers'
      ).mockResolvedValue([
        {
          id: PLATFORM_ORGANIZATION_UUID,
          name: 'organization name',
          users,
        },
      ] as Awaited<
        ReturnType<
          (typeof UserOrganizationPendingDomain)['loadOrganizationsWithPendingUsers']
        >
      >);
    };

    it('should send email to each organization administrators when email is enabled', async () => {
      portalConfig.enabled_emails = {
        ...originalEnabledEmails,
        pending_user_digest: true,
      };

      mockLoadOrganizationsWithPendingUsers([
        {
          id: uuidv4() as UserId,
          email: 'user1@test.com',
          first_name: 'John',
          last_name: 'Doe',
        } as User,
        {
          id: uuidv4() as UserId,
          email: 'user2@test.com',
          first_name: 'Robert',
          last_name: 'Smith',
        } as User,
      ]);

      const sendMailSpy = vi.spyOn(MailService, 'sendMail');
      await UsersOrganizationApp.sendPendingUsersDigest();

      expect(sendMailSpy).toHaveBeenCalledTimes(1);
      expect(sendMailSpy).toHaveBeenCalledWith({
        params: {
          adminName: 'Firstname',
          organizationName: 'organization name',
          userEmailList:
            '<li>John Doe (user1@test.com)</li><li>Robert Smith (user2@test.com)</li>',
          userCount: 2,
          requestLabel: 'requests',
        },
        template: 'organization_pending_user_digest',
        to: 'admin@filigran.io',
      });
    });

    it('should send email to each organization administrators with the correct grammary', async () => {
      portalConfig.enabled_emails = {
        ...originalEnabledEmails,
        pending_user_digest: true,
      };

      vi.spyOn(
        UserOrganizationPendingDomain,
        'loadOrganizationsWithPendingUsers'
      ).mockResolvedValue([
        {
          id: PLATFORM_ORGANIZATION_UUID,
          name: 'organization name',
          users: [
            {
              id: uuidv4() as UserId,
              email: 'user1@test.com',
              first_name: 'John',
              last_name: 'Doe',
            } as User,
          ],
        },
      ] as Awaited<
        ReturnType<
          (typeof UserOrganizationPendingDomain)['loadOrganizationsWithPendingUsers']
        >
      >);

      const sendMailSpy = vi.spyOn(MailService, 'sendMail');
      await UsersOrganizationApp.sendPendingUsersDigest();

      expect(sendMailSpy).toHaveBeenCalledTimes(1);
      expect(sendMailSpy).toHaveBeenCalledWith({
        params: {
          adminName: 'Firstname',
          organizationName: 'organization name',
          userEmailList: '<li>John Doe (user1@test.com)</li>',
          userCount: 1,
          requestLabel: 'request',
        },
        template: 'organization_pending_user_digest',
        to: 'admin@filigran.io',
      });
    });

    it('should not throw when user first name is null', async () => {
      portalConfig.enabled_emails = {
        ...originalEnabledEmails,
        pending_user_digest: true,
      };

      mockLoadOrganizationsWithPendingUsers([
        {
          id: uuidv4() as UserId,
          email: 'user1@test.com',
          first_name: null,
          last_name: 'Smith',
        } as User,
      ]);

      const sendMailSpy = vi.spyOn(MailService, 'sendMail');
      await UsersOrganizationApp.sendPendingUsersDigest();

      expect(sendMailSpy).toHaveBeenCalledTimes(1);
      expect(sendMailSpy).toHaveBeenCalledWith({
        params: {
          adminName: 'Firstname',
          organizationName: 'organization name',
          requestLabel: 'request',
          userEmailList: '<li> Smith (user1@test.com)</li>',
          userCount: 1,
        },
        template: 'organization_pending_user_digest',
        to: 'admin@filigran.io',
      });
    });

    it('should not throw when user last name is null', async () => {
      portalConfig.enabled_emails = {
        ...originalEnabledEmails,
        pending_user_digest: true,
      };

      mockLoadOrganizationsWithPendingUsers([
        {
          id: uuidv4() as UserId,
          email: 'user1@test.com',
          first_name: 'John',
          last_name: null,
        } as User,
      ]);

      const sendMailSpy = vi.spyOn(MailService, 'sendMail');
      await UsersOrganizationApp.sendPendingUsersDigest();

      expect(sendMailSpy).toHaveBeenCalledTimes(1);
      expect(sendMailSpy).toHaveBeenCalledWith({
        params: {
          adminName: 'Firstname',
          organizationName: 'organization name',
          requestLabel: 'request',
          userEmailList: '<li>John  (user1@test.com)</li>',
          userCount: 1,
        },
        template: 'organization_pending_user_digest',
        to: 'admin@filigran.io',
      });
    });

    it('should not send any mail when mailing is disabled', async () => {
      portalConfig.enabled_emails = {
        ...originalEnabledEmails,
        pending_user_digest: false,
      };

      mockLoadOrganizationsWithPendingUsers([
        {
          id: uuidv4() as UserId,
          email: 'user1@test.com',
        } as User,
        {
          id: uuidv4() as UserId,
          email: 'user2@test.com',
        } as User,
      ]);

      const sendMailSpy = vi.spyOn(MailService, 'sendMail');
      await UsersOrganizationApp.sendPendingUsersDigest();

      expect(sendMailSpy).not.toHaveBeenCalled();
    });
  });
});
