import RolePortal from '../model/kanel/public/RolePortal';
import { dbUnsecure } from '../../knexfile';
import UserRolePortal from '../model/kanel/public/UserRolePortal';
import { UserId } from '../model/kanel/public/User';

export const getRolePortal = (): Promise<RolePortal[]> => {
  return dbUnsecure<RolePortal>('RolePortal');
};

export const getRolePortalByUserId = (user_id: UserId): Promise<UserRolePortal[]> => {
  return dbUnsecure<UserRolePortal>('User_RolePortal')
    .where({ user_id })
    .join('RolePortal', 'role_portal_id', '=', 'RolePortal.id');
};

export const getRolePortalByName = (name: string) => {
  return dbUnsecure<RolePortal>('RolePortal').where({ name }).first();
};
