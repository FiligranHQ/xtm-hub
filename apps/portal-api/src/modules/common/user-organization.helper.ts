import { UserId } from '../../model/kanel/public/User';
import { OrganizationId } from '../../model/kanel/public/Organization';
import UserOrganization, { UserOrganizationInitializer } from '../../model/kanel/public/UserOrganization';
import { insertNewUserOrganizationUnsecure } from './user-organization.domain';
import { removeUserFromOrganizationPending } from './user-organization-pending.domain';
import { PortalContext } from '../../model/portal-context';


export const createUserOrganizationRelationAndRemovePending = async (
  context: PortalContext,
  {
   user_id,
   organizations_id = [],
 }: {
  user_id: UserId;
  organizations_id: OrganizationId[];
}): Promise<UserOrganization[]> => {

  organizations_id.map(org => removeUserFromOrganizationPending(context, user_id, org));

  return createUserOrganizationRelation({user_id, organizations_id})
};


export const createUserOrganizationRelation = async ({
                                                                       user_id,
                                                                       organizations_id = [],
                                                                     }: {
  user_id: UserId;
  organizations_id: OrganizationId[];
}): Promise<UserOrganization[]> => {

  const usersOrganization: UserOrganizationInitializer[] = organizations_id.map(
    (organization_id) => ({
      user_id,
      organization_id,
    })
  );
  return insertNewUserOrganizationUnsecure(usersOrganization);
};