import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { db } from '../../../../knexfile';
import {
  ADMIN_USER_ID,
  THALES_ADMIN_ORGA_ID,
  THALES_SIMPLE_USER_ID,
} from '../../../../tests/tests.const';
import { ServiceInstanceCreationStatus } from '../../../__generated__/resolvers-types';
import ServiceGroup, {
  ServiceGroupId,
} from '../../../model/kanel/public/ServiceGroup';
import ServiceGroupUser from '../../../model/kanel/public/ServiceGroupUser';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { ServiceGroupDomain } from './service-group.domain';

describe('ServiceGroupDomain', () => {
  const adminGroupId = uuidv4() as ServiceGroupId;
  const analystGroupId = uuidv4() as ServiceGroupId;
  const readerGroupId = uuidv4() as ServiceGroupId;

  const serviceInstanceId1 = uuidv4() as ServiceInstanceId;
  const serviceInstanceId2 = uuidv4() as ServiceInstanceId;

  beforeAll(async () => {
    await db('ServiceInstance').insert([
      {
        id: serviceInstanceId1,
        name: 'Service instance 1',
        description: '',
        creation_status: ServiceInstanceCreationStatus.Ready,
        public: false,
        join_type: 'JOIN_AUTO',
        tags: [],
        service_definition_id: '5f769173-5ace-4ef3-b04f-2c95609c5b59',
      },
      {
        id: serviceInstanceId2,
        name: 'Service instance 2',
        description: '',
        creation_status: ServiceInstanceCreationStatus.Ready,
        public: false,
        join_type: 'JOIN_AUTO',
        tags: [],
        service_definition_id: '5f769173-5ace-4ef3-b04f-2c95609c5b59',
      },
    ]);

    await db<ServiceGroup>('ServiceGroup').insert([
      {
        id: adminGroupId,
        name: 'Admin',
        service_instance_id: serviceInstanceId1,
      },
      {
        id: analystGroupId,
        name: 'Analyst',
        service_instance_id: serviceInstanceId1,
      },
      {
        id: readerGroupId,
        name: 'Reader',
        service_instance_id: serviceInstanceId2,
      },
    ]);
  });

  afterEach(async () => {
    await db('ServiceGroup_User').del();
  });

  describe('loadGroupsServiceInstanceIds', () => {
    it('should return distinct service instance ids associated with groups', async () => {
      const groupIds = [adminGroupId, analystGroupId, readerGroupId];
      const ids =
        await ServiceGroupDomain.loadGroupsServiceInstanceIds(groupIds);

      expect(ids.length).toBe(2);
      expect(ids.find((id) => id === serviceInstanceId1)).toBeTruthy();
      expect(ids.find((id) => id === serviceInstanceId2)).toBeTruthy();
    });
  });

  describe('loadGroupUsers', () => {
    it('should return users associated to service group', async () => {
      await db('ServiceGroup_User').insert([
        {
          user_id: ADMIN_USER_ID,
          group_id: adminGroupId,
        },
        {
          user_id: THALES_ADMIN_ORGA_ID,
          group_id: adminGroupId,
        },
        {
          user_id: THALES_SIMPLE_USER_ID,
          group_id: analystGroupId,
        },
      ]);

      const adminUsers = await ServiceGroupDomain.loadGroupUsers(adminGroupId);
      expect(adminUsers.length).toBe(2);
      expect(adminUsers.find(({ id }) => id === ADMIN_USER_ID)).toBeTruthy();
      expect(
        adminUsers.find(({ id }) => id === THALES_ADMIN_ORGA_ID)
      ).toBeTruthy();

      const analystUsers =
        await ServiceGroupDomain.loadGroupUsers(analystGroupId);
      expect(analystUsers.length).toBe(1);
      expect(analystUsers[0]?.id === THALES_SIMPLE_USER_ID).toBe(true);
    });
  });

  describe('addUsersToGroup', () => {
    it('should add users to the service group', async () => {
      await ServiceGroupDomain.addUsersToGroup(adminGroupId, [
        ADMIN_USER_ID,
        THALES_ADMIN_ORGA_ID,
      ]);

      const serviceGroupUsers = await db<ServiceGroupUser[]>(
        'ServiceGroup_User'
      )
        .where('group_id', '=', adminGroupId)
        .select('*');

      expect(serviceGroupUsers.length).toBe(2);
      expect(
        serviceGroupUsers.find(({ user_id }) => user_id === ADMIN_USER_ID)
      );
      expect(
        serviceGroupUsers.find(
          ({ user_id }) => user_id === THALES_ADMIN_ORGA_ID
        )
      );
    });
  });
});
