import RolePortal from '../../model/kanel/public/RolePortal';
import { db, dbUnsecure } from '../../../knexfile';
import UserRolePortal from '../../model/kanel/public/UserRolePortal';
import { UserId } from '../../model/kanel/public/User';
import { PortalContext } from '../../model/portal-context';
import { Organization } from '../../__generated__/resolvers-types';

export const getRolePortal = (): Promise<RolePortal[]> => {
  return dbUnsecure<RolePortal>('RolePortal');
};

export const getRolePortalByUserId = (
  user_id: UserId
): Promise<UserRolePortal[]> => {
  return dbUnsecure<UserRolePortal>('User_RolePortal')
    .where({ user_id })
    .join('RolePortal', 'role_portal_id', '=', 'RolePortal.id');
};

export const getRolePortalByName = (name: string) => {
  return dbUnsecure<RolePortal>('RolePortal').where({ name }).first();
};

export const getRolePortalBy = async (
  context: PortalContext,
  field: string,
  value: string
): Promise<Organization> => {
  return db<Organization>(context, 'RolePortal')
    .where({ [field]: value })
    .select('*')
    .first();
};
