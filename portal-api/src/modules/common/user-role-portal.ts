import { dbUnsecure } from '../../../knexfile';
import { UserId } from '../../model/kanel/public/User';
import { getRolePortalByName } from '../role-portal/role-portal';
import UserRolePortal, {
  UserRolePortalInitializer,
} from '../../model/kanel/public/UserRolePortal';
import { RolePortalId } from '../../model/kanel/public/RolePortal';

export const createUserRolePortal = async (
  user_id: UserId,
  role_portal_id: RolePortalId
) => {
  return dbUnsecure<UserRolePortal>('User_RolePortal')
    .insert({
      user_id,
      role_portal_id,
    } as UserRolePortalInitializer)
    .returning('*');
};

export const deleteUserRolePortalByUserId = (user_id) => {
  return dbUnsecure('User_RolePortal').where({ user_id }).del();
};

export const addRolesToUser = async (userId: UserId, roles: string[]) => {
  for (const roleName of roles) {
    const role = await getRolePortalByName(roleName);
    if (role) {
      await createUserRolePortal(userId, role.id);
    } else {
      console.error(`Role "${roleName}" not found in database`);
    }
  }
};
