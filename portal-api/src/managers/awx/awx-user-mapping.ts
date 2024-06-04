import User from '../../model/kanel/public/User';
import { loadOrganizationBy } from '../../modules/organizations/organizations';
import { AWUserInput, AWXAddUserInput } from './awx.model';
import { ActionTrackingId } from '../../model/kanel/public/ActionTracking';

export const buildCreateUserInput = async (
  user: User,
  awxUUID: ActionTrackingId,
  keys: string[] = []
) => {
  const orgInfo = await loadOrganizationBy('id', user.organization_id);
  // Here add a reducer which add the corresponding
  console.log(
    await completeUserInput(
      {
        ...user,
        awx_client_request_id: awxUUID,
      },
      keys
    )
  );
  const awxAddUserInput: AWXAddUserInput = {
    awx_client_request_id: awxUUID,
    organization_name: orgInfo.name,
    user_email_address: user.email,
    user_firstname: user.first_name,
    user_lastname: user.last_name,
    user_reset_password: user.password,
    user_role: 'admin',
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
  const orgInfo = await loadOrganizationBy('id', user.organization_id);
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
