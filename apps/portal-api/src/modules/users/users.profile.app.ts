import config from 'config';
import { EditMeUserInput } from '../../__generated__/resolvers-types';
import { requestContext } from '../../context/request.context';
import { UserTransferRequestId } from '../../model/kanel/public/UserTransferRequest';
import { UserLoadUserBy } from '../../model/user';
import { sendMail } from '../../server/mail-service';
import { updateUserSession } from '../../session-store-manager';
import { auth0Client } from '../../thirdparty/auth0/client';
import { MinIOClient } from '../../thirdparty/minio/client';
import { logApp } from '../../utils/app-logger.util';
import { ErrorCode, UnknownErrorCode } from '../../utils/error/error.code';
import { mapToGraphQLError } from '../../utils/error/error.mapping';
import { ForbiddenAccess } from '../../utils/error/error.util';
import { isValidEmail } from '../../utils/verify-email.util';
import {
  getDocumentName,
  normalizeDocumentName,
} from '../document/document.helper';
import { Upload, waitForUploads } from '../document/document.uploads.helper';
import {
  loadOrganizationBy,
  loadUserByOrganization,
} from '../organizations/organizations.domain';
import { updateSubscriptionBy } from '../subcription/subscription.domain';
import {
  insertNewUserTransfer,
  loadUserTransfer,
} from './user_transferRequest/user_transferRequest.domain';
import { loadSimpleUserBy, loadUserDetails, updateUser } from './users.domain';
import { updateAndDispatchUser } from './users.helper';

const deletePicture = async (pictureMinio: string) => {
  try {
    await MinIOClient.deleteFile(pictureMinio);
  } catch (err) {
    logApp.error('Error deleting previous picture from MinIO', { error: err });
  }
};

const uploadPictureToMinIO = async (userId: string, file: Upload['file']) => {
  const fileName = normalizeDocumentName(file.filename);
  const minioName = `picture/${getDocumentName(fileName)}`;

  await MinIOClient.uploadFile(file, minioName, userId, fileName);

  return minioName;
};

const buildPictureUrl = (userId: string) => {
  const baseUrlFront: string = config.get('base_url_front');
  return `${baseUrlFront}/user/picture/${userId}?t=${Date.now()}`;
};

export const usersProfileApp = {
  editMeUser: async (meUser, input: EditMeUserInput) => {
    const updatedUser = await updateUser(meUser.id, input);

    try {
      await auth0Client.updateUser({
        ...input,
        email: updatedUser.email,
      });
    } catch (err) {
      logApp.error(err);
    }

    const user = await loadUserDetails({
      'User.id': meUser.id,
    });

    updateUserSession(user);

    return updateAndDispatchUser(meUser.id);
  },
  uploadUserPicture: async (meUser, document: Upload) => {
    await waitForUploads(document);

    if (meUser.picture_minio) {
      await deletePicture(meUser.picture_minio);
    }

    const minioName = await uploadPictureToMinIO(meUser.id, document.file);
    const pictureUrl = buildPictureUrl(meUser.id);

    await updateUser(meUser.id, {
      picture: pictureUrl,
      picture_minio: minioName,
    });

    return updateAndDispatchUser(meUser.id);
  },
  requestTransferPersonalSpace: async (
    user: UserLoadUserBy,
    newEmail: string
  ) => {
    if (!isValidEmail(newEmail)) {
      throw new Error(ErrorCode.InvalidEmail);
    }
    const existingPersonalSpace = await loadOrganizationBy({
      name: newEmail,
      personal_space: true,
    });
    if (!existingPersonalSpace) {
      logApp.info(
        `The user ${user.id} has requested a transfer to a unknown user: ${newEmail}`
      );
      return; // Best way to hide from the vilain user that the account does not exist. The email will just never be sent.
    }

    const newUser = await loadUserByOrganization(existingPersonalSpace.id);

    const userTransferRequest = await insertNewUserTransfer({
      from_user_id: user.id,
      to_user_id: newUser[0].id,
    });
    await sendMail({
      to: newEmail,
      template: 'request_transfer_personal_space',
      params: {
        recipientName: `${newUser[0].first_name} ${newUser[0].last_name}`,
        recipientId: newUser[0].id,
        previousUserId: user.id,
        previousUserEmail: user.email,
        previousUserName: `${user.first_name} ${user.last_name}`,
        transferRequestId: `${userTransferRequest[0].id}`,
      },
    });
  },
  transferPersonalSpace: async (
    transferPersonalSpaceId: UserTransferRequestId
  ) => {
    try {
      const userTransferRequest = await loadUserTransfer({
        id: transferPersonalSpaceId,
      });
      if (!userTransferRequest) {
        throw new Error();
      }

      const { user } = requestContext.require();
      if (userTransferRequest.to_user_id !== user.id) {
        throw ForbiddenAccess(ErrorCode.UserIsNotInOrganization);
      }

      const fromUser = await loadSimpleUserBy({
        id: userTransferRequest.from_user_id,
      });
      const toUser = await loadSimpleUserBy({
        id: userTransferRequest.to_user_id,
      });

      const personalSpaceToTransfer = await loadOrganizationBy({
        name: fromUser.email,
        personal_space: true,
      });

      const currentToUserSpace = await loadOrganizationBy({
        name: toUser.email,
        personal_space: true,
      });
      if (
        !fromUser ||
        !toUser ||
        !personalSpaceToTransfer ||
        !currentToUserSpace
      ) {
        throw new Error();
      }

      await updateSubscriptionBy(
        { organization_id: personalSpaceToTransfer.id },
        { organization_id: currentToUserSpace.id }
      );
    } catch (error) {
      throw mapToGraphQLError(error, UnknownErrorCode.TransferMeError);
    }
  },
};
