import { db } from '../../../../knexfile';
import { PlatformIdentifier } from '../../../__generated__/resolvers-types';
import ServiceGroup, {
  ServiceGroupId,
  ServiceGroupMutator,
} from '../../../model/kanel/public/ServiceGroup';
import ServiceGroupUser, {
  ServiceGroupUserInitializer,
} from '../../../model/kanel/public/ServiceGroupUser';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import User, { UserId } from '../../../model/kanel/public/User';

export enum ServiceGroupName {
  Admin = 'Admin',
  Analyst = 'Analyst',
  Reader = 'Reader',
  Manager = 'Manager',
  Observer = 'Observer',
}

export const GROUPS_BY_PLATFORM_IDENTIFIER: Record<
  PlatformIdentifier,
  readonly ServiceGroupName[]
> = {
  [PlatformIdentifier.Opencti]: [
    ServiceGroupName.Admin,
    ServiceGroupName.Analyst,
    ServiceGroupName.Reader,
  ],
  [PlatformIdentifier.Openaev]: [
    ServiceGroupName.Admin,
    ServiceGroupName.Manager,
    ServiceGroupName.Observer,
  ],
};

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
    name: ServiceGroupName
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
    serviceInstancesId: ServiceInstanceId,
    platformIdentifier: PlatformIdentifier = PlatformIdentifier.Opencti
  ) => {
    const groups = GROUPS_BY_PLATFORM_IDENTIFIER[platformIdentifier];
    const rolesToInsert = groups.map((groupName) => ({
      name: groupName,
      service_instance_id: serviceInstancesId,
    }));
    const insertResponse = await db<ServiceGroup>('ServiceGroup')
      .insert(rolesToInsert)
      .returning(['id', 'name']);
    const findAdminGroupId = insertResponse.find(
      (group) => group.name === ServiceGroupName.Admin
    );
    await ServiceGroupDomain.addUsersToGroup(findAdminGroupId.id, [
      userAdminId,
    ]);
  },
};
