import { logApp } from '@xtm-hub/logger';
import { EditMeUserInput } from '../../__generated__/resolvers-types';
import { dispatch } from '../../pub';
import { updateUserSession } from '../../sessionStoreManager';
import { auth0Client } from '../../thirdparty/auth0/client';
import { isImgUrl } from '../../utils/utils';
import { ErrorCode } from '../common/error-code';
import { loadUserDetails, updateUser } from './users.domain';
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
};
