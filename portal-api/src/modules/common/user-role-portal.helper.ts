import { dbUnsecure } from '../../../knexfile';
import { RolePortalId } from '../../model/kanel/public/RolePortal';
import { UserId } from '../../model/kanel/public/User';
import UserRolePortal, {
  UserRolePortalInitializer,
} from '../../model/kanel/public/UserRolePortal';
import { getRolePortalByName } from '../role-portal/role-portal';

export const createUserRolePortal = async (
  userRolePortal: UserRolePortalInitializer | UserRolePortalInitializer[]
) => {
  return dbUnsecure<UserRolePortal>('User_RolePortal')
    .insert(userRolePortal)
    .returning('*');
};

export const deleteUserRolePortalByUserId = (user_id) => {
  return dbUnsecure('User_RolePortal').where({ user_id }).del();
};

export const addRolesToUser = async (userId: UserId, roles: string[]) => {
  for (const roleName of roles) {
    const role = await getRolePortalByName(roleName);
    if (role) {
      await createUserRolePortal({ user_id: userId, role_portal_id: role.id });
    } else {
      console.error(`Role "${roleName}" not found in database`);
    }
  }
};

export const createUserRolePortalRelation = async ({
  user_id,
  roles_id,
}: {
  user_id: UserId;
  roles_id: RolePortalId[];
}) => {
  const extractRolesId: UserRolePortalInitializer[] = roles_id.map(
    (role_portal_id) => ({
      user_id,
      role_portal_id,
    })
  );
  await createUserRolePortal(extractRolesId);
};
