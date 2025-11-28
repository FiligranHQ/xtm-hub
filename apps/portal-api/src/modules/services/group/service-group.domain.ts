import { db } from '../../../../knexfile';
import ServiceGroup, {
  ServiceGroupId,
  ServiceGroupMutator,
} from '../../../model/kanel/public/ServiceGroup';
import User from '../../../model/kanel/public/User';

export const ServiceGroupDomain = {
  loadServiceGroups: async (
    field: ServiceGroupMutator
  ): Promise<ServiceGroup[]> => {
    return db<ServiceGroup[]>('ServiceGroup').select('*').where(field);
  },

  loadGroupUsers: async (groupId: ServiceGroupId): Promise<User[]> => {
    return db<User[]>('ServiceGroup')
      .leftJoin(
        'ServiceGroup_User',
        'ServiceGroup.id',
        '=',
        'ServiceGroup_User.group_id'
      )
      .innerJoin('User', 'ServiceGroup_User.user_id', '=', 'User.id')
      .where('ServiceGroup.id', '=', groupId)
      .select('User.*');
  },
};
