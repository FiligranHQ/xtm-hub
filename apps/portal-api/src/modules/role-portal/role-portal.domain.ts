import { db } from '../../../knexfile';
import { requestContext } from '../../context/request.context';
import RolePortal from '../../model/kanel/public/RolePortal';
import { ROLE_ADMIN } from '../../portal.const';

export const loadRolePortalBy = async (
  field: string,
  value: string
): Promise<RolePortal> => {
  return db<RolePortal>('RolePortal')
    .where({ [field]: value })
    .select('*');
};

export const loadAllRolePortalBy = async (
  field: string,
  value: string[]
): Promise<RolePortal[]> => {
  return db<RolePortal>('RolePortal').whereIn(field, value);
};

export const isAdmin = () => {
  const { user } = requestContext.require();
  return user.roles_portal.some((role) => role.id === ROLE_ADMIN.id);
};
