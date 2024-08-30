import { db, dbUnsecure } from '../../../knexfile';
import { PortalContext } from '../../model/portal-context';
import RolePortal from '../../model/kanel/public/RolePortal';

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
  return context.user.roles_portal_id.some(
    (role) => role.id === '6b632cf2-9105-46ec-a463-ad59ab58c770'
  );
};
