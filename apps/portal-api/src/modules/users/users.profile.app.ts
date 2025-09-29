import { dbTx } from '../../../knexfile';
import { EditMeUserInput } from '../../__generated__/resolvers-types';
import { UserId } from '../../model/kanel/public/User';
import { dispatch } from '../../pub';
import { sendMail } from '../../server/mail-service';
import { updateUserSession } from '../../sessionStoreManager';
import { auth0Client } from '../../thirdparty/auth0/client';
import { logApp } from '../../utils/app-logger.util';
import { ErrorCode } from '../../utils/error/error.code';
import { isImgUrl } from '../../utils/utils';
import { isValidEmail } from '../../utils/verify-email.util';
import {
  loadOrganizationBy,
  loadUserByOrganization,
} from '../organizations/organizations.domain';
import { updateSubscriptionBy } from '../subcription/subscription.domain';
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

    const updatedUser = await updateUser(context, context.user.id, input);

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
      throw new Error(ErrorCode.PersonalSpaceMustAlreadyExist);
    }
    const newUser = await loadUserByOrganization(existingPersonalSpace.id);
    await sendMail({
      to: newEmail,
      template: 'request_transfer_personal_space',
      params: {
        recipientName: `${newUser[0].first_name} ${newUser[0].last_name}`,
        recipientId: newUser[0].id,
        previousUserId: context.user.id,
        previousUserEmail: context.user.email,
        previousUserName: `${context.user.firstname} ${context.user.lastname}`,
      },
    });
  },
  transferPersonalSpace: async (context, from: UserId, to: UserId) => {
    const trx = await dbTx();
    try {
      const fromUser = await loadSimpleUserBy({ id: from });
      const toUser = await loadSimpleUserBy({ id: to });

      const personalSpaceToTransfer = await loadOrganizationBy({
        name: fromUser.email,
        personal_space: true,
      });

      const currentToUserSpace = await loadOrganizationBy({
        name: toUser.email,
        personal_space: true,
      });

      await updateSubscriptionBy(
        { organization_id: personalSpaceToTransfer.id },
        { organization_id: currentToUserSpace.id },
        trx
      );

      await trx.commit();
    } catch {
      await trx.rollback();
    }
  },
};
