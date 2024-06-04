import { isEmptyField } from '../utils/utils';
import { ForbiddenAccess } from '../utils/error.util';
import {
  createUser,
  loadUserBy,
  updateUserRoles,
} from '../modules/users/users.domain';
import { UserInfo } from '../model/user';
import { UserId } from '../model/kanel/public/User';

export const loginFromProvider = async (userInfo: UserInfo) => {
  // region test the groups existence and eventually auto create groups
  // endregion
  const { email } = userInfo;
  if (isEmptyField(email)) {
    throw ForbiddenAccess('User email not provided');
  }
  // TODO rewrite the correct loadUSerBy typing
  const user = await loadUserBy('User.email', email);
  if (!user) {
    return await createUser(userInfo);
  }
  return await updateUserRoles(userInfo, user.id as UserId);
};

export const authenticateUser = async (req, user) => {
  const logged = await loadUserBy('User.email', user.email);
  req.session.user = logged;
  req.session.save();
  return logged;
};
