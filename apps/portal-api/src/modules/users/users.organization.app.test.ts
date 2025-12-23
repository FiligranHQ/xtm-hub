import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import portalConfig from '../../config';
import User, { UserId } from '../../model/kanel/public/User';
import { PLATFORM_ORGANIZATION_UUID } from '../../portal.const';
import * as MailService from '../../server/mail-service';
import { UserOrganizationPendingDomain } from '../common/user-organization-pending.domain';
import { UsersOrganizationApp } from './users.organization.app';
describe('UsersOrganizationApp', () => {
  describe('sendPendingUsersDigest', () => {
    let originalEnabledEmails: typeof portalConfig.enabled_emails;

    beforeEach(async () => {
      const portalConfig = await import('../../config');
      originalEnabledEmails = portalConfig.default.enabled_emails;
    });

    afterEach(async () => {
      const portalConfig = await import('../../config');
      portalConfig.default.enabled_emails = originalEnabledEmails;
    });

    it('should send email to each organization administrators when email is enabled', async () => {
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
            } as User,
            {
              id: uuidv4() as UserId,
              email: 'user2@test.com',
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
          userEmails: 'user1@test.com, user2@test.com',
        },
        template: 'organization_pending_user_digest',
        to: 'admin@filigran.io',
      });
    });

    it('should not send any mail when mailing is disabled', async () => {
      const portalConfig = await import('../../config');
      portalConfig.default.enabled_emails = {
        ...originalEnabledEmails,
        pending_user_digest: false,
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
            } as User,
            {
              id: uuidv4() as UserId,
              email: 'user2@test.com',
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

      expect(sendMailSpy).not.toHaveBeenCalled();
    });
  });
});
