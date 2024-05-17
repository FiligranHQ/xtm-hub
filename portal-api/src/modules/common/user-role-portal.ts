import { dbUnsecure } from '../../../knexfile';
import { UserId } from '../../model/kanel/public/User';
import { getRolePortalByName } from '../role-portal/role-portal';

export const createUserRolePortal = (user_id, role_portal_id = '6b632cf2-9105-46ec-a463-ad59ab58c770') => {
  return dbUnsecure('User_RolePortal')
    .insert({ user_id, role_portal_id });
};

export const deleteUserRolePortalByUserId = (user_id) => {
  return dbUnsecure('User_RolePortal')
    .where({ user_id })
    .del();
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
