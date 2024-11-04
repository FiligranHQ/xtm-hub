import { db } from '../../../knexfile';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { UserId } from '../../model/kanel/public/User';
import UserOrganization, {
  UserOrganizationInitializer,
} from '../../model/kanel/public/UserOrganization';
import { PortalContext } from '../../model/portal-context';

export const insertNewUserOrganization = (
  context: PortalContext,
  field: UserOrganizationInitializer | UserOrganizationInitializer[]
): Promise<UserOrganization[]> => {
  return db(context, 'User_Organization').insert(field).returning('*');
};

export const createUserOrganizationRelation = async (
  context: PortalContext,
  {
    user_id,
    organizations_id = [],
  }: {
    user_id: UserId;
    organizations_id: OrganizationId[];
  }
) => {
  const usersOrganization: UserOrganizationInitializer[] = organizations_id.map(
    (organization_id) => ({
      user_id,
      organization_id,
    })
  );
  await insertNewUserOrganization(context, usersOrganization);
};
