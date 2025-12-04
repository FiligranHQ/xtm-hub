import { EditMeUserInput } from '../../__generated__/resolvers-types';
import { UserTransferRequestId } from '../../model/kanel/public/UserTransferRequest';
import { dispatch } from '../../pub';
import { sendMail } from '../../server/mail-service';
import { updateUserSession } from '../../session-store-manager';
import { auth0Client } from '../../thirdparty/auth0/client';
import { logApp } from '../../utils/app-logger.util';
import { ErrorCode, UnknownErrorCode } from '../../utils/error/error.code';
import { mapToGraphQLError } from '../../utils/error/error.mapping';
import { isImgUrl } from '../../utils/utils';
import { isValidEmail } from '../../utils/verify-email.util';
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
import { mapUserToGraphqlUser } from './users.helper';

export const usersProfileApp = {
  editMeUser: async (meUser, input: EditMeUserInput) => {
    if (input.picture) {
      const isPictureImgUrl = await isImgUrl(input.picture);
      if (!isPictureImgUrl) {
        throw ErrorCode.InvalidImageUrl;
      }
    }

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

    const mappedUser = mapUserToGraphqlUser(user);
    await dispatch('User', 'edit', mappedUser);

    return mappedUser;
  },
  requestTransferPersonalSpace: async (user, newEmail: string) => {
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
