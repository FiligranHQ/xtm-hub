import { v4 as uuidv4 } from 'uuid';
import { beforeAll, describe, expect, it } from 'vitest';
import { db } from '../../../../knexfile';
import {
  ADMIN_USER_ID,
  FILIGRAN_USER_ID,
  requestContextSimpleUserThales,
  THALES_ADMIN_ORGA_ID,
  THALES_SIMPLE_USER_ID,
} from '../../../../tests/tests.const';
import { ServiceInstanceCreationStatus } from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import ServiceGroup, {
  ServiceGroupId,
} from '../../../model/kanel/public/ServiceGroup';
import ServiceGroupUser from '../../../model/kanel/public/ServiceGroupUser';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { ErrorCode } from '../../../utils/error/error.code';
import { ServiceGroupApp } from './service-group.app';

describe('ServiceGroupApp', () => {
  const adminGroupId = uuidv4() as ServiceGroupId;
  const analystGroupId = uuidv4() as ServiceGroupId;

  const serviceInstanceId = uuidv4() as ServiceInstanceId;

  beforeAll(async () => {
    await db('ServiceInstance').insert([
      {
        id: serviceInstanceId,
        name: 'Service instance',
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
        service_instance_id: serviceInstanceId,
      },
      {
        id: analystGroupId,
        name: 'Analyst',
        service_instance_id: serviceInstanceId,
      },
    ]);
  });

  describe('updateGroups', () => {
    const payload = [
      { id: adminGroupId, userIds: [ADMIN_USER_ID, THALES_ADMIN_ORGA_ID] },
      { id: analystGroupId, userIds: [THALES_SIMPLE_USER_ID] },
    ];

    it('should prevent user from updating a group when he does not have the capability', async () => {
      requestContext.set(requestContextSimpleUserThales);

      const call = ServiceGroupApp.updateGroups(payload);

      await expect(call).rejects.toThrow(
        ErrorCode.MissingCapabilityOnOrganization
      );
    });

    it('should update groups with new user list and remove old ones', async () => {
      await db('ServiceGroup_User').insert({
        group_id: analystGroupId,
        user_id: FILIGRAN_USER_ID,
      });

      const result = await ServiceGroupApp.updateGroups(payload);

      expect(result.success).toBeTruthy();

      const admins = await db<ServiceGroupUser[]>('ServiceGroup_User')
        .where('group_id', '=', adminGroupId)
        .select('*');

      expect(admins.length).toBe(2);
      expect(admins.find(({ user_id }) => user_id === ADMIN_USER_ID)).toBe(
        true
      );
      expect(
        admins.find(({ user_id }) => user_id === THALES_ADMIN_ORGA_ID)
      ).toBe(true);

      const analysts = await db<ServiceGroupUser[]>('ServiceGroup_User')
        .where('group_id', analystGroupId)
        .select('*');

      expect(analysts.length).toBe(1);
      expect(analysts[0]?.user_id).toBe(THALES_SIMPLE_USER_ID);
    });
  });
});
