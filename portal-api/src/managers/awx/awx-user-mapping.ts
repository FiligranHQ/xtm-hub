import User from '../../model/kanel/public/User';
import { loadUnsecureOrganizationBy } from '../../modules/organizations/organizations.helper';
import { AWUserInput, AWXAddUserInput, UserInput } from './awx.model';
import { ActionTrackingId } from '../../model/kanel/public/ActionTracking';
import { loadAllRolePortalBy } from '../../modules/role-portal/role-portal.domain';
import { getRoleMappingReverse } from '../../auth/mapping-roles';

export const buildCreateUserInput = async (
  user: UserInput,
  awxUUID: ActionTrackingId
) => {
  const orgInfo = await loadUnsecureOrganizationBy('id', user.organization_id);
  const loadUserRoles = await loadAllRolePortalBy('id', user.roles);

  /* As we convert from config Thales role in input we should return the same as the output
   * In order to do that we do a reverse mapping.
   */
  const roleMapping = getRoleMappingReverse();
  const user_roles = loadUserRoles.map(({ name }) => roleMapping[name]);

  const awxAddUserInput: AWXAddUserInput = {
    awx_client_request_id: awxUUID,
    organization_name: orgInfo.name,
    user_email_address: user.email,
    user_firstname: user.first_name,
    user_lastname: user.last_name,
    user_reset_password: user.password,
    user_roles,
  };
  return awxAddUserInput;
};

export const completeUserInput = async (
  user: AWUserInput,
  keys: string[] = []
) => {
  let completeUser = {
    ...user,
  };
  for (const key of keys) {
    completeUser = await addProperty(key, completeUser);
  }
  return completeUser;
};

const addProperty = async (key: string, user: User) => {
  const mappingProperty = {
    organization: getUserOrganization,
    roles: getUserRole,
  };
  const addFunction = mappingProperty[key];
  if (addFunction) {
    return await addFunction(user);
  }
  return user;
};

const getUserOrganization = async (user: AWUserInput) => {
  const orgInfo = await loadUnsecureOrganizationBy('id', user.organization_id);
  return {
    ...user,
    ...orgInfo,
  };
};
const getUserRole = async (user: AWUserInput) => {
  // TODO Need to implement roles in the form
  return {
    ...user,
    roles: ['admin'],
  };
};
