import { OrganizationId } from '../../model/kanel/public/Organization';
import { UserId } from '../../model/kanel/public/User';
import UserOrganization, {
  UserOrganizationInitializer,
} from '../../model/kanel/public/UserOrganization';
import { UserOrganizationPendingDomain } from '../organization-management/users/users-pending/user-organization-pending.domain';
import { insertNewUserOrganization } from './user-organization.domain';

export const createUserOrganizationRelationAndRemovePending = async ({
  user_id,
  organizations_id = [],
}: {
  user_id: UserId;
  organizations_id: OrganizationId[];
}): Promise<UserOrganization[]> => {
  await Promise.all(
    organizations_id.map((org) =>
      UserOrganizationPendingDomain.removeUserFromOrganizationPending(
        user_id,
        org
      )
    )
  );

  return createUserOrganizationRelation({ user_id, organizations_id });
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
  return insertNewUserOrganization(usersOrganization);
};
