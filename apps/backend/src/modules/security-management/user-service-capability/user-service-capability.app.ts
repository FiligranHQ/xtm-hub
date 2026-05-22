import UserService, {
  UserServiceId,
} from '../../../model/kanel/public/UserService';
import { UserServiceDomain } from '../../user-service/user-service.domain';
import { insertCapabilities } from './user-service-capability.helper';

export const userServiceCapabilityApp = {
  addCapabilitiesToUserServices: async (
    userServiceIds: UserServiceId[],
    capabilities: string[]
  ): Promise<UserService[]> => {
    const userServices =
      await UserServiceDomain.loadUserServicesBy(userServiceIds);

    if (!userServices.length || !capabilities.length) {
      return userServices;
    }

    await insertCapabilities(capabilities, userServices);

    return UserServiceDomain.loadUserServicesBy(userServiceIds);
  },
};
