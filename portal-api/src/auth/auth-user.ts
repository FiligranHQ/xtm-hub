import { isEmptyField } from '../utils/utils';
import { ForbiddenAccess } from '../utils/error.util';
import { loadUserBy } from '../modules/users/users.domain';
import { UserInfo } from '../model/user';

export const loginFromProvider = async (userInfo: UserInfo) => {
  // region test the groups existence and eventually auto create groups
  // endregion
  const { email } = userInfo;
  if (isEmptyField(email)) {
    throw ForbiddenAccess('User email not provided');
  }
  const user = await loadUserBy('User.email', email);
  if (!user) {
    throw ForbiddenAccess('User not found');
  }
  return user;
};

export const authenticateUser = async (req, user) => {
  const logged = await loadUserBy('User.email', user.email);
  req.session.user = logged;
  req.session.save();
  return logged;
};
