import { UserId } from '../../model/kanel/public/User';
import { OrganizationId } from '../../model/kanel/public/Organization';
import UserOrganization, { UserOrganizationInitializer } from '../../model/kanel/public/UserOrganization';
import { insertNewUserOrganizationUnsecure } from './user-organization.domain';
import { removeUserFromOrganizationPendingUnsecure } from './user-organization-pending.domain';


export const createUserOrganizationRelationUnsecure = async ({
                                                               user_id,
                                                               organizations_id = [],
                                                             }: {
  user_id: UserId;
  organizations_id: OrganizationId[];
}): Promise<UserOrganization[]> => {

  organizations_id.map(org => removeUserFromOrganizationPendingUnsecure(user_id, org));

  const usersOrganization: UserOrganizationInitializer[] = organizations_id.map(
    (organization_id) => ({
      user_id,
      organization_id,
    })
  );
  return insertNewUserOrganizationUnsecure(usersOrganization);
};