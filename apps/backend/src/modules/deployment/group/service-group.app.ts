import {
  BundleUserServiceGroup,
  DeploymentRequestDeploymentType,
  ServiceGroupName,
  ServiceGroup as ServiceGroupResponse,
} from '../../../__generated__/resolvers-types';
import { withTransaction } from '../../../context/database.context';
import { requestContext } from '../../../context/request.context';
import ServiceGroupModel, {
  ServiceGroupId,
} from '../../../model/kanel/public/ServiceGroup';
import ServiceGroupUser from '../../../model/kanel/public/ServiceGroupUser';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import User, { UserId } from '../../../model/kanel/public/User';
import { sendMail } from '../../../server/mail-service';
import { auth0Client } from '../../../thirdparty/auth0/client';
import { logApp } from '../../../utils/app-logger.util';
import { ErrorCode } from '../../../utils/error/error.code';
import { formatName } from '../../../utils/format';
import { OrganizationDomain } from '../../organization-management/organization/organization.domain';
import { UserDomain } from '../../organization-management/user/user-domain/user.domain';
import { PlatformConfigurationDomain } from '../../registration/platform-configuration/platform-configuration.domain';
import { AuthHelper } from '../../security-management/capability/auth.helper';
import { DeploymentRequestDomain } from '../deployment.domain';
import { ServiceGroupDomain } from './service-group.domain';
import { ServiceGroupHelper } from './service-group.helper';

export type UpdateGroupsPayload = { id: ServiceGroupId; userIds: UserId[] }[];

const toServiceGroupResponse = (
  serviceGroup: ServiceGroupModel
): ServiceGroupResponse => ({
  ...serviceGroup,
  name: serviceGroup.name as ServiceGroupName,
});

export const ServiceGroupApp = {
  loadGroups: async ({
    serviceInstanceId,
  }: {
    serviceInstanceId: ServiceInstanceId;
  }): Promise<ServiceGroupResponse[]> => {
    const serviceGroups = await ServiceGroupDomain.loadServiceGroups({
      service_instance_id: serviceInstanceId,
    });
    return serviceGroups.map(toServiceGroupResponse);
  },

  loadGroupUsers: async (groupId: ServiceGroupId): Promise<User[]> => {
    return ServiceGroupDomain.loadGroupUsers(groupId);
  },

  loadGroupsByServiceInstanceAndUser: async (
    serviceInstanceId: ServiceInstanceId,
    userId: UserId
  ): Promise<ServiceGroupResponse[]> => {
    const serviceGroups =
      await ServiceGroupDomain.loadServiceGroupsByServiceInstanceAndUser(
        serviceInstanceId,
        userId
      );
    return serviceGroups.map(toServiceGroupResponse);
  },

  loadBundleUserServiceGroups: async (
    serviceInstanceId: ServiceInstanceId
  ): Promise<BundleUserServiceGroup[]> => {
    const user = requestContext.requireUser();

    const bundleDeploymentRequest =
      await DeploymentRequestDomain.loadDeploymentRequestBy({
        service_instance_id: serviceInstanceId,
      });
    if (!bundleDeploymentRequest) {
      throw new Error(ErrorCode.DeploymentRequestNotFound);
    }

    const bundleOrganization =
      await OrganizationDomain.loadOrganizationSubscribedToServiceInstance(
        serviceInstanceId
      );
    if (!bundleOrganization) {
      throw new Error(ErrorCode.SubscriptionNotFound);
    }
    if (
      !AuthHelper.userHasBypassCapability(user) &&
      bundleOrganization.id !== user.selected_organization_id
    ) {
      throw new Error(ErrorCode.OrganizationDoesNotMatchSelectedOrganization);
    }

    const rows = await UserDomain.loadUsersWithDeploymentServiceGroups(
      bundleDeploymentRequest.id
    );

    const bundleUserServiceGroupsByUserId = new Map<
      UserId,
      BundleUserServiceGroup
    >();
    rows.forEach(({ platform_identifier, group_name, ...rowUser }) => {
      if (!platform_identifier) {
        return;
      }
      const entry: BundleUserServiceGroup = bundleUserServiceGroupsByUserId.get(
        rowUser.id
      ) ?? {
        user: rowUser,
        groups: [],
      };
      entry.groups.push({
        platformIdentifier: platform_identifier,
        name: group_name,
      });
      bundleUserServiceGroupsByUserId.set(rowUser.id, entry);
    });

    return Array.from(bundleUserServiceGroupsByUserId.values());
  },

  updateGroups: async (
    groups: UpdateGroupsPayload
  ): Promise<ServiceGroupResponse[]> => {
    const user = requestContext.requireUser();
    const groupIds = groups.map(({ id }) => id);

    const serviceInstanceIds =
      await ServiceGroupDomain.loadGroupsServiceInstanceIds(groupIds);
    const [firstServiceInstanceId] = serviceInstanceIds;
    if (!firstServiceInstanceId || serviceInstanceIds.length !== 1) {
      throw new Error(ErrorCode.ServiceGroupsLinkedToMultipleServiceInstances);
    }

    const oldUsers = await ServiceGroupDomain.loadServiceInstanceGroupUsers(
      firstServiceInstanceId
    );

    const serviceGroupsOrganization =
      await OrganizationDomain.loadOrganizationSubscribedToServiceInstance(
        firstServiceInstanceId
      );
    if (!serviceGroupsOrganization) {
      throw new Error(ErrorCode.SubscriptionNotFound);
    }
    if (
      !AuthHelper.userHasBypassCapability(user) &&
      serviceGroupsOrganization.id !== user.selected_organization_id
    ) {
      throw new Error(ErrorCode.OrganizationDoesNotMatchSelectedOrganization);
    }

    const oldUserIds = new Set(oldUsers.map((u) => u.user_id));
    const addedUserIds = [
      ...new Set(groups.flatMap(({ userIds }) => userIds)),
    ].filter((id) => !oldUserIds.has(id));

    await withTransaction(async () => {
      await ServiceGroupDomain.removeUsersFromGroups(groupIds);

      const addUserToGroupPromises = groups.map(async (group) => {
        await ServiceGroupDomain.addUsersToGroup(group.id, group.userIds);
      });

      await Promise.all(addUserToGroupPromises);

      await updateAuth0Groups(oldUsers, groups, firstServiceInstanceId);
    });

    if (addedUserIds.length > 0) {
      try {
        const deploymentRequest =
          await DeploymentRequestDomain.loadDeploymentRequestBy({
            service_instance_id: serviceInstanceIds[0],
          });
        if (deploymentRequest?.platform_id) {
          const platformConfiguration =
            await PlatformConfigurationDomain.loadConfigurationByPlatform(
              deploymentRequest.platform_id
            );
          if (
            platformConfiguration &&
            deploymentRequest.type === DeploymentRequestDeploymentType.Trial &&
            deploymentRequest.platform_identifier &&
            deploymentRequest.end_date
          ) {
            const platformIdentifier = deploymentRequest.platform_identifier;
            const addedUsers = await UserDomain.loadUsers(addedUserIds);
            const trialEndDate = deploymentRequest.end_date.toLocaleDateString(
              'en-US',
              {
                year: 'numeric',
                month: 'long',
                day: '2-digit',
              }
            );
            await Promise.all(
              addedUsers.map((addedUser) =>
                sendMail({
                  to: addedUser.email,
                  template: 'free_trial_user_added',
                  params: {
                    firstName: formatName(addedUser.first_name),
                    platformUrl: platformConfiguration.platform_url,
                    platformIdentifier: platformIdentifier,
                    adminEmail: user.email,
                    trialEndDate: trialEndDate,
                  },
                })
              )
            );
          }
        }
      } catch (error) {
        logApp.error('Unable to send free_trial_user_added mail', { error });
      }
    }

    const serviceGroups = await ServiceGroupDomain.loadServiceGroups({
      service_instance_id: serviceInstanceIds[0],
    });
    return serviceGroups.map(toServiceGroupResponse);
  },
  removeExpiredGroups: async (): Promise<void> => {
    const rows = await ServiceGroupDomain.loadGroupsForExpiredTrials();

    const byServiceInstance = rows.reduce<
      Map<
        ServiceInstanceId,
        { deploymentRequestId: string; groupIds: ServiceGroupId[] }
      >
    >((acc, row) => {
      const entry = acc.get(row.serviceInstanceId) ?? {
        deploymentRequestId: row.deploymentRequestId,
        groupIds: [],
      };
      entry.groupIds.push(row.groupId);
      acc.set(row.serviceInstanceId, entry);
      return acc;
    }, new Map());

    for (const [
      serviceInstanceId,
      { deploymentRequestId, groupIds },
    ] of byServiceInstance) {
      logApp.info('Removing users from expired trial groups', {
        deploymentRequestId,
        groupCount: groupIds.length,
      });
      try {
        const oldUsers =
          await ServiceGroupDomain.loadServiceInstanceGroupUsers(
            serviceInstanceId
          );
        await updateAuth0Groups(oldUsers, [], serviceInstanceId);
        await ServiceGroupDomain.deleteGroups(groupIds);
      } catch (error) {
        logApp.error('Failed to clean up expired trial groups', {
          deploymentRequestId,
          error,
        });
      }
    }
  },
};

const updateAuth0Groups = async (
  oldUsers: ServiceGroupUser[],
  newUsers: UpdateGroupsPayload,
  serviceInstanceId: ServiceInstanceId
) => {
  const updatedUsers = ServiceGroupHelper.buildUserGroupsDiff(
    oldUsers,
    newUsers
  );

  const users = await UserDomain.loadUsers(
    updatedUsers.map(({ user_id }) => user_id)
  );
  const userEmailMap: Map<UserId, string> = users.reduce(
    (acc, current) => {
      acc.set(current.id, current.email);
      return acc;
    },

    new Map<UserId, string>()
  );

  const serviceGroups = await ServiceGroupDomain.loadServiceGroups({
    service_instance_id: serviceInstanceId,
  });

  const groupNameIndexedByGroupId = serviceGroups.reduce((acc, current) => {
    acc.set(current.id, current.name);
    return acc;
  }, new Map<ServiceGroupId, string>());

  const deploymentRequest =
    await DeploymentRequestDomain.loadDeploymentRequestBy({
      service_instance_id: serviceInstanceId,
    });

  if (!deploymentRequest) {
    throw new Error(ErrorCode.DeploymentRequestNotFound);
  }
  const { platform_id } = deploymentRequest;
  if (!platform_id) {
    throw new Error(ErrorCode.InvalidPlatformId);
  }

  await Promise.all(
    updatedUsers.map(async (updatedUser) => {
      const email = userEmailMap.get(updatedUser.user_id);
      if (!email) {
        return;
      }

      await auth0Client.updateUserRBACInstance(email, {
        [platform_id]: {
          groups: updatedUser.group_ids.flatMap(
            (group_id) => groupNameIndexedByGroupId.get(group_id) ?? []
          ),
        },
      });
    })
  );
};
