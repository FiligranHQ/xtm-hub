import { UserInfo } from '../model/user';
import { createUser, loadUserBy } from '../modules/users/users.domain';
import { ROLE_ADMIN } from '../portal.const';
import { ensureUserRoleExist } from '../server/initialize.helper';
import { ForbiddenAccess } from '../utils/error.util';
import { isEmptyField } from '../utils/utils';

export const loginFromProvider = async (userInfo: UserInfo) => {
  // region test the groups existence and eventually auto create groups
  // endregion
  const { email } = userInfo;
  if (isEmptyField(email)) {
    throw ForbiddenAccess('User email not provided');
  }
  const user = await loadUserBy({ email });
  if (!user) {
    if (userInfo.roles.includes(ROLE_ADMIN.name)) {
      return await createUser(userInfo);
    } else {
      throw ForbiddenAccess('User account not provided');
    }
  } else {
    if (
      !user.roles_portal.some(({ id }) => ROLE_ADMIN.id === id) &&
      userInfo.roles.includes(ROLE_ADMIN.name)
    ) {
      await ensureUserRoleExist(user.id, ROLE_ADMIN.id);
    }
  }
  return user;
};

export const authenticateUser = async (req, user) => {
  const logged = await loadUserBy({ email: user.email });
  req.session.user = logged;
  req.session.save();
  return logged;
};
