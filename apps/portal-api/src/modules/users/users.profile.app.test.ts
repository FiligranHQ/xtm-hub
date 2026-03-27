import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../../knexfile';
import {
  contextBypassUser,
  contextSimpleUserSecondOrga,
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
        }
      );
      expect(userReturned.last_name).toStrictEqual('anotherLastName');
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

  describe('uploadUserPicture', () => {
    afterEach(async () => {
      vi.restoreAllMocks();
      await updateUser(TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.ID, {
        picture: null,
        picture_minio: null,
      });
    });

    const createMockUpload = (
      filename = 'test.png',
      mimetype = 'image/png'
    ) => ({
      file: {
        filename,
        mimetype,
        encoding: '7bit',
        createReadStream: () => {
          return Readable.from(Buffer.from('fake-image-content'));
        },
      },
      promise: Promise.resolve(),
    });

    const mockMinIOClient = async () => {
      const MinIOClientModule = await import('../../thirdparty/minio/client');
      return {
        insertFile: vi
          .spyOn(MinIOClientModule.MinIOClient, 'insertFile')
          .mockResolvedValue('picture/test_123.png'),
        deleteFile: vi
          .spyOn(MinIOClientModule.MinIOClient, 'deleteFile')
          .mockResolvedValue(undefined),
      };
    };

    it('should upload picture and update user', async () => {
      const { insertFile } = await mockMinIOClient();

      const mockUpload = createMockUpload();
      const result = await usersProfileApp.uploadUserPicture(
        contextSimpleUserSecondOrga.user,
        mockUpload
      );

      expect(insertFile).toHaveBeenCalledOnce();
      expect(result.picture).toContain('/user/picture/');
      expect(result.picture).toContain(contextSimpleUserSecondOrga.user.id);
    });

    it('should delete previous picture from MinIO when uploading new one', async () => {
      const { insertFile, deleteFile } = await mockMinIOClient();

      const mockUpload1 = createMockUpload('first.png');
      await usersProfileApp.uploadUserPicture(
        contextSimpleUserSecondOrga.user,
        mockUpload1
      );

      const userWithPicture = {
        ...contextSimpleUserSecondOrga.user,
        picture_minio: 'picture/first_123.png',
      };

      const mockUpload2 = createMockUpload('second.png');
      await usersProfileApp.uploadUserPicture(userWithPicture, mockUpload2);

      expect(deleteFile).toHaveBeenCalledWith('picture/first_123.png');
      expect(insertFile).toHaveBeenCalledTimes(2);
    });

    it('should continue upload even if deleting previous picture fails', async () => {
      const { deleteFile } = await mockMinIOClient();
      deleteFile.mockRejectedValue(new Error('MinIO delete error'));

      const userWithPicture = {
        ...contextSimpleUserSecondOrga.user,
        picture_minio: 'picture/old_123.png',
      };

      const mockUpload = createMockUpload();
      const result = await usersProfileApp.uploadUserPicture(
        userWithPicture,
        mockUpload
      );

      expect(result.picture).toContain('/user/picture/');
    });
  });
});
