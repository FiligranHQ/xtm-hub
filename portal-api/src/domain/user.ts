import { isEmptyField, now } from '../utils/utils.js';
import { ForbiddenAccess } from '../utils/error.js';
import { createUser, loadUserBy } from '../users/users.domain.js';

export const loginFromProvider = async (userInfo, opts = {}) => {
  // region test the groups existence and eventually auto create groups
  // endregion
  console.log('loginFromProvider', userInfo);
  const { email, name: providedName, firstname, lastname } = userInfo;
  if (isEmptyField(email)) {
    throw ForbiddenAccess('User email not provided');
  }
  const user = await loadUserBy('User.email', email);
  console.log('loadUserBy', user);
  if (!user) {
    // const name = providedName ?? email;
    const newUser = await createUser(email);
    console.log({ newUser });
    return { provider_metadata: userInfo.provider_metadata, ...newUser };
  }
  return { ...user, provider_metadata: userInfo.provider_metadata };
};

export const authenticateUser = async (req, user, provider) => {
  console.log('authenticateUser');
  const logged = await loadUserBy('User.email', user.email);
  // req.session.user = sessionUser;
  req.session.user = logged;
  req.session.save();
  return logged;
};

const buildSessionUser = (user, provider) => {
  return {
    id: user.id,
    individual_id: user.individual_id,
    session_creation: now(),
    session_password: user.password,
    api_token: user.api_token,
    internal_id: user.internal_id,
    user_email: user.user_email,
    otp_secret: user.otp_secret,
    name: user.name,
    external: user.external,
    login_provider: provider,
    account_status: user.account_status,
    account_lock_after_date: user.account_lock_after_date,
    unit_system: user.unit_system,
    groups: user.groups,
    roles: user.roles,
    default_hidden_types: user.default_hidden_types,
    group_ids: user.groups?.map((g) => g.internal_id) ?? [],
    organizations: user.organizations ?? [],
    allowed_organizations: user.allowed_organizations,
    administrated_organizations: user.administrated_organizations ?? [],
    inside_platform_organization: user.inside_platform_organization,
    ...user.provider_metadata,
  };
};
