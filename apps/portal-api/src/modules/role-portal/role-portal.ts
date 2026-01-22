import { db } from '../../../knexfile';
import RolePortal from '../../model/kanel/public/RolePortal';

export const getRolePortalByName = (name: string) => {
  return db<RolePortal>('RolePortal').where({ name }).first();
};
