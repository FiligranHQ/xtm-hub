import { isEmptyField, now } from '../utils/utils.js';
import { ForbiddenAccess } from '../utils/error.js';
import { loadUserBy } from '../users/users.domain.js';

export const loginFromProvider = async (userInfo, opts = {}) => {
  // region test the groups existence and eventually auto create groups
  // endregion
  const { email, name: providedName, firstname, lastname } = userInfo;
  if (isEmptyField(email)) {
    throw ForbiddenAccess('User email not provided');
  }
  console.log({ userInfo });
  const name = isEmptyField(providedName) ? email : providedName;
  const user = await loadUserBy('User.email', email);
  console.log('loadUserBy', user);
  // if (!user) {
  //   // If user doesn't exist, create it. Providers are trusted
  //   const newUser = { name, firstname, lastname, user_email: email.toLowerCase(), external: true };
  //   return addUser(context, SYSTEM_USER, newUser).then(() => {
  //     // After user creation, reapply login to manage roles and groups
  //     return loginFromProvider(userInfo, opts);
  //   });
  // }
  // Update the basic information
  // const patch = { name, firstname, lastname, external: true };
  // await patchAttribute(context, SYSTEM_USER, user.id, ENTITY_TYPE_USER, patch);
  // region Update the groups
  // endregion
  // region Update the organizations
  // If organizations are specified here, that overwrite the default assignation
  // endregion
  return { ...user, provider_metadata: userInfo.provider_metadata };
};

export const authenticateUser = async (req, user, provider) => {
  const logged = await loadUserBy('User.email', user.email);
  const sessionUser = buildSessionUser(logged, provider);
  // req.session.user = sessionUser;
  req.session.user = sessionUser;
  req.session.session_provider = { provider };
  req.session.session_refresh = false;
  req.session.save();
  return sessionUser;
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
