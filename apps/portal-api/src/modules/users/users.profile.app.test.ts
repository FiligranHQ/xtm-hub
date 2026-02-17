import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../../knexfile';
import {
  contextBypassUser,
  SERVICES,
  TEST_ORGANIZATIONS,
} from '../../../tests/tests.const';
import { OrganizationId } from '../../model/kanel/public/Organization';
import Subscription, {
  SubscriptionId,
} from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';
import UserTransferRequest, {
  UserTransferRequestId,
} from '../../model/kanel/public/UserTransferRequest';
import * as mailService from '../../server/mail-service';
import {
  deleteSubscription,
  insertSubscription,
} from '../subcription/subscription.helper';
import * as UserTransferRequestDomain from './user_transferRequest/user_transferRequest.domain';
import {
  deleteUserTransferRequest,
  insertNewUserTransfer,
} from './user_transferRequest/user_transferRequest.domain';
import { updateUser } from './users.domain';
import { usersProfileApp } from './users.profile.app';

describe('User profile app', () => {
  const mockTransferRequestData: UserTransferRequest[] = [
    {
      id: uuidv4() as unknown as UserTransferRequestId,
      from_user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID as UserId,
      to_user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID as UserId,
    },
  ];

  describe('editMeUser', () => {
    afterEach(async () => {
      await updateUser(TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID, {
        first_name: 'firstName',
        last_name: 'lastName',
        picture: null,
        country: null,
      });
    });
    it('should update one field and return user', async () => {
      const userReturned = await usersProfileApp.editMeUser(
        contextBypassUser.user,
        {
          first_name: 'anotherFirstName',
        }
      );
      expect(userReturned.first_name).toStrictEqual('anotherFirstName');
    });
    it('should update multiple fields and return user', async () => {
      const userReturned = await usersProfileApp.editMeUser(
        contextBypassUser.user,
        {
          last_name: 'anotherLastName',
          picture: 'https://s.gravatar.com/avatar/aaaa.png',
        }
      );
      expect(userReturned.last_name).toStrictEqual('anotherLastName');
      expect(userReturned.picture).toStrictEqual(
        'https://s.gravatar.com/avatar/aaaa.png'
      );
    });
  });

  describe('requestTransferPersonalSpace', () => {
    afterEach(async () => {
      vi.restoreAllMocks();
    });
    it('Should send error if email is not valid format', async () => {
      await expect(
        usersProfileApp.requestTransferPersonalSpace(
          contextBypassUser.user,
          'emailNotValid'
        )
      ).rejects.toThrow('INVALID_EMAIL');
    });
    it('Should not send error if email does not already exist (for vilain users)', async () => {
      await expect(
        usersProfileApp.requestTransferPersonalSpace(
          contextBypassUser.user,
          'emailNotExists@filigran.io'
        )
      ).resolves.toBeUndefined();
    });
    it('Should call send email with right values', async () => {
      const mockSendMail = vi.spyOn(mailService, 'sendMail');

      vi.spyOn(
        UserTransferRequestDomain,
        'insertNewUserTransfer'
      ).mockResolvedValue(mockTransferRequestData);
      await usersProfileApp.requestTransferPersonalSpace(
        contextBypassUser.user,
        'user15@test.fr'
      );
      expect(mockSendMail).toHaveBeenCalledOnce();
      expect(mockSendMail).toHaveBeenCalledWith({
        to: 'user15@test.fr',
        template: 'request_transfer_personal_space',
        params: {
          recipientName: 'test hello',
          recipientId: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE.ID,
          previousUserId: contextBypassUser.user.id,
          previousUserEmail: contextBypassUser.user.email,
          previousUserName: `${contextBypassUser.user.first_name} ${contextBypassUser.user.last_name}`,
          transferRequestId: `${mockTransferRequestData[0]?.id}`,
        },
      });
    });
  });

  describe('transferPersonalSpace', () => {
    const newSubscription = {
      id: uuidv4(),
      organization_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
      service_instance_id: SERVICES.INSTANCES.VAULT.ID,
    };
    beforeEach(async () => {
      await insertSubscription(newSubscription);
      await insertNewUserTransfer({
        id: mockTransferRequestData[0]?.id,
        from_user_id: mockTransferRequestData[0]?.from_user_id as UserId,
        to_user_id: mockTransferRequestData[0]?.to_user_id as UserId,
      });
    });
    afterEach(async () => {
      vi.restoreAllMocks();
      await deleteSubscription({
        id: newSubscription.id as SubscriptionId,
      });
      await deleteUserTransferRequest({ id: mockTransferRequestData[0]?.id });
    });
    it('Should update subscription', async () => {
      // Cast to unknown because we take the personal space of these users
      const subsFromBefore = (await db<Subscription>('Subscription')
        .where({
          organization_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS
            .ID as unknown as OrganizationId,
        })
        .select('*')) as unknown as Subscription[];
      const subsToBefore = (await db<Subscription>('Subscription')
        .where({
          organization_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2
            .ID as unknown as OrganizationId,
        })
        .select('*')) as unknown as Subscription[];
      await usersProfileApp.transferPersonalSpace(
        mockTransferRequestData[0]?.id as UserTransferRequestId
      );
      const subsFromAfter = (await db<Subscription>('Subscription')
        .where({
          organization_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS
            .ID as unknown as OrganizationId,
        })
        .select('*')) as unknown as Subscription[];
      const subsToAfter: Subscription[] = (await db<Subscription>(
        'Subscription'
      )
        .where({
          organization_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2
            .ID as unknown as OrganizationId,
        })
        .select('*')) as unknown as Subscription[];
      expect(subsFromBefore.length).toStrictEqual(1);
      expect(subsToBefore.length).toStrictEqual(0);
      expect(subsFromAfter.length).toStrictEqual(0);
      expect(subsToAfter.length).toStrictEqual(1);
    });

    it('Should throw error if no request found', async () => {
      await expect(
        usersProfileApp.transferPersonalSpace('noId' as UserTransferRequestId)
      ).rejects.toThrow();
    });
  });
});
