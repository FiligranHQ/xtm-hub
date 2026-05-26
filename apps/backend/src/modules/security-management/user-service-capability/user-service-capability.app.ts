import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import UserService, {
  UserServiceId,
} from '../../../model/kanel/public/UserService';
import { ForbiddenErrorCode } from '../../../utils/error/error.code';
import { UserServiceDomain } from '../../user-service/user-service.domain';
import { insertCapabilities } from './user-service-capability.helper';

export const userServiceCapabilityApp = {
  addCapabilitiesToUserServices: async (
    userServiceIds: UserServiceId[],
    capabilities: string[],
    serviceInstanceId: ServiceInstanceId
  ): Promise<UserService[]> => {
    const userServices =
      await UserServiceDomain.loadUserServicesBy(userServiceIds);

    const isUserServiceInCorrectService =
      await UserServiceDomain.checkUserServiceIsInServiceInstance(
        userServices[0].id,
        serviceInstanceId
      );

    if (!isUserServiceInCorrectService) {
      throw new Error(ForbiddenErrorCode.ServiceNotManageable);
    }
    if (!userServices.length || !capabilities.length) {
      return userServices;
    }

    await insertCapabilities(capabilities, userServices);

    return UserServiceDomain.loadUserServicesBy(userServiceIds);
  },
};
