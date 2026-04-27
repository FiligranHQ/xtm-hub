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
import {
  requestContextAdminSecondOrga,
  // eslint-disable-next-line no-restricted-imports
  requestContextAdminUser,
  SERVICES,
  TEST_ORGANIZATIONS,
} from '../../../../tests/tests.const';
import {
  DeploymentRequestHubStatus,
  PlatformIdentifier,
  ServiceConfigurationStatus,
  ServiceInstanceCreationStatus,
  ServiceInstanceJoinType,
} from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import { ServiceGroupId } from '../../../model/kanel/public/ServiceGroup';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import * as mailService from '../../../server/mail-service';
import { auth0ClientMock } from '../../../thirdparty/auth0/mock';
import { ErrorCode } from '../../../utils/error/error.code';
import { formatName } from '../../../utils/format';

import { TestHelper } from '../../../../tests/helper/test.helper';
import { deleteServiceInstanceBy } from '../../service/instance/service-instance.domain';
import { insertDeploymentRequest } from '../deployment.test.utils';
import { ServiceGroupApp } from './service-group.app';

describe('serviceGroupApp', () => {
  const adminGroupId = uuidv4() as ServiceGroupId;
  const analystGroupId = uuidv4() as ServiceGroupId;
  const adminGroupIdServiceInstance2 = uuidv4() as ServiceGroupId;
  const analystGroupIdServiceInstance2 = uuidv4() as ServiceGroupId;

  const serviceInstanceId1 = uuidv4() as ServiceInstanceId;
  const serviceInstanceId2 = uuidv4() as ServiceInstanceId;

  beforeAll(async () => {
    await TestHelper.serviceInstance.create({
      id: serviceInstanceId1,
      name: 'Service instance 1',
      description: '',
      creation_status: ServiceInstanceCreationStatus.Ready,
      public: false,
      join_type: ServiceInstanceJoinType.JoinAuto,
      tags: [],
      service_definition_id: SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID,
    });
    await TestHelper.serviceInstance.create({
      id: serviceInstanceId2,
      name: 'Service instance 2',
      description: '',
      creation_status: ServiceInstanceCreationStatus.Ready,
      public: false,
      join_type: ServiceInstanceJoinType.JoinAuto,
      tags: [],
      service_definition_id: SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID,
    });

    await TestHelper.serviceGroup.create({
      id: adminGroupId,
      name: 'Admin',
      service_instance_id: serviceInstanceId1,
    });
    await TestHelper.serviceGroup.create({
      id: analystGroupId,
      name: 'Analyst',
      service_instance_id: serviceInstanceId1,
    });
    await TestHelper.serviceGroup.create({
      id: adminGroupIdServiceInstance2,
      name: 'Admin',
      service_instance_id: serviceInstanceId2,
    });
    await TestHelper.serviceGroup.create({
      id: analystGroupIdServiceInstance2,
      name: 'Analyst',
      service_instance_id: serviceInstanceId2,
    });
  });

  describe('updateGroups', () => {
    afterEach(async () => {
      for (const groupId of [
        adminGroupId,
        analystGroupId,
        adminGroupIdServiceInstance2,
        analystGroupIdServiceInstance2,
      ]) {
        await TestHelper.serviceGroupUser.delete({ group_id: groupId });
      }

      for (const serviceInstanceId of [
        serviceInstanceId1,
        serviceInstanceId2,
      ]) {
        await TestHelper.deploymentRequest.delete({
          service_instance_id: serviceInstanceId,
        });
        await TestHelper.subscription.delete({
          service_instance_id: serviceInstanceId,
        });
        await TestHelper.serviceConfiguration.delete({
          service_instance_id: serviceInstanceId,
        });
      }
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
      await TestHelper.subscription.create({
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

      await TestHelper.subscription.create({
        service_instance_id: serviceInstanceId2,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
      });

      await TestHelper.deploymentRequest.create({
        service_instance_id: serviceInstanceId2,
        user_requester_id:
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID,
        organization_requester_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
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

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(2);
    });

    it('should update groups with new user list and remove old ones', async () => {
      requestContext.set(requestContextAdminUser);

      await TestHelper.serviceGroupUser.create({
        group_id: analystGroupId,
        user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID,
      });
      await TestHelper.deploymentRequest.create({
        service_instance_id: serviceInstanceId1,
        user_requester_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID,
        organization_requester_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
      });

      const result = await ServiceGroupApp.updateGroups(payload);

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(2);

      const admins = await TestHelper.serviceGroupUser.load({
        group_id: adminGroupId,
      });

      expect(admins).toHaveLength(2);
      expect(
        admins!.find(
          ({ user_id }) =>
            user_id === TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID
        )
      ).toBeTruthy();
      expect(
        admins!.find(
          ({ user_id }) =>
            user_id ===
            TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID
        )
      ).toBeTruthy();

      const analysts = await TestHelper.serviceGroupUser.load({
        group_id: analystGroupId,
      });

      expect(analysts).toHaveLength(1);
      expect(analysts?.[0]?.user_id).toBe(
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.ID
      );
    });

    describe('email sending for newly added users', () => {
      const platformId = uuidv4();
      const platformUrl = 'https://test-platform.example.com';
      const endDate = new Date('2026-06-01');

      beforeEach(async () => {
        await TestHelper.subscription.create({
          service_instance_id: serviceInstanceId1,
          organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        });
        await TestHelper.deploymentRequest.create({
          service_instance_id: serviceInstanceId1,
          platform_id: platformId,
          user_requester_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
          organization_requester_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
          end_date: endDate,
        });

        await TestHelper.serviceConfiguration.create({
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
        await TestHelper.serviceGroupUser.create({
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
        await TestHelper.serviceGroupUser.create({
          group_id: adminGroupId,
          user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        });
        await TestHelper.serviceGroupUser.create({
          group_id: analystGroupId,
          user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID,
        });

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
      if (trackedServiceInstanceIds.length > 0) {
        for (const serviceInstanceId of trackedServiceInstanceIds) {
          await TestHelper.deploymentRequest.delete({
            service_instance_id: serviceInstanceId,
          });
          await TestHelper.subscription.delete({
            service_instance_id: serviceInstanceId,
          });
          await TestHelper.serviceGroup.delete({
            service_instance_id: serviceInstanceId,
          });
        }

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
      await TestHelper.serviceGroup.create({
        id: groupId,
        name: 'Admin',
        service_instance_id: deploymentRequest.service_instance_id,
      });
      await TestHelper.serviceGroupUser.create({
        group_id: groupId,
        user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
      });

      // When
      await ServiceGroupApp.removeExpiredGroups();

      // Then
      const usersInGroup = await TestHelper.serviceGroupUser.load({
        group_id: groupId,
      });
      expect(usersInGroup).toEqual([]);

      const groups = await TestHelper.serviceGroup.load({
        id: groupId,
      });

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
      await TestHelper.serviceGroup.create({
        id: groupId,
        name: 'Admin',
        service_instance_id: deploymentRequest.service_instance_id,
      });
      await TestHelper.serviceGroupUser.create({
        group_id: groupId,
        user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
      });
      await TestHelper.serviceGroupUser.create({
        group_id: groupId,
        user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID,
      });

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
      await TestHelper.serviceGroup.create({
        id: groupId,
        name: 'Admin',
        service_instance_id: deploymentRequest.service_instance_id,
      });
      await TestHelper.serviceGroupUser.create({
        group_id: groupId,
        user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
      });

      // When
      await ServiceGroupApp.removeExpiredGroups();

      // Then
      const usersInGroup = await TestHelper.serviceGroupUser.load({
        group_id: groupId,
      });
      expect(usersInGroup).toMatchObject([
        {
          group_id: groupId,
          user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        },
      ]);

      const groups = await TestHelper.serviceGroup.load({
        id: groupId,
      });
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
