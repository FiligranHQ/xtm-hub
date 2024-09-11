import { loadUnsecureOrganizationBy } from '../../../modules/organizations/organizations.helper';
import { AWXAddUserInput, UserCommu, UserInput } from '../awx.model';
import { ActionTrackingId } from '../../../model/kanel/public/ActionTracking';
import { loadAllRolePortalBy } from '../../../modules/role-portal/role-portal.domain';
import { getRoleMappingReverse } from '../../../auth/mapping-roles';
import { loadUnsecureUserServiceBy } from '../../../modules/user_service/user-service.helper';

export const mapUserInputAWX = async (
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

  let awxAddUserInput: AWXAddUserInput = {
    awx_client_request_id: awxUUID,
    organization_name: orgInfo.name,
    user_email_address: user.email,
    user_firstname: user.first_name,
    user_lastname: user.last_name,
  };
  if (user_roles.includes('admin')) {
    awxAddUserInput = { ...awxAddUserInput, user_role_admin_ptf: true };
  }
  const subscriptions = await loadUnsecureUserServiceBy({ user_id: user.id });
  if (subscriptions.length > 0) {
    const userCommuList: UserCommu[] = [];
    const userServiceList: string[] = [];
    for (const sub of subscriptions) {
      sub.service.type === 'COMMUNITY'
        ? userCommuList.push({
            community_id: sub.service.id,
            role: sub.service_capability.every(
              (service_capability) =>
                service_capability.service_capability_name === 'ACCESS_SERVICE'
            )
              ? 'user'
              : 'admin',
          })
        : userServiceList.push(sub.service.id);
    }
    awxAddUserInput = {
      ...awxAddUserInput,
      user_community_list: userCommuList,
      user_subscription_list: userServiceList,
    };
  }
  return awxAddUserInput;
};

export const mapUserEmailAWX = (email: string, awxUUID: ActionTrackingId) => {
  return {
    awx_client_request_id: awxUUID,
    user_email_address: email,
  };
};
