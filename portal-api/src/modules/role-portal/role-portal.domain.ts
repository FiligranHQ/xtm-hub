import { db, dbUnsecure } from '../../../knexfile';
import RolePortal from '../../model/kanel/public/RolePortal';
import { PortalContext } from '../../model/portal-context';
import { ROLE_ADMIN } from '../../portal.const';

export const loadRolePortalBy = async (
  context: PortalContext,
  field: string,
  value: string
): Promise<RolePortal> => {
  return db<RolePortal>(context, 'RolePortal')
    .where({ [field]: value })
    .select('*');
};

export const loadAllRolePortalBy = async (
  field: string,
  value: string[]
): Promise<RolePortal[]> => {
  return dbUnsecure<RolePortal>('RolePortal').whereIn(field, value);
};

export const isAdmin = async (context: PortalContext) => {
  return context.user.roles_portal_id.some((role) => role.id === ROLE_ADMIN.id);
};
