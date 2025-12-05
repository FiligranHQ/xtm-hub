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

const DEFAULT_SERVICE_GROUP = ['Admin', 'Analyst', 'Reader'] as const;
type DefaultServiceGroup = (typeof DEFAULT_SERVICE_GROUP)[number];

export const ServiceGroupDomain = {
  loadGroupsServiceInstanceIds: async (
    groupIds: ServiceGroupId[]
  ): Promise<ServiceInstanceId[]> => {
    const serviceInstances = await db<{ id: ServiceInstanceId }[]>(
      'ServiceInstance'
    )
      .leftJoin(
        'ServiceGroup',
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

  loadGroupUsersByServiceAndName: async (
    serviceInstanceId: ServiceInstanceId,
    name: DefaultServiceGroup
  ): Promise<User[]> => {
    return db<User[]>('ServiceGroup')
      .leftJoin(
        'ServiceGroup_User',
        'ServiceGroup.id',
        '=',
        'ServiceGroup_User.group_id'
      )
      .innerJoin('User', 'ServiceGroup_User.user_id', '=', 'User.id')
      .where('ServiceGroup.service_instance_id', '=', serviceInstanceId)
      .where('ServiceGroup.name', '=', name)
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

  loadServiceInstanceGroupUsers: async (
    serviceInstanceId: ServiceInstanceId
  ): Promise<ServiceGroupUser[]> => {
    return db<ServiceGroupUser>('ServiceGroup_User')
      .leftJoin(
        'ServiceGroup',
        'ServiceGroup.id',
        '=',
        'ServiceGroup_User.group_id'
      )
      .where('ServiceGroup.service_instance_id', '=', serviceInstanceId)
      .select('ServiceGroup_User.*');
  },

  initGroupWithAdmin: async (
    userAdminId: UserId,
    serviceInstancesId: ServiceInstanceId
  ) => {
    const rolesToInsert = DEFAULT_SERVICE_GROUP.map((instance) => ({
      name: instance,
      service_instance_id: serviceInstancesId,
    }));
    const insertResponse = await db<ServiceGroup>('ServiceGroup')
      .insert(rolesToInsert)
      .returning(['id', 'name']);
    const findAdminGroupId = insertResponse.find(
      (group) => group.name === 'Admin'
    );
    await ServiceGroupDomain.addUsersToGroup(findAdminGroupId.id, [
      userAdminId,
    ]);
  },
};
