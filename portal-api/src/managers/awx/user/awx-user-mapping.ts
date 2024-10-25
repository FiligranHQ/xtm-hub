import { loadUnsecureOrganizationBy } from '../../../modules/organizations/organizations.helper';
import { ActionTrackingId } from '../../../model/kanel/public/ActionTracking';
import { loadUnsecureUserServiceBy } from '../../../modules/user_service/user-service.helper';
import { ROLE_ADMIN } from '../../../portal.const';
import User from '../../../model/kanel/public/User';

export interface UserCommu {
  community_id: string;
  role: string;
}

export interface UserInput extends User {
  roles: string[];
}

export interface AWXAddUserInput {
  awx_client_request_id: ActionTrackingId;
  organization_name: string;
  user_email_address: string;
  user_firstname: string;
  user_lastname: string;
  user_subscription_list?: string; //string[]; need to be stringify
  user_community_list?: string; //UserCommu[]; need to be stringify
  user_reset_password?: string;
  user_role_admin_ptf?: string;
}

export interface AWXUpdateUserInput {
  awx_client_request_id: ActionTrackingId;
  organization_name: string;
  user_email_address: string;
  user_firstname: string;
  user_lastname: string;
}

export const mapUserInputAWX = async (
  user: UserInput,
  awxUUID: ActionTrackingId
) => {
  const orgInfo = await loadUnsecureOrganizationBy(
    'id',
    user.selected_organization_id
  );

  let awxAddUserInput: AWXAddUserInput = {
    awx_client_request_id: awxUUID,
    organization_name: orgInfo.name,
    user_email_address: user.email,
    user_firstname: user.first_name ?? '',
    user_lastname: user.last_name ?? '',
    user_role_admin_ptf:
      user.roles.includes(ROLE_ADMIN.id).toString() ?? 'false',
    user_reset_password: 'temporaryPassword',
  };

  const subscriptions = await loadUnsecureUserServiceBy({ user_id: user.id });
  if (subscriptions.length > 0) {
    const userCommuList: UserCommu[] = [];
    const userServiceList: string[] = [];
    for (const sub of subscriptions) {
      if (sub.service.type === 'COMMUNITY') {
        userCommuList.push({
          community_id: sub.service.id,
          role: sub.service_capability.every(
            (service_capability) =>
              service_capability.service_capability_name === 'ACCESS_SERVICE'
          )
            ? 'user'
            : 'admin',
        });
      } else {
        userServiceList.push(sub.service.id);
      }
    }
    awxAddUserInput = {
      ...awxAddUserInput,
      user_community_list: JSON.stringify(userCommuList),
      user_subscription_list: JSON.stringify(userServiceList),
    };
  }
  return awxAddUserInput;
};

export const mapUpdateUserInputAWX = async (
  user: UserInput,
  awxUUID: ActionTrackingId
): Promise<AWXUpdateUserInput> => {
  const orgInfo = await loadUnsecureOrganizationBy(
    'id',
    user.selected_organization_id
  );

  return {
    awx_client_request_id: awxUUID,
    organization_name: orgInfo.name,
    user_email_address: user.email,
    user_firstname: user.first_name ?? '',
    user_lastname: user.last_name ?? '',
  };
};

export interface UserEmailInput {
  id: string;
  email: string;
}

export const mapUserEmailAWX = (
  { email }: UserEmailInput,
  awxUUID: ActionTrackingId
) => {
  return {
    awx_client_request_id: awxUUID,
    user_email_address: email,
  };
};
