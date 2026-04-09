import { v4 as uuidv4 } from 'uuid';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';
import { db } from '../../../../knexfile';
import {
  requestContextAdminSecondOrga,
  requestContextAdminUser,
  SERVICES,
  TEST_ORGANIZATIONS,
} from '../../../../tests/tests.const';
import {
  DeploymentRequestDeploymentType,
  DeploymentRequestHubStatus,
  DeploymentRequestPlatformRegion,
  PlatformIdentifier,
  ServiceConfigurationStatus,
  ServiceInstanceCreationStatus,
  ServiceInstanceJoinType,
} from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import DeploymentRequest, {
  DeploymentRequestId,
} from '../../../model/kanel/public/DeploymentRequest';
import ServiceConfiguration from '../../../model/kanel/public/ServiceConfiguration';
import ServiceGroup, {
  ServiceGroupId,
} from '../../../model/kanel/public/ServiceGroup';
import ServiceGroupUser from '../../../model/kanel/public/ServiceGroupUser';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import Subscription, {
  SubscriptionId,
} from '../../../model/kanel/public/Subscription';
import * as mailService from '../../../server/mail-service';
import { auth0ClientMock } from '../../../thirdparty/auth0/mock';
import { ErrorCode } from '../../../utils/error/error.code';
import { formatName } from '../../../utils/format';

import { deleteServiceInstanceBy } from '../../services/service-instance.domain';
import { insertDeploymentRequest } from '../deployment.test.utils';
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
    afterEach(async () => {
      vi.restoreAllMocks();
      await db('ServiceGroup_User')
        .whereIn('group_id', [
          adminGroupId,
          analystGroupId,
          adminGroupIdServiceInstance2,
          analystGroupIdServiceInstance2,
        ])
        .delete();
      await db('DeploymentRequest')
        .whereIn('service_instance_id', [
          serviceInstanceId1,
          serviceInstanceId2,
        ])
        .delete();
      await db('Subscription')
        .whereIn('service_instance_id', [
          serviceInstanceId1,
          serviceInstanceId2,
        ])
        .delete();
      await db('Service_Configuration')
        .whereIn('service_instance_id', [
          serviceInstanceId1,
          serviceInstanceId2,
        ])
        .delete();
    });

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
      requestContext.set(requestContextAdminUser);

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
      requestContext.set(requestContextAdminUser);

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

    describe('email sending for newly added users', () => {
      const platformId = uuidv4();
      const platformUrl = 'https://test-platform.example.com';
      const endDate = new Date('2026-06-01');

      beforeEach(async () => {
        await db<Subscription>('Subscription').insert({
          id: uuidv4() as SubscriptionId,
          service_instance_id: serviceInstanceId1,
          organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        });

        await db<DeploymentRequest>('DeploymentRequest').insert({
          id: uuidv4() as DeploymentRequestId,
          service_instance_id: serviceInstanceId1,
          platform_id: platformId,
          user_requester_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
          organization_requester_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
          type: DeploymentRequestDeploymentType.Trial,
          platform_identifier: PlatformIdentifier.Opencti,
          region: DeploymentRequestPlatformRegion.EuWest,
          end_date: endDate,
        });

        await db<ServiceConfiguration>('Service_Configuration').insert({
          service_instance_id: serviceInstanceId1,
          status: ServiceConfigurationStatus.Active,
          config: {
            platform_id: platformId,
            platform_url: platformUrl,
            registerer_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
            platform_title: 'Test Platform',
            platform_version: '1.0.0',
            platform_contract: 'EE',
            token: uuidv4(),
          },
        });
      });

      it('should send free_trial_user_added email to each newly added user', async () => {
        const sendMailSpy = vi
          .spyOn(mailService, 'sendMail')
          .mockResolvedValue(undefined);

        const expectedTrialEndDate = endDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: '2-digit',
        });

        await ServiceGroupApp.updateGroups([
          {
            id: adminGroupId,
            userIds: [TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID],
          },
          {
            id: analystGroupId,
            userIds: [TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID],
          },
        ]);

        expect(sendMailSpy).toHaveBeenCalledTimes(2);
        expect(sendMailSpy).toHaveBeenCalledWith({
          to: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.EMAIL,
          template: 'free_trial_user_added',
          params: {
            firstName: formatName(
              TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.FIRST_NAME
            ),
            platformUrl,
            platformIdentifier: PlatformIdentifier.Opencti,
            adminEmail: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.EMAIL,
            trialEndDate: expectedTrialEndDate,
          },
        });
        expect(sendMailSpy).toHaveBeenCalledWith({
          to: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.EMAIL,
          template: 'free_trial_user_added',
          params: {
            firstName: formatName(
              TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.FIRST_NAME
            ),
            platformUrl,
            platformIdentifier: PlatformIdentifier.Opencti,
            adminEmail: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.EMAIL,
            trialEndDate: expectedTrialEndDate,
          },
        });
      });

      it('should not send email to users already in the group', async () => {
        await db<ServiceGroupUser>('ServiceGroup_User').insert({
          group_id: adminGroupId,
          user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        });

        const sendMailSpy = vi
          .spyOn(mailService, 'sendMail')
          .mockResolvedValue(undefined);

        await ServiceGroupApp.updateGroups([
          {
            id: adminGroupId,
            userIds: [
              TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
              TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID,
            ],
          },
          { id: analystGroupId, userIds: [] },
        ]);

        expect(sendMailSpy).toHaveBeenCalledTimes(1);
        expect(sendMailSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            to: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.EMAIL,
            template: 'free_trial_user_added',
          })
        );
      });

      it('should not send any email when all users were already in their groups', async () => {
        await db<ServiceGroupUser>('ServiceGroup_User').insert([
          {
            group_id: adminGroupId,
            user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
          },
          {
            group_id: analystGroupId,
            user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID,
          },
        ]);

        const sendMailSpy = vi
          .spyOn(mailService, 'sendMail')
          .mockResolvedValue(undefined);

        await ServiceGroupApp.updateGroups([
          {
            id: adminGroupId,
            userIds: [TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID],
          },
          {
            id: analystGroupId,
            userIds: [TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID],
          },
        ]);

        expect(sendMailSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('removeExpiredGroups', () => {
    let auth0Spy: MockInstance;
    const trackedServiceInstanceIds: ServiceInstanceId[] = [];

    beforeEach(() => {
      auth0Spy = vi.spyOn(auth0ClientMock, 'updateUserRBACInstance');
    });

    afterEach(async () => {
      vi.restoreAllMocks();
      if (trackedServiceInstanceIds.length > 0) {
        await db('DeploymentRequest')
          .whereIn('service_instance_id', trackedServiceInstanceIds)
          .delete();
        await db('Subscription')
          .whereIn('service_instance_id', trackedServiceInstanceIds)
          .delete();
        await db('ServiceGroup')
          .whereIn('service_instance_id', trackedServiceInstanceIds)
          .delete();
        for (const id of trackedServiceInstanceIds) {
          await deleteServiceInstanceBy({ id });
        }
        trackedServiceInstanceIds.length = 0;
      }
    });

    it.each([
      DeploymentRequestHubStatus.Expired,
      DeploymentRequestHubStatus.Cancelled,
    ])('should remove users from groups for a %s trial', async (hub_status) => {
      // Given
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 8);
      const platformId = uuidv4();

      const deploymentRequest = await insertDeploymentRequest({
        hub_status,
        end_date: endDate,
        platform_id: platformId,
      });
      trackedServiceInstanceIds.push(deploymentRequest.service_instance_id);

      const groupId = uuidv4() as ServiceGroupId;
      await db<ServiceGroup>('ServiceGroup').insert({
        id: groupId,
        name: 'Admin',
        service_instance_id: deploymentRequest.service_instance_id,
      });
      await db<ServiceGroupUser>('ServiceGroup_User').insert({
        group_id: groupId,
        user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
      });

      // When
      await ServiceGroupApp.removeExpiredGroups();

      // Then
      const usersInGroup = await db<ServiceGroupUser>('ServiceGroup_User')
        .where('group_id', groupId)
        .select('*');
      expect(usersInGroup).toEqual([]);

      const groups = await db<ServiceGroup>('ServiceGroup')
        .where('id', groupId)
        .select('*');
      expect(groups).toEqual([]);
    });

    it('should call auth0 with empty groups for each affected user', async () => {
      // Given
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 8);
      const platformId = uuidv4();

      const deploymentRequest = await insertDeploymentRequest({
        hub_status: DeploymentRequestHubStatus.Expired,
        end_date: endDate,
        platform_id: platformId,
      });
      trackedServiceInstanceIds.push(deploymentRequest.service_instance_id);

      const groupId = uuidv4() as ServiceGroupId;
      await db<ServiceGroup>('ServiceGroup').insert({
        id: groupId,
        name: 'Admin',
        service_instance_id: deploymentRequest.service_instance_id,
      });
      await db<ServiceGroupUser>('ServiceGroup_User').insert([
        {
          group_id: groupId,
          user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        },
        {
          group_id: groupId,
          user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID,
        },
      ]);

      // When
      await ServiceGroupApp.removeExpiredGroups();

      // Then
      expect(auth0Spy).toHaveBeenCalledTimes(2);
      expect(auth0Spy).toHaveBeenCalledWith(
        TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.EMAIL,
        { [platformId]: { groups: [] } }
      );
      expect(auth0Spy).toHaveBeenCalledWith(
        TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.EMAIL,
        { [platformId]: { groups: [] } }
      );
    });

    it('should not remove users from DB when auth0 call fails', async () => {
      // Given
      auth0Spy.mockRejectedValue(new Error('Auth0 failure'));

      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 8);
      const platformId = uuidv4();

      const deploymentRequest = await insertDeploymentRequest({
        hub_status: DeploymentRequestHubStatus.Expired,
        end_date: endDate,
        platform_id: platformId,
      });
      trackedServiceInstanceIds.push(deploymentRequest.service_instance_id);

      const groupId = uuidv4() as ServiceGroupId;
      await db<ServiceGroup>('ServiceGroup').insert({
        id: groupId,
        name: 'Admin',
        service_instance_id: deploymentRequest.service_instance_id,
      });
      await db<ServiceGroupUser>('ServiceGroup_User').insert({
        group_id: groupId,
        user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
      });

      // When
      await ServiceGroupApp.removeExpiredGroups();

      // Then
      const usersInGroup = await db<ServiceGroupUser>('ServiceGroup_User')
        .where('group_id', groupId)
        .select('*');
      expect(usersInGroup).toMatchObject([
        {
          group_id: groupId,
          user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        },
      ]);

      const groups = await db<ServiceGroup>('ServiceGroup')
        .where('id', groupId)
        .select('*');
      expect(groups).toHaveLength(1);
    });

    it('should not call auth0 when there are no expired groups', async () => {
      // When
      await ServiceGroupApp.removeExpiredGroups();

      // Then
      expect(auth0Spy).not.toHaveBeenCalled();
    });
  });
});
