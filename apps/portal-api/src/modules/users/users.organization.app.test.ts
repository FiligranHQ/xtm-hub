import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import Organization from '../../model/kanel/public/Organization';
import User, { UserId } from '../../model/kanel/public/User';
import { PLATFORM_ORGANIZATION_UUID } from '../../portal.const';
import * as MailService from '../../server/mail-service';
import { UserOrganizationPendingDomain } from '../common/user-organization-pending.domain';
import { UsersOrganizationApp } from './users.organization.app';
describe('UsersOrganizationApp', () => {
  describe('sendPendingUsersDigest', () => {
    it('should send email to each organization administrators', async () => {
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
        } as Organization & { users: User[] },
      ]);

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
  });
});
