import { isEmptyField } from '../utils/utils';
import {ForbiddenAccess} from '../utils/error.util';
import {
  createUser,
  loadUserBy,
} from '../modules/users/users.domain';
import { UserInfo } from '../model/user';
import {ROLE_ADMIN} from "../portal.const";
import {ensureUserRoleExist} from "../server/initialize.helper";
import {RolePortalId} from "../__generated__/resolvers-types";

export const loginFromProvider = async (userInfo: UserInfo) => {

  // region test the groups existence and eventually auto create groups
  // endregion
  const { email } = userInfo;
  if (isEmptyField(email)) {
    throw ForbiddenAccess('User email not provided');
  }
  const user = await loadUserBy({email: email});
  if (!user && userInfo.roles.includes(ROLE_ADMIN.name)) {
    return await createUser(userInfo);
  } else if(!user) {
    throw ForbiddenAccess('User account not provided');
  } else if(user && !user.roles_portal_id.includes(ROLE_ADMIN.id as unknown as RolePortalId) && userInfo.roles.includes(ROLE_ADMIN.name)) {
    await ensureUserRoleExist(user.id, ROLE_ADMIN.id)
  }
  return user;
};

export const authenticateUser = async (req, user) => {
  const logged = await loadUserBy({email: user.email});
  req.session.user = logged;
  req.session.save();
  return logged;
};
