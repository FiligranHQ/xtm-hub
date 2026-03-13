import { v4 as uuidv4 } from 'uuid';
import { beforeAll, describe, expect, it } from 'vitest';
import { db } from '../../../../knexfile';
import {
  requestContextAdminSecondOrga,
  SERVICES,
  TEST_ORGANIZATIONS,
} from '../../../../tests/tests.const';
import {
  DeploymentRequestDeploymentType,
  DeploymentRequestPlatformRegion,
  PlatformIdentifier,
  ServiceInstanceCreationStatus,
  ServiceInstanceJoinType,
} from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import DeploymentRequest, {
  DeploymentRequestId,
} from '../../../model/kanel/public/DeploymentRequest';
import ServiceGroup, {
  ServiceGroupId,
} from '../../../model/kanel/public/ServiceGroup';
import ServiceGroupUser from '../../../model/kanel/public/ServiceGroupUser';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import Subscription, {
  SubscriptionId,
} from '../../../model/kanel/public/Subscription';
import { ErrorCode } from '../../../utils/error/error.code';
import { ServiceGroupApp } from './service-group.app';

describe('ServiceGroupApp', () => {
  const adminGroupId = uuidv4() as ServiceGroupId;
  const analystGroupId = uuidv4() as ServiceGroupId;
  const adminGroupIdServiceInstance2 = uuidv4() as ServiceGroupId;
  const analystGroupIdServiceInstance2 = uuidv4() as ServiceGroupId;

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
        join_type: ServiceInstanceJoinType.JoinAuto,
        tags: [],
        service_definition_id: SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID,
      },
      {
        id: serviceInstanceId2,
        name: 'Service instance 2',
        description: '',
        creation_status: ServiceInstanceCreationStatus.Ready,
        public: false,
        join_type: ServiceInstanceJoinType.JoinAuto,
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
        id: adminGroupIdServiceInstance2,
        name: 'Admin',
        service_instance_id: serviceInstanceId2,
      },
      {
        id: analystGroupIdServiceInstance2,
        name: 'Analyst',
        service_instance_id: serviceInstanceId2,
      },
    ]);
  });

  describe('updateGroups', () => {
    const payload = [
      {
        id: adminGroupId,
        userIds: [
          TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID,
        ],
      },
      {
        id: analystGroupId,
        userIds: [TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.ID],
      },
    ];

    it('should prevent user from updating groups in multiple service instances', async () => {
      const call = ServiceGroupApp.updateGroups([
        ...payload,
        {
          id: adminGroupIdServiceInstance2,
          userIds: [
            TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
            TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID,
          ],
        },
      ]);

      await expect(call).rejects.toThrow(
        ErrorCode.ServiceGroupsLinkedToMultipleServiceInstances
      );
    });

    it('should prevent user from updating groups in another organization than selected', async () => {
      await db<Subscription>('Subscription').insert({
        id: uuidv4() as SubscriptionId,
        service_instance_id: serviceInstanceId1,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
      });

      requestContext.set(requestContextAdminSecondOrga);
      const call = ServiceGroupApp.updateGroups(payload);

      await expect(call).rejects.toThrow(
        ErrorCode.OrganizationDoesNotMatchSelectedOrganization
      );
    });

    it('should allow bypass user to update groups in another organization', async () => {
      await db<Subscription>('Subscription').insert({
        id: uuidv4() as SubscriptionId,
        service_instance_id: serviceInstanceId2,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
      });
      await db<DeploymentRequest>('DeploymentRequest').insert({
        id: uuidv4() as DeploymentRequestId,
        service_instance_id: serviceInstanceId2,
        platform_id: uuidv4(),
        user_requester_id:
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID,
        organization_requester_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        type: DeploymentRequestDeploymentType.Trial,
        platform_identifier: PlatformIdentifier.Opencti,
        region: DeploymentRequestPlatformRegion.EuWest,
      });

      const bypassPayload = [
        {
          id: adminGroupIdServiceInstance2,
          userIds: [TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID],
        },
        {
          id: analystGroupIdServiceInstance2,
          userIds: [TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.ID],
        },
      ];

      const result = await ServiceGroupApp.updateGroups(bypassPayload);

      expect(result.success).toBeTruthy();
    });

    it('should update groups with new user list and remove old ones', async () => {
      await db<ServiceGroupUser>('ServiceGroup_User').insert({
        group_id: analystGroupId,
        user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID,
      });
      await db<DeploymentRequest>('DeploymentRequest').insert({
        id: uuidv4() as DeploymentRequestId,
        service_instance_id: serviceInstanceId1,
        platform_id: uuidv4(),
        user_requester_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID,
        organization_requester_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        type: DeploymentRequestDeploymentType.Trial,
        platform_identifier: PlatformIdentifier.Opencti,
        region: DeploymentRequestPlatformRegion.EuWest,
      });

      const result = await ServiceGroupApp.updateGroups(payload);

      expect(result.success).toBeTruthy();

      const admins = await db<ServiceGroupUser[]>('ServiceGroup_User')
        .where('group_id', '=', adminGroupId)
        .select('*');

      expect(admins.length).toBe(2);
      expect(
        admins.find(
          ({ user_id }) =>
            user_id === TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID
        )
      ).toBeTruthy();
      expect(
        admins.find(
          ({ user_id }) =>
            user_id ===
            TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID
        )
      ).toBeTruthy();

      const analysts = await db<ServiceGroupUser[]>('ServiceGroup_User')
        .where('group_id', analystGroupId)
        .select('*');

      expect(analysts.length).toBe(1);
      expect(analysts[0]?.user_id).toBe(
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.ID
      );
    });
  });
});
