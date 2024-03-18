import { isEmptyField } from '../utils/utils.js';
import { ForbiddenAccess } from '../utils/error.js';
import { createUser, loadUserBy } from '../users/users.domain.js';

export const loginFromProvider = async (userInfo, opts = {}) => {
  // region test the groups existence and eventually auto create groups
  // endregion
  const { email, name: providedName, firstname, lastname } = userInfo;
  if (isEmptyField(email)) {
    throw ForbiddenAccess('User email not provided');
  }
  const user = await loadUserBy('User.email', email);
  if (!user) {
    const newUser = await createUser(email);
    return { ...newUser, provider_metadata: userInfo.provider_metadata };
  } else {
    // Update user role
    // createUserRolePortal(user.id);
  }
  return { ...user, provider_metadata: userInfo.provider_metadata };
};

export const authenticateUser = async (req, user, provider) => {
  const logged = await loadUserBy('User.email', user.email);
  req.session.user = logged;
  req.session.save();
  return logged;
};

