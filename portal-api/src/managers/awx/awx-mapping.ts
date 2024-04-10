import User from '../../model/kanel/public/User';
import { loadOrganizationBy } from '../../modules/organizations/organizations';
import { AWXAddUserInput } from './awx.model';
import { v4 as uuidv4 } from 'uuid';

export const buildCreateUserInput = async (input: User, keys: string[] = []) => {
  // Here add a reducer which add the corresponding
  const orgInfo = await loadOrganizationBy('id', input.organization_id);
  console.log(keys);
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
