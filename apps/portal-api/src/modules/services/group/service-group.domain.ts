import { db } from '../../../../knexfile';
import ServiceGroup, {
  ServiceGroupId,
  ServiceGroupMutator,
} from '../../../model/kanel/public/ServiceGroup';
import ServiceGroupUser, {
  ServiceGroupUserInitializer,
} from '../../../model/kanel/public/ServiceGroupUser';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import User, { UserId } from '../../../model/kanel/public/User';

export const ServiceGroupDomain = {
  loadGroupsServiceInstanceIds: async (
    groupIds: ServiceGroupId[]
  ): Promise<ServiceInstanceId[]> => {
    const serviceInstances = await db<ServiceInstanceId[]>('ServiceGroup')
      .leftJoin(
        'ServiceInstance',
        'ServiceGroup.service_instance_id',
        '=',
        'ServiceInstance.id'
      )
      .whereIn('ServiceGroup.id', groupIds)
      .distinct('ServiceInstance.id')
      .select('ServiceInstance.id');

    return serviceInstances.map(({ id }) => id);
  },

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

  addUsersToGroup: async (groupId: ServiceGroupId, userIds: UserId[]) => {
    if (!userIds.length) {
      return;
    }

    const data: ServiceGroupUserInitializer[] = userIds.map((userId) => ({
      user_id: userId,
      group_id: groupId,
    }));

    await db<ServiceGroupUser>('ServiceGroup_User').insert(data);
  },

  removeUsersFromGroups: async (groupIds: ServiceGroupId[]) => {
    if (!groupIds.length) {
      return;
    }

    await db('ServiceGroup_User').del().whereIn('group_id', groupIds);
  },
};
