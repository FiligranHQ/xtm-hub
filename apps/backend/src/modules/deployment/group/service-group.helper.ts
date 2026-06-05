import { ServiceGroupId } from '../../../model/kanel/public/ServiceGroup';
import ServiceGroupUser from '../../../model/kanel/public/ServiceGroupUser';
import { UserId } from '../../../model/kanel/public/User';
import { UpdateGroupsPayload } from './service-group.app';

export type UserGroups = { user_id: UserId; group_ids: ServiceGroupId[] };

export const ServiceGroupHelper = {
  buildUserGroupsDiff: (
    oldUsers: ServiceGroupUser[],
    newUsers: UpdateGroupsPayload
  ): UserGroups[] => {
    const oldUserGroups = buildGroupsByUserIdFromOldUsers(oldUsers);
    const newUserGroups = buildGroupsByUserIdFromNewUsers(newUsers);

    const allUserIds = new Set<UserId>([
      ...oldUserGroups.keys(),
      ...newUserGroups.keys(),
    ]);

    const modifiedUsers: UserGroups[] = [];

    for (const user_id of allUserIds) {
      const oldGroups = oldUserGroups.get(user_id);
      const newGroups = newUserGroups.get(user_id);

      if (!areGroupSetsEqual(oldGroups, newGroups)) {
        modifiedUsers.push({
          user_id,
          group_ids: newGroups ? Array.from(newGroups) : [],
        });
      }
    }

    return modifiedUsers;
  },
};

const buildGroupsByUserIdFromOldUsers = (
  oldUsers: ServiceGroupUser[]
): Map<UserId, Set<ServiceGroupId>> => {
  const userGroups = new Map<UserId, Set<ServiceGroupId>>();

  for (const { user_id, group_id } of oldUsers) {
    let set = userGroups.get(user_id);
    if (!set) {
      set = new Set();
      userGroups.set(user_id, set);
    }
    set.add(group_id);
  }

  return userGroups;
};

const buildGroupsByUserIdFromNewUsers = (
  newUsers: UpdateGroupsPayload
): Map<UserId, Set<ServiceGroupId>> => {
  const groupsIndexedByUserId = new Map<UserId, Set<ServiceGroupId>>();

  for (const { id, userIds } of newUsers) {
    for (const user_id of userIds) {
      let set = groupsIndexedByUserId.get(user_id);
      if (!set) {
        set = new Set();
        groupsIndexedByUserId.set(user_id, set);
      }
      set.add(id);
    }
  }

  return groupsIndexedByUserId;
};

const areGroupSetsEqual = (
  a: Set<string> | undefined,
  b: Set<string> | undefined
): boolean => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (a.size !== b.size) return false;

  for (const value of a) {
    if (!b.has(value)) return false;
  }
  return true;
};
