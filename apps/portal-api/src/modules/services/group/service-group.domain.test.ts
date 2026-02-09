import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { db } from '../../../../knexfile';
import { SERVICES, TEST_ORGANIZATIONS } from '../../../../tests/tests.const';
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
        service_definition_id: SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID,
      },
      {
        id: serviceInstanceId2,
        name: 'Service instance 2',
        description: '',
        creation_status: ServiceInstanceCreationStatus.Ready,
        public: false,
        join_type: 'JOIN_AUTO',
        tags: [],
        service_definition_id: SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID,
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
          user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
          group_id: adminGroupId,
        },
        {
          user_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID,
          group_id: adminGroupId,
        },
        {
          user_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.ID,
          group_id: analystGroupId,
        },
      ]);

      const adminUsers = await ServiceGroupDomain.loadGroupUsers(adminGroupId);
      expect(adminUsers.length).toBe(2);
      expect(
        adminUsers.find(
          ({ id }) => id === TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID
        )
      ).toBeTruthy();
      expect(
        adminUsers.find(
          ({ id }) =>
            id === TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID
        )
      ).toBeTruthy();

      const analystUsers =
        await ServiceGroupDomain.loadGroupUsers(analystGroupId);
      expect(analystUsers.length).toBe(1);
      expect(
        analystUsers[0]?.id ===
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.ID
      ).toBe(true);
    });
  });

  describe('addUsersToGroup', () => {
    it('should add users to the service group', async () => {
      await ServiceGroupDomain.addUsersToGroup(adminGroupId, [
        TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID,
      ]);

      const serviceGroupUsers = await db<ServiceGroupUser[]>(
        'ServiceGroup_User'
      )
        .where('group_id', '=', adminGroupId)
        .select('*');

      expect(serviceGroupUsers.length).toBe(2);
      expect(
        serviceGroupUsers.find(
          ({ user_id }) =>
            user_id === TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID
        )
      );
      expect(
        serviceGroupUsers.find(
          ({ user_id }) =>
            user_id ===
            TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID
        )
      );
    });
  });
});
