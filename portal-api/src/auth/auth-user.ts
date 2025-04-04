import type { Request } from 'express';
import { UserInfo } from '../model/user';
import { loadUserBy, updateUserAtLogin } from '../modules/users/users.domain';
import { getOrCreateUser } from '../modules/users/users.helper';
import { PLATFORM_ORGANIZATION_UUID, ROLE_ADMIN } from '../portal.const';
import {
  ensureUserOrganizationExist,
  ensureUserRoleExist,
} from '../server/initialize.helper';
import { ForbiddenAccess } from '../utils/error.util';
import { isEmptyField } from '../utils/utils';

export const loginFromProvider = async (userInfo: UserInfo) => {
  // region test the groups existence and eventually auto create groups
  // endregion
  const { email } = userInfo;
  if (isEmptyField(email)) {
    throw ForbiddenAccess('User email not provided');
  }

  const user = await getOrCreateUser(userInfo, true);
  if (user.disabled) {
    throw ForbiddenAccess('You are not allowed to log in');
  }
  // Check if the user has the admin role, so in creation we create user then add admin role
  if (userInfo.roles.includes(ROLE_ADMIN.name)) {
    await ensureUserRoleExist(user.id, ROLE_ADMIN.id);
    await ensureUserOrganizationExist(user.id, PLATFORM_ORGANIZATION_UUID);
    return loadUserBy({ 'User.id': user.id });
  }

  return user;
};

export const authenticateUser = async (req: Request, user: UserInfo) => {
  const logged = await loadUserBy({ email: user.email });
  if (!logged || logged.disabled) {
    return;
  }
  req.session.user = await updateUserAtLogin(logged);
  req.session.save();
  return logged;
};
