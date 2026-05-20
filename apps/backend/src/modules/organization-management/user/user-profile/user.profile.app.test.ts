import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestHelper } from '../../../../../tests/helper/test.helper';
import {
  contextSimpleUserSecondOrga,
  requestContextAdminSecondOrga,
  SERVICES,
  TEST_ORGANIZATIONS,
} from '../../../../../tests/tests.const';
import { requestContext } from '../../../../context/request.context';
import { OrganizationId } from '../../../../model/kanel/public/Organization';
import Subscription, {
  SubscriptionId,
} from '../../../../model/kanel/public/Subscription';
import { UserId } from '../../../../model/kanel/public/User';
import UserTransferRequest, {
  UserTransferRequestId,
} from '../../../../model/kanel/public/UserTransferRequest';
import * as mailService from '../../../../server/mail-service';
import { deleteSubscription } from '../../../subscription/subscription.helper';
import { UserDomain } from '../user-domain/user.domain';
import { UserTransferRequestDomain } from '../user-transferRequest/user-transfer-request.domain';
import { userProfileApp } from './user.profile.app';

describe('user profile app', () => {
  const mockTransferRequestData: UserTransferRequest[] = [
    {
      id: uuidv4() as unknown as UserTransferRequestId,
      from_user_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE
        .ID as UserId,
      to_user_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA
        .ID as UserId,
    },
  ];

  describe('editMeUser', () => {
    afterEach(async () => {
      await UserDomain.updateUser(TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID, {
        first_name: 'firstName',
        last_name: 'lastName',
        country: null,
      });
    });
    it('should update one field and return user', async () => {
      const userReturned = await userProfileApp.editMeUser(
        contextSimpleUserSecondOrga.user,
        {
          first_name: 'anotherFirstName',
        }
      );
      expect(userReturned.first_name).toStrictEqual('anotherFirstName');
    });
    it('should update multiple fields and return user', async () => {
      const userReturned = await userProfileApp.editMeUser(
        contextSimpleUserSecondOrga.user,
        {
          last_name: 'anotherLastName',
        }
      );
      expect(userReturned).toMatchObject({
        last_name: 'anotherLastName',
      });
    });
  });

  describe('requestTransferPersonalSpace', () => {
    it('should send error if email is not valid format', async () => {
      await expect(
        userProfileApp.requestTransferPersonalSpace(
          contextSimpleUserSecondOrga.user,
          'emailNotValid'
        )
      ).rejects.toThrow('INVALID_EMAIL');
    });
    it('should not send error if email does not already exist (for vilain users)', async () => {
      await expect(
        userProfileApp.requestTransferPersonalSpace(
          contextSimpleUserSecondOrga.user,
          'emailNotExists@filigran.io'
        )
      ).resolves.toBeUndefined();
    });
    it('should call send email with right values', async () => {
      const mockSendMail = vi.spyOn(mailService, 'sendMail');

      vi.spyOn(
        UserTransferRequestDomain,
        'insertNewUserTransfer'
      ).mockResolvedValue(mockTransferRequestData);
      await userProfileApp.requestTransferPersonalSpace(
        contextSimpleUserSecondOrga.user,
        'user15@test.fr'
      );
      expect(mockSendMail).toHaveBeenCalledOnce();
      expect(mockSendMail).toHaveBeenCalledWith({
        to: 'user15@test.fr',
        template: 'request_transfer_personal_space',
        params: {
          recipientName: 'test hello',
          recipientId: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE.ID,
          previousUserId: contextSimpleUserSecondOrga.user.id,
          previousUserEmail: contextSimpleUserSecondOrga.user.email,
          previousUserName: `${contextSimpleUserSecondOrga.user.first_name} ${contextSimpleUserSecondOrga.user.last_name}`,
          transferRequestId: `${mockTransferRequestData[0]?.id}`,
        },
      });
    });
  });

  describe('transferPersonalSpace', () => {
    let newSubscription: Subscription;
    beforeEach(async () => {
      newSubscription = await TestHelper.subscription.create({
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE
          .ID as unknown as OrganizationId,
        service_instance_id: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
      });
      await UserTransferRequestDomain.insertNewUserTransfer({
        id: mockTransferRequestData[0]?.id,
        from_user_id: mockTransferRequestData[0]?.from_user_id as UserId,
        to_user_id: mockTransferRequestData[0]?.to_user_id as UserId,
      });
    });
    afterEach(async () => {
      await deleteSubscription({
        id: newSubscription.id as SubscriptionId,
      });
      await UserTransferRequestDomain.deleteUserTransferRequest({
        id: mockTransferRequestData[0]?.id,
      });
    });
    it('should update subscription', async () => {
      requestContext.set(requestContextAdminSecondOrga);

      const subsFromBefore = await TestHelper.subscription.loadAll({
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE
          .ID as unknown as OrganizationId,
      });
      const subsToBefore = await TestHelper.subscription.loadAll({
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA
          .ID as unknown as OrganizationId,
      });
      await userProfileApp.transferPersonalSpace(
        mockTransferRequestData[0]?.id as UserTransferRequestId
      );
      const subsFromAfter = await TestHelper.subscription.loadAll({
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE
          .ID as unknown as OrganizationId,
      });
      const subsToAfter = await TestHelper.subscription.loadAll({
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA
          .ID as unknown as OrganizationId,
      });

      expect(subsFromBefore).toHaveLength(1);
      expect(subsToBefore).toHaveLength(0);
      expect(subsFromAfter).toHaveLength(0);
      expect(subsToAfter).toHaveLength(1);
    });

    it('should reject transfer if caller is not the intended recipient', async () => {
      await expect(
        userProfileApp.transferPersonalSpace(
          mockTransferRequestData[0]?.id as UserTransferRequestId
        )
      ).rejects.toThrow();
    });

    it('should throw error if no request found', async () => {
      await expect(
        userProfileApp.transferPersonalSpace('noId' as UserTransferRequestId)
      ).rejects.toThrow();
    });
  });

  describe('uploadUserPicture', () => {
    afterEach(async () => {
      await UserDomain.updateUser(
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.ID,
        {
          picture: null,
          picture_minio: null,
        }
      );
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
      const MinIOClientModule =
        await import('../../../../thirdparty/minio/client');
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
      const result = await userProfileApp.uploadUserPicture(
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
      await userProfileApp.uploadUserPicture(
        contextSimpleUserSecondOrga.user,
        mockUpload1
      );

      const userWithPicture = {
        ...contextSimpleUserSecondOrga.user,
        picture_minio: 'picture/first_123.png',
      };

      const mockUpload2 = createMockUpload('second.png');
      await userProfileApp.uploadUserPicture(userWithPicture, mockUpload2);

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
      const result = await userProfileApp.uploadUserPicture(
        userWithPicture,
        mockUpload
      );

      expect(result.picture).toContain('/user/picture/');
    });
  });
});
