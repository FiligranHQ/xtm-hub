import { db, dbRaw, dbUnsecure } from '../../../knexfile';
import Organization, {
  OrganizationId,
} from '../../model/kanel/public/Organization';
import User, { UserId } from '../../model/kanel/public/User';
import UserOrganizationPending, {
  UserOrganizationPendingInitializer,
  UserOrganizationPendingMutator,
} from '../../model/kanel/public/UserOrganizationPending';

export const UserOrganizationPendingDomain = {
  loadOrganizationsWithPendingUsers: async (): Promise<
    (Organization & { users: User[] })[]
  > => {
    return db<Organization>('Organization')
      .innerJoin(
        'User_Organization_Pending',
        'User_Organization_Pending.organization_id',
        '=',
        'Organization.id'
      )
      .leftJoin('User', 'User.id', '=', 'User_Organization_Pending.user_id')
      .select('Organization.*', dbRaw('json_agg("User") AS users'))
      .groupBy('Organization.id');
  },
};

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
