import type { Request, Response } from 'express';
import { UserInfo } from '../../../model/user';
import { PLATFORM_ORGANIZATION_UUID } from '../../../portal.const';
import {
  addRoleToUser,
  ensureUserOrganizationExist,
} from '../../../server/initialize.helper';
import { ErrorCode } from '../../../utils/error/error.code';
import { ForbiddenAccess } from '../../../utils/error/error.util';
import { isEmptyField } from '../../../utils/utils';
import { UserDomain } from '../../organization-management/user/user-domain/user.domain';
import { getOrCreateUser } from '../../organization-management/user/user.helper';
import { removeAllUserRolePortal } from '../../role-portal/role-portal.domain';

export const loginFromProvider = async (userInfo: UserInfo) => {
  // region test the groups existence and eventually auto create groups
  // endregion
  const { email } = userInfo;
  if (isEmptyField(email)) {
    throw ForbiddenAccess('User email not provided');
  }
  const isFiligranUser = email.endsWith('@filigran.io');

  const user = await getOrCreateUser(userInfo, true, isFiligranUser);
  if (!user) {
    throw new Error(ErrorCode.UserNotFound);
  }
  if (user.disabled) {
    throw ForbiddenAccess('You are not allowed to log in');
  }
  // Check if the user has the admin role, so in creation we create user then add admin role
  if (isFiligranUser) {
    await ensureUserOrganizationExist(user.id, PLATFORM_ORGANIZATION_UUID);
    await removeAllUserRolePortal(user.id);
    if (userInfo.roles.length > 0) {
      await Promise.all(
        userInfo.roles.map((role) => addRoleToUser(user.id, role))
      );
      const reloadedUser = await UserDomain.loadUserBy({ 'User.id': user.id });
      if (!reloadedUser) {
        throw new Error(ErrorCode.UserNotFound);
      }
      return reloadedUser;
    }
  }

  return user;
};

export const authenticateUser = async (
  req: Request,
  res: Response,
  user: UserInfo
) => {
  const logged = await UserDomain.loadUserBy({ email: user.email });
  if (!logged || logged.disabled) {
    return;
  }
  req.session.user = await UserDomain.updateUserAtLogin(logged);
  req.session.save();
  res.cookie('NEXT_LOCALE', logged.selected_language);
  return logged;
};
