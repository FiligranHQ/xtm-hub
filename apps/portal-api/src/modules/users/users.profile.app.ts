import { dbTx } from '../../../knexfile';
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
  editMeUser: async (context, input: EditMeUserInput) => {
    if (input.picture) {
      const isPictureImgUrl = await isImgUrl(input.picture);
      if (!isPictureImgUrl) {
        throw ErrorCode.InvalidImageUrl;
      }
    }

    const updatedUser = await updateUser(context.user.id, input);

    try {
      await auth0Client.updateUser({
        ...input,
        email: updatedUser.email,
      });
    } catch (err) {
      logApp.error(err);
    }

    const user = await loadUserDetails({
      'User.id': context.user.id,
    });

    updateUserSession(user);

    const mappedUser = mapUserToGraphqlUser(user);
    await dispatch('User', 'edit', mappedUser);

    return mappedUser;
  },
  requestTransferPersonalSpace: async (context, newEmail: string) => {
    if (!isValidEmail(newEmail)) {
      throw new Error(ErrorCode.InvalidEmail);
    }
    const existingPersonalSpace = await loadOrganizationBy({
      name: newEmail,
      personal_space: true,
    });
    if (!existingPersonalSpace) {
      logApp.info(
        `The user ${context.user.id} has requested a transfer to a unknown user: ${newEmail}`
      );
      return; // Best way to hide from the vilain user that the account does not exist. The email will just never be sent.
    }

    const newUser = await loadUserByOrganization(existingPersonalSpace.id);

    const userTransferRequest = await insertNewUserTransfer({
      from_user_id: context.user.id,
      to_user_id: newUser[0].id,
    });
    await sendMail({
      to: newEmail,
      template: 'request_transfer_personal_space',
      params: {
        recipientName: `${newUser[0].first_name} ${newUser[0].last_name}`,
        recipientId: newUser[0].id,
        previousUserId: context.user.id,
        previousUserEmail: context.user.email,
        previousUserName: `${context.user.first_name} ${context.user.last_name}`,
        transferRequestId: `${userTransferRequest[0].id}`,
      },
    });
  },
  transferPersonalSpace: async (
    transferPersonalSpaceId: UserTransferRequestId
  ) => {
    const trx = await dbTx();
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
        { organization_id: currentToUserSpace.id },
        trx
      );

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw mapToGraphQLError(error, UnknownErrorCode.TransferMeError);
    }
  },
};
