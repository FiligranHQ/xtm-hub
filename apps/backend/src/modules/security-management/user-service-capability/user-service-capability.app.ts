import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import UserService, {
  UserServiceId,
} from '../../../model/kanel/public/UserService';
import { ForbiddenErrorCode } from '../../../utils/error/error.code';
import { UserServiceDomain } from '../../user-service/user-service.domain';
import { checkUserServiceIsInServiceInstance } from '../capability/auth.helper';
import { insertCapabilities } from './user-service-capability.helper';

export const userServiceCapabilityApp = {
  addCapabilitiesToUserServices: async (
    userServiceIds: UserServiceId[],
    capabilities: string[],
    serviceInstanceId: ServiceInstanceId
  ): Promise<UserService[]> => {
    const userServices =
      await UserServiceDomain.loadUserServicesByIds(userServiceIds);

    const [firstUserService] = userServices;
    if (!firstUserService || !capabilities.length) {
      return userServices;
    }

    const isUserServiceInCorrectService =
      await checkUserServiceIsInServiceInstance(
        firstUserService.id,
        serviceInstanceId
      );

    if (!isUserServiceInCorrectService) {
      throw new Error(ForbiddenErrorCode.ServiceNotManageable);
    }

    await insertCapabilities(capabilities, userServices);

    return UserServiceDomain.loadUserServicesByIds(userServiceIds);
  },
};
