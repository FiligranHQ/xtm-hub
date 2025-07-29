import UserOrganizationPending from '../../model/kanel/public/UserOrganizationPending';
import { dbUnsecure } from '../../../knexfile';
import { UserId } from '../../model/kanel/public/User';
import { OrganizationId } from '../../model/kanel/public/Organization';

export const removeUserFromOrganizationPendingUnsecure = async (
  user_id: UserId,
  organization_id: OrganizationId
) => {
  return dbUnsecure<UserOrganizationPending>('User_Organization_Pending')
    .where({ user_id, organization_id })
    .delete('*');
};