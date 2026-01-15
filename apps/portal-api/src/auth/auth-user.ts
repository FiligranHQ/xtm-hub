import type { Request, Response } from 'express';
import { UserInfo } from '../model/user';
import { loadUserBy, updateUserAtLogin } from '../modules/users/users.domain';
import { getOrCreateUser } from '../modules/users/users.helper';
import { PLATFORM_ORGANIZATION_UUID, ROLE_ADMIN } from '../portal.const';
import {
  addRoleToUser,
  ensureUserOrganizationExist,
} from '../server/initialize.helper';
import { ForbiddenAccess } from '../utils/error/error.util';
import { isEmptyField } from '../utils/utils';

export const loginFromProvider = async (userInfo: UserInfo) => {
  // region test the groups existence and eventually auto create groups
  // endregion
  const { email } = userInfo;
  if (isEmptyField(email)) {
    throw ForbiddenAccess('User email not provided');
  }
  const isAdminFiligran = userInfo.roles.includes(ROLE_ADMIN.name);

  const user = await getOrCreateUser(userInfo, true, isAdminFiligran);
  if (user.disabled) {
    throw ForbiddenAccess('You are not allowed to log in');
  }
  // Check if the user has the admin role, so in creation we create user then add admin role

  if (userInfo.roles.length > 0) {
    await ensureUserOrganizationExist(user.id, PLATFORM_ORGANIZATION_UUID);
    await Promise.all(
      userInfo.roles.map((role) => addRoleToUser(user.id, role))
    );
    return loadUserBy({ 'User.id': user.id });
  }

  return user;
};

export const authenticateUser = async (
  req: Request,
  res: Response,
  user: UserInfo
) => {
  const logged = await loadUserBy({ email: user.email });
  if (!logged || logged.disabled) {
    return;
  }
  req.session.user = await updateUserAtLogin(logged);
  req.session.save();
  return logged;
};
