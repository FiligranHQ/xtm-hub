import {
  AddUsersToBundleGroupsInput,
  BundleUserServiceGroup,
  DeploymentRequestDeploymentType,
  PlatformIdentifier,
  ServiceGroupName,
  ServiceGroup as ServiceGroupResponse,
  UpdateBundleUserGroupsInput,
} from '../../../__generated__/resolvers-types';
import { withTransaction } from '../../../context/database.context';
import { requestContext } from '../../../context/request.context';
import DeploymentRequest from '../../../model/kanel/public/DeploymentRequest';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import ServiceGroupModel, {
  ServiceGroupId,
} from '../../../model/kanel/public/ServiceGroup';
import ServiceGroupUser from '../../../model/kanel/public/ServiceGroupUser';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import User, { UserId } from '../../../model/kanel/public/User';
import { sendMail } from '../../../server/mail-service';
import {
  Auth0UpdateUserRBACInstance,
  auth0Client,
} from '../../../thirdparty/auth0/client';
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

const assertOrganizationAccess = async (
  serviceInstanceId: ServiceInstanceId
): Promise<OrganizationId> => {
  const user = requestContext.requireUser();

  const organization =
    await OrganizationDomain.loadOrganizationSubscribedToServiceInstance(
      serviceInstanceId
    );
  if (!organization) {
    throw new Error(ErrorCode.SubscriptionNotFound);
  }
  if (
    !AuthHelper.userHasBypassCapability(user) &&
    organization.id !== user.selected_organization_id
  ) {
    throw new Error(ErrorCode.OrganizationDoesNotMatchSelectedOrganization);
  }

  return organization.id;
};

const assertBundleAccessAndLoad = async (
  serviceInstanceId: ServiceInstanceId
): Promise<{
  bundleDeploymentRequest: DeploymentRequest;
  bundleOrganizationId: OrganizationId;
}> => {
  const bundleDeploymentRequest =
    await DeploymentRequestDomain.loadDeploymentRequestBy({
      service_instance_id: serviceInstanceId,
    });
  if (!bundleDeploymentRequest) {
    throw new Error(ErrorCode.DeploymentRequestNotFound);
  }

  const bundleOrganizationId =
    await assertOrganizationAccess(serviceInstanceId);

  return { bundleDeploymentRequest, bundleOrganizationId };
};

const loadBundleChildren = async (
  serviceInstanceId: ServiceInstanceId
): Promise<{
  bundleDeploymentRequest: DeploymentRequest;
  bundleOrganizationId: OrganizationId;
  children: DeploymentRequest[];
}> => {
  const { bundleDeploymentRequest, bundleOrganizationId } =
    await assertBundleAccessAndLoad(serviceInstanceId);

  const children = await DeploymentRequestDomain.loadDeploymentRequestsBy({
    parent_id: bundleDeploymentRequest.id,
  });

  return { bundleDeploymentRequest, bundleOrganizationId, children };
};

const loadEmailByUserId = async (
  userIds: UserId[]
): Promise<{ users: User[]; emailByUserId: Map<UserId, string> }> => {
  const users = await UserDomain.loadUsers(userIds);
  return {
    users,
    emailByUserId: new Map(users.map(({ id, email }) => [id, email])),
  };
};

const syncAuth0GroupsForChildren = async (
  childGroupAssignments: {
    child: DeploymentRequest;
    groupNames: ServiceGroupName[];
  }[],
  userIds: UserId[],
  emailByUserId: Map<UserId, string>
): Promise<void> => {
  const rbacInstance: Auth0UpdateUserRBACInstance = {};
  childGroupAssignments.forEach(({ child, groupNames }) => {
    if (!child.platform_id) {
      return;
    }
    rbacInstance[child.platform_id] = { groups: groupNames };
  });

  if (Object.keys(rbacInstance).length === 0) {
    return;
  }

  await Promise.all(
    userIds.map((userId) => {
      const email = emailByUserId.get(userId);
      if (!email) {
        return undefined;
      }
      return auth0Client.updateUserRBACInstance(email, rbacInstance);
    })
  );
};

const matchRolesToChildren = <T extends ServiceGroupName | null>(
  children: DeploymentRequest[],
  roles: { product: PlatformIdentifier; role?: T | null }[]
): { child: DeploymentRequest; role: T | null }[] =>
  roles.flatMap((roleAssignment) => {
    const child = children.find(
      (deploymentRequest) =>
        deploymentRequest.platform_identifier === roleAssignment.product
    );
    return child ? [{ child, role: roleAssignment.role ?? null }] : [];
  });

// Sends the trial welcome email, only if the platform is an active trial with an end date.
const sendFreeTrialWelcomeEmails = async ({
  platformId,
  platformIdentifier,
  deploymentType,
  endDate,
  newlyAddedUsers,
  adminEmail,
}: {
  platformId: string | null;
  platformIdentifier: PlatformIdentifier | null;
  deploymentType: DeploymentRequestDeploymentType;
  endDate: Date | null;
  newlyAddedUsers: User[];
  adminEmail: string;
}): Promise<void> => {
  if (!platformId || !platformIdentifier || newlyAddedUsers.length === 0) {
    return;
  }

  try {
    const platformConfiguration =
      await PlatformConfigurationDomain.loadConfigurationByPlatform(platformId);
    if (
      !platformConfiguration ||
      deploymentType !== DeploymentRequestDeploymentType.Trial ||
      !endDate
    ) {
      return;
    }

    const trialEndDate = endDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    });
    await Promise.all(
      newlyAddedUsers.map((addedUser) =>
        sendMail({
          to: addedUser.email,
          template: 'free_trial_user_added',
          params: {
            firstName: formatName(addedUser.first_name),
            platformUrl: platformConfiguration.platform_url,
            platformIdentifier,
            adminEmail,
            trialEndDate,
          },
        })
      )
    );
  } catch (error) {
    logApp.error('Unable to send free_trial_user_added mail', { error });
  }
};

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
    const { bundleDeploymentRequest } =
      await assertBundleAccessAndLoad(serviceInstanceId);

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

  loadBundleProducts: async (
    serviceInstanceId: ServiceInstanceId
  ): Promise<PlatformIdentifier[]> => {
    const { children } = await loadBundleChildren(serviceInstanceId);

    return children.flatMap((child) =>
      child.platform_identifier ? [child.platform_identifier] : []
    );
  },

  addUsersToBundleGroups: async (
    serviceInstanceId: ServiceInstanceId,
    input: AddUsersToBundleGroupsInput
  ): Promise<BundleUserServiceGroup[]> => {
    const user = requestContext.requireUser();

    if (
      !input.roles.some((role) => role.product === PlatformIdentifier.Xtmone)
    ) {
      throw new Error(ErrorCode.XtmOneRoleRequired);
    }

    const { children } = await loadBundleChildren(serviceInstanceId);

    const platformRoleAssignments = matchRolesToChildren(children, input.roles);

    await withTransaction(async () => {
      for (const { child, role } of platformRoleAssignments) {
        const groups = await ServiceGroupDomain.loadServiceGroups({
          service_instance_id: child.service_instance_id,
        });
        const targetGroup = groups.find((group) => group.name === role);
        if (!targetGroup) {
          throw new Error(ErrorCode.ServiceGroupNotFound);
        }

        await ServiceGroupDomain.addUsersToGroup(targetGroup.id, input.userIds);
      }
    });

    const { users, emailByUserId } = await loadEmailByUserId(input.userIds);

    const grantedAssignments = platformRoleAssignments.filter(
      ({ child, role }) => child.platform_identifier && role
    );

    await syncAuth0GroupsForChildren(
      grantedAssignments.map(({ child, role }) => ({
        child,
        groupNames: role ? [role] : [],
      })),
      input.userIds,
      emailByUserId
    );

    await Promise.all(
      grantedAssignments.map(async ({ child }) => {
        await sendFreeTrialWelcomeEmails({
          platformId: child.platform_id,
          platformIdentifier: child.platform_identifier,
          deploymentType: child.type,
          endDate: child.end_date,
          newlyAddedUsers: users,
          adminEmail: user.email,
        });
      })
    );

    return ServiceGroupApp.loadBundleUserServiceGroups(serviceInstanceId);
  },

  removeUsersFromBundleGroups: async (
    serviceInstanceId: ServiceInstanceId,
    userIds: UserId[]
  ): Promise<UserId[]> => {
    const { children } = await loadBundleChildren(serviceInstanceId);

    const groups =
      await ServiceGroupDomain.loadServiceGroupsByServiceInstanceIds(
        children.map((child) => child.service_instance_id)
      );
    const allGroupIds = groups.map((group) => group.id);

    await ServiceGroupDomain.removeUsersFromServiceGroups(userIds, allGroupIds);

    const { emailByUserId } = await loadEmailByUserId(userIds);

    await syncAuth0GroupsForChildren(
      children.map((child) => ({ child, groupNames: [] })),
      userIds,
      emailByUserId
    );

    return userIds;
  },

  updateBundleUserGroups: async (
    serviceInstanceId: ServiceInstanceId,
    input: UpdateBundleUserGroupsInput
  ): Promise<BundleUserServiceGroup[]> => {
    const xtmOneRoleAssignment = input.roles.find(
      (role) => role.product === PlatformIdentifier.Xtmone
    );
    if (xtmOneRoleAssignment && !xtmOneRoleAssignment.role) {
      throw new Error(ErrorCode.XtmOneRoleRequired);
    }

    const { children } = await loadBundleChildren(serviceInstanceId);

    const platformRoleAssignments = matchRolesToChildren(children, input.roles);

    await withTransaction(async () => {
      for (const { child, role } of platformRoleAssignments) {
        const groups = await ServiceGroupDomain.loadServiceGroups({
          service_instance_id: child.service_instance_id,
        });

        await ServiceGroupDomain.removeUsersFromServiceGroups(
          input.userIds,
          groups.map((group) => group.id)
        );

        if (!role) {
          continue;
        }

        const targetGroup = groups.find((group) => group.name === role);
        if (!targetGroup) {
          throw new Error(ErrorCode.ServiceGroupNotFound);
        }

        await ServiceGroupDomain.addUsersToGroup(targetGroup.id, input.userIds);
      }
    });

    const { emailByUserId } = await loadEmailByUserId(input.userIds);

    await syncAuth0GroupsForChildren(
      platformRoleAssignments.map(({ child, role }) => ({
        child,
        groupNames: role ? [role] : [],
      })),
      input.userIds,
      emailByUserId
    );

    return ServiceGroupApp.loadBundleUserServiceGroups(serviceInstanceId);
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

    await assertOrganizationAccess(firstServiceInstanceId);

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
      const deploymentRequest =
        await DeploymentRequestDomain.loadDeploymentRequestBy({
          service_instance_id: serviceInstanceIds[0],
        });
      if (deploymentRequest) {
        const addedUsers = await UserDomain.loadUsers(addedUserIds);
        await sendFreeTrialWelcomeEmails({
          platformId: deploymentRequest.platform_id,
          platformIdentifier: deploymentRequest.platform_identifier,
          deploymentType: deploymentRequest.type,
          endDate: deploymentRequest.end_date,
          newlyAddedUsers: addedUsers,
          adminEmail: user.email,
        });
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
