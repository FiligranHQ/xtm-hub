import { Success } from '../../../__generated__/resolvers-types';
import { withTransaction } from '../../../context/database.context';
import { requestContext } from '../../../context/request.context';
import ServiceGroup, {
  ServiceGroupId,
} from '../../../model/kanel/public/ServiceGroup';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import User, { UserId } from '../../../model/kanel/public/User';
import { ErrorCode } from '../../../utils/error/error.code';
import { organizationDomain } from '../../organizations/organizations.domain';
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
    const { user } = requestContext.require();
    const groupIds = groups.map(({ id }) => id);

    const serviceInstanceIds =
      await ServiceGroupDomain.loadGroupsServiceInstanceIds(groupIds);
    if (serviceInstanceIds.length !== 1) {
      throw new Error(ErrorCode.ServiceGroupsLinkedToMultipleServiceInstances);
    }

    const serviceGroupsOrganization =
      await organizationDomain.loadOrganizationSubscribedToServiceInstance(
        serviceInstanceIds[0]
      );
    if (serviceGroupsOrganization.id !== user.selected_organization_id) {
      throw new Error(ErrorCode.OrganizationDoesNotMatchSelectedOrganization);
    }

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
