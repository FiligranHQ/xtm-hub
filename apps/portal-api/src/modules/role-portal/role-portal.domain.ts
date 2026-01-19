import { db, dbRaw } from '../../../knexfile';
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

export const isAdmin = () => {
  const { user } = requestContext.require();
  return user.roles_portal.some((role) => role.id === ROLE_ADMIN.id);
};

export const loadRolePortalsBySSOGroups = async (
  ssoGroups: string[]
): Promise<{ roles: string[] | null }> => {
  return db<RolePortal>('RolePortal')
    .join(
      'SSOGroup_RolePortal',
      'RolePortal.name',
      'SSOGroup_RolePortal.RolePortal'
    )
    .whereIn('SSOGroup_RolePortal.SSOGroup', ssoGroups)
    .select(dbRaw('array_agg(DISTINCT "RolePortal".name) as roles'))
    .first();
};

export const removeAllUserRolePortal = (user_id) => {
  return db('User_RolePortal').where({ user_id }).del();
};
