import { db, dbUnsecure } from '../../../knexfile';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { UserId } from '../../model/kanel/public/User';
import UserOrganizationPending, {
  UserOrganizationPendingInitializer,
  UserOrganizationPendingMutator,
} from '../../model/kanel/public/UserOrganizationPending';

export const insertNewUserOrganizationPendingUnsecure = (
  field: UserOrganizationPendingInitializer
): Promise<UserOrganizationPending[]> => {
  return dbUnsecure<UserOrganizationPending>('User_Organization_Pending')
    .insert(field)
    .returning('*');
};

export const loadUserOrganizationPending = (
  field: UserOrganizationPendingMutator
): Promise<UserOrganizationPending[]> => {
  return db<UserOrganizationPending>('User_Organization_Pending')
    .where(field)
    .secureQuery();
};

export const removeUserFromOrganizationPending = async (
  user_id: UserId,
  organization_id: OrganizationId
) => {
  return db<UserOrganizationPending>('User_Organization_Pending')
    .where({ user_id, organization_id })
    .delete('*')
    .secureQuery();
};
