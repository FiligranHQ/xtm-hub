import { db, dbUnsecure } from '../../../knexfile';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { UserId } from '../../model/kanel/public/User';
import UserOrganization, {
  UserOrganizationInitializer,
} from '../../model/kanel/public/UserOrganization';
import { PortalContext } from '../../model/portal-context';
import { isEmpty } from '../../utils/utils';

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

export const createUserOrganizationRelationUnsecure = async ({
  user_id,
  organizations_id = [],
}: {
  user_id: UserId;
  organizations_id: OrganizationId[];
}) => {
  const usersOrganization: UserOrganizationInitializer[] = organizations_id.map(
    (organization_id) => ({
      user_id,
      organization_id,
    })
  );
  await dbUnsecure('User_Organization')
    .insert(usersOrganization)
    .returning('*');
};

export const updateUserOrg = async (
  context: PortalContext,
  userId: UserId,
  organizationsId: OrganizationId[]
) => {
  if (isEmpty(organizationsId)) {
    return;
  }
  await db<UserOrganization>(context, 'User_Organization')
    .where('user_id', '=', userId)
    .delete('*');

  const userOrgsToInsert: UserOrganizationInitializer[] = organizationsId.map(
    (orgId) => ({
      user_id: userId,
      organization_id: orgId,
    })
  );
  return db<UserOrganization>(context, 'User_Organization')
    .insert(userOrgsToInsert)
    .returning('*');
};
