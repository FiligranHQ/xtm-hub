import { db, dbRaw } from '../../../knexfile';
import { requestContext } from '../../context/request.context';
import RolePortal from '../../model/kanel/public/RolePortal';
import { UserId } from '../../model/kanel/public/User';
import { ROLE_ADMIN } from '../../portal.const';

export const RolePortalDomain = {
  isAdmin: () => {
    const user = requestContext.requireUser();
    return user.roles_portal.some((role) => role.id === ROLE_ADMIN.id);
  },

  loadRolePortalsBySSOGroups: async (
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
  },

  removeAllUserRolePortal: (user_id: UserId) => {
    return db('User_RolePortal').where({ user_id }).del();
  },
};
