import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TEST_ORGANIZATIONS } from '../../../tests/tests.const';
import portalConfig from '../../config';
import User, { UserId } from '../../model/kanel/public/User';
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
          id: TEST_ORGANIZATIONS.FILIGRAN.ID,
          name: TEST_ORGANIZATIONS.FILIGRAN.NAME,
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
          adminName: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.FIRST_NAME,
          organizationName: TEST_ORGANIZATIONS.FILIGRAN.NAME,
          users: [
            { firstName: 'John', lastName: 'Doe', email: 'user1@test.com' },
            { firstName: 'Robert', lastName: 'Smith', email: 'user2@test.com' },
          ],
          userCount: 2,
          requestLabel: 'requests',
        },
        template: 'organization_pending_user_digest',
        to: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.EMAIL,
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
          id: TEST_ORGANIZATIONS.FILIGRAN.ID,
          name: TEST_ORGANIZATIONS.FILIGRAN.NAME,
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
          adminName: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.FIRST_NAME,
          organizationName: TEST_ORGANIZATIONS.FILIGRAN.NAME,
          users: [
            { firstName: 'John', lastName: 'Doe', email: 'user1@test.com' },
          ],
          userCount: 1,
          requestLabel: 'request',
        },
        template: 'organization_pending_user_digest',
        to: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.EMAIL,
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
          adminName: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.FIRST_NAME,
          organizationName: TEST_ORGANIZATIONS.FILIGRAN.NAME,
          requestLabel: 'request',
          users: [
            { firstName: '', lastName: 'Smith', email: 'user1@test.com' },
          ],
          userCount: 1,
        },
        template: 'organization_pending_user_digest',
        to: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.EMAIL,
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
          adminName: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.FIRST_NAME,
          organizationName: TEST_ORGANIZATIONS.FILIGRAN.NAME,
          requestLabel: 'request',
          users: [{ firstName: 'John', lastName: '', email: 'user1@test.com' }],
          userCount: 1,
        },
        template: 'organization_pending_user_digest',
        to: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.EMAIL,
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
