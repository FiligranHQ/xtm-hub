import { describe, expect, it } from 'vitest';
import { ServiceGroupId } from '../../../model/kanel/public/ServiceGroup';
import ServiceGroupUser from '../../../model/kanel/public/ServiceGroupUser';
import { UserId } from '../../../model/kanel/public/User';
import { UpdateGroupsPayload } from './service-group.app';
import { ServiceGroupHelper, UserGroups } from './service-group.helper';

describe('ServiceGroupHelper', () => {
  const userId1 = 'u1' as UserId;
  const userId2 = 'u2' as UserId;

  const groupId1 = 'g1' as ServiceGroupId;
  const groupId2 = 'g2' as ServiceGroupId;
  const groupId3 = 'g3' as ServiceGroupId;

  describe('buildUserGroupsDiff', () => {
    it('should return an empty array when oldUsers and newUsers are empty', () => {
      const result = ServiceGroupHelper.buildUserGroupsDiff([], []);
      expect(result).toEqual([]);
    });

    it("should not return users whose groups haven't changed", () => {
      const oldUsers: ServiceGroupUser[] = [
        { user_id: userId1, group_id: groupId1 },
        { user_id: userId2, group_id: groupId2 },
      ];
      const newUsers: UpdateGroupsPayload = [
        { id: groupId1, userIds: [userId1] },
        { id: groupId2, userIds: [userId2] },
      ];

      const expected: UserGroups[] = [];

      const result = ServiceGroupHelper.buildUserGroupsDiff(oldUsers, newUsers);
      expect(result).toEqual(expected);
    });

    it('should mark a user as modified when all of their groups are removed', () => {
      const oldUsers: ServiceGroupUser[] = [
        { user_id: userId1, group_id: groupId1 },
        { user_id: userId1, group_id: groupId2 },
      ];
      const newUsers: UpdateGroupsPayload = [];

      const expected: UserGroups[] = [{ user_id: userId1, group_ids: [] }];

      const result = ServiceGroupHelper.buildUserGroupsDiff(oldUsers, newUsers);
      expect(result).toEqual(expected);
    });

    it('should mark a user as modified when they are completely new', () => {
      const oldUsers: ServiceGroupUser[] = [];
      const newUsers: UpdateGroupsPayload = [
        { id: groupId1, userIds: [userId1] },
        { id: groupId2, userIds: [userId1] },
      ];
      const expected: UserGroups[] = [
        {
          user_id: userId1,
          group_ids: [groupId1, groupId2],
        },
      ];

      const result = ServiceGroupHelper.buildUserGroupsDiff(oldUsers, newUsers);
      expect(result).toEqual(expected);
    });

    it('should handle when a user had multiple groups and now has fewer', () => {
      const oldUsers: ServiceGroupUser[] = [
        { user_id: userId1, group_id: groupId1 },
        { user_id: userId1, group_id: groupId2 },
        { user_id: userId1, group_id: groupId3 },
      ];
      const newUsers: UpdateGroupsPayload = [
        { id: groupId1, userIds: [userId1] },
      ];

      const expected: UserGroups[] = [
        { user_id: userId1, group_ids: [groupId1] },
      ];

      const result = ServiceGroupHelper.buildUserGroupsDiff(oldUsers, newUsers);
      expect(result).toEqual(expected);
    });

    it('should handle when a user gains new groups', () => {
      const oldUsers: ServiceGroupUser[] = [
        { user_id: userId1, group_id: groupId1 },
      ];
      const newUsers: UpdateGroupsPayload = [
        { id: groupId1, userIds: [userId1] },
        { id: groupId2, userIds: [userId1] },
        { id: groupId3, userIds: [userId1] },
      ];

      const expected: UserGroups[] = [
        {
          user_id: userId1,
          group_ids: [groupId1, groupId2, groupId3],
        },
      ];

      const result = ServiceGroupHelper.buildUserGroupsDiff(oldUsers, newUsers);
      expect(result).toEqual(expected);
    });
  });
});
