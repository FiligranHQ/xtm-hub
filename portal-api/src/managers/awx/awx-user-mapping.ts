import User from '../../model/kanel/public/User';
import { loadOrganizationBy } from '../../modules/organizations/organizations';
import { AWXAddUserInput } from './awx.model';
import { v4 as uuidv4 } from 'uuid';

export const buildCreateUserInput = async (input: User, keys: string[] = []) => {
  const orgInfo = await loadOrganizationBy('id', input.organization_id);
  // Here add a reducer which add the corresponding
  console.log(await completeUserInput(input, keys));
  const awxAddUserInput: AWXAddUserInput = {
    awx_client_request_id: uuidv4(),
    organization_name: orgInfo.name,
    user_email_address: input.email,
    user_firstname: input.first_name,
    user_lastname: input.last_name,
    user_reset_password: input.password,
    user_role: 'admin',
  };
  return awxAddUserInput;
};

export const completeUserInput = async (input: User, keys: string[] = []) => {
  let completeUser = {
    ...input,
    awx_client_request_id: uuidv4(),
  };
  for (const key of keys) {
    completeUser = await addProperty(key, completeUser);
  }
  return completeUser;
};

const addProperty = async (key: string, user: User) => {
  const mappingProperty = {
    'organization': getUserOrganization,
    'roles': getUserRole,
  };
  const addFunction = mappingProperty[key];
  if (addFunction) {
    return await addFunction(user);
  }
  return user;
};

const getUserOrganization = async (user: User) => {
  const orgInfo = await loadOrganizationBy('id', user.organization_id);
  return {
    ...user,
    ...orgInfo,
  };
};
const getUserRole = async (user: User) => {
  // TODO Need to implement roles in the form
  return {
    ...user,
    roles: ['admin'],
  };
};
