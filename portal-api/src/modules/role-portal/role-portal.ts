import { dbUnsecure } from '../../../knexfile';
import RolePortal from '../../model/kanel/public/RolePortal';

export const getRolePortalByName = (name: string) => {
  return dbUnsecure<RolePortal>('RolePortal').where({ name }).first();
};
