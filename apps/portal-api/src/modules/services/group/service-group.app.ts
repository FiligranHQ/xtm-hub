import {
  OrganizationCapability,
  Success,
} from '../../../__generated__/resolvers-types';
import { withTransaction } from '../../../context/database.context';
import { requestContext } from '../../../context/request.context';
import ServiceGroup, {
  ServiceGroupId,
} from '../../../model/kanel/public/ServiceGroup';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import User, { UserId } from '../../../model/kanel/public/User';
import { securityGuard } from '../../../security/guard';
import { ServiceGroupDomain } from './service-group.domain';

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

  updateGroups: async (
    groups: { id: ServiceGroupId; userIds: UserId[] }[]
  ): Promise<Success> => {
    const groupIds = groups.map(({ id }) => id);

    await assertUserIsAllowedToUpdateGroups(groupIds);

    await withTransaction(async () => {
      await ServiceGroupDomain.removeUsersFromGroups(groupIds);

      const addUserToGroupPromises = groups.map(async (group) => {
        await ServiceGroupDomain.addUsersToGroup(group.id, group.userIds);
      });

      await Promise.all(addUserToGroupPromises);
    });

    return {
      success: true,
    };
  },
};

const assertUserIsAllowedToUpdateGroups = async (
  groupIds: ServiceGroupId[]
) => {
  const { user } = requestContext.require();
  const serviceInstanceIds =
    await ServiceGroupDomain.loadGroupsServiceInstanceIds(groupIds);

  const securityAssertionPromises = serviceInstanceIds.map(
    async (serviceInstanceId) =>
      await securityGuard.assertUserIsAllowedOnServiceInstance(user, {
        serviceInstanceId,
        requiredCapability: OrganizationCapability.ManagePlatformRegistration,
      })
  );

  await Promise.all(securityAssertionPromises);
};
