import ServiceGroup, {
  ServiceGroupId,
} from '../../../model/kanel/public/ServiceGroup';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import User from '../../../model/kanel/public/User';
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
};
