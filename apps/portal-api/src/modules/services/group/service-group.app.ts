import { Success } from '../../../__generated__/resolvers-types';
import { withTransaction } from '../../../context/database.context';
import { requestContext } from '../../../context/request.context';
import ServiceGroup, {
  ServiceGroupId,
} from '../../../model/kanel/public/ServiceGroup';
import ServiceGroupUser from '../../../model/kanel/public/ServiceGroupUser';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import User, { UserId } from '../../../model/kanel/public/User';
import { userHasBypassCapability } from '../../../security/auth.helper';
import { auth0Client } from '../../../thirdparty/auth0/client';
import { ErrorCode } from '../../../utils/error/error.code';
import { organizationDomain } from '../../organizations/organizations.domain';
import { UsersDomain } from '../../users/users.domain';
import { DeploymentRequestDomain } from '../deployments/deployments.domain';
import { ServiceGroupDomain } from './service-group.domain';
import { ServiceGroupHelper } from './service-group.helper';

export type UpdateGroupsPayload = { id: ServiceGroupId; userIds: UserId[] }[];

export const ServiceGroupApp = {
  loadGroups: async ({
    serviceInstanceId,
  }: {
    serviceInstanceId: ServiceInstanceId;
  }): Promise<ServiceGroup[]> => {
    return ServiceGroupDomain.loadServiceGroups({
      service_instance_id: serviceInstanceId,
    });
  },

  loadGroupUsers: async (groupId: ServiceGroupId): Promise<User[]> => {
    return ServiceGroupDomain.loadGroupUsers(groupId);
  },

  updateGroups: async (groups: UpdateGroupsPayload): Promise<Success> => {
    const { user } = requestContext.require();
    const groupIds = groups.map(({ id }) => id);

    const serviceInstanceIds =
      await ServiceGroupDomain.loadGroupsServiceInstanceIds(groupIds);
    if (serviceInstanceIds.length !== 1) {
      throw new Error(ErrorCode.ServiceGroupsLinkedToMultipleServiceInstances);
    }

    const oldUsers = await ServiceGroupDomain.loadServiceInstanceGroupUsers(
      serviceInstanceIds[0]
    );

    const serviceGroupsOrganization =
      await organizationDomain.loadOrganizationSubscribedToServiceInstance(
        serviceInstanceIds[0]
      );
    if (
      !userHasBypassCapability(user) &&
      serviceGroupsOrganization.id !== user.selected_organization_id
    ) {
      throw new Error(ErrorCode.OrganizationDoesNotMatchSelectedOrganization);
    }

    await withTransaction(async () => {
      await ServiceGroupDomain.removeUsersFromGroups(groupIds);

      const addUserToGroupPromises = groups.map(async (group) => {
        await ServiceGroupDomain.addUsersToGroup(group.id, group.userIds);
      });

      await Promise.all(addUserToGroupPromises);

      await updateAuth0Groups(oldUsers, groups, serviceInstanceIds[0]);
    });

    return {
      success: true,
    };
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

  const users = await UsersDomain.loadUsers(
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

  await Promise.all(
    updatedUsers.map(async (updatedUser) => {
      const email = userEmailMap.get(updatedUser.user_id);
      if (!email) {
        return;
      }

      await auth0Client.updateUserRBACInstance(email, {
        [deploymentRequest.platform_id]: {
          groups: updatedUser.group_ids.map((group_id) =>
            groupNameIndexedByGroupId.get(group_id)
          ),
        },
      });
    })
  );
};
