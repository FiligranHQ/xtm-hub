import { withTransaction } from '../../context/database.context';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import {
  SubscriptionId,
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import User from '../../model/kanel/public/User';
import UserService, {
  UserServiceId,
} from '../../model/kanel/public/UserService';
import { ErrorCode, ForbiddenErrorCode } from '../../utils/error/error.code';
import { insertCapabilities } from '../security-management/user-service-capability/user-service-capability.helper';
import { loadSubscriptionWithOrganizationAndCapabilitiesBy } from '../subscription/subscription.helper';
import { UserServiceDomain } from './user-service.domain';

export const UserServiceApp = {
  addUserService: async (
    user: User,
    subscriptionId: SubscriptionId,
    emails: string[],
    capabilities: string[]
  ): Promise<UserService[]> => {
    if (emails.some((email) => email === user.email)) {
      throw new Error(ErrorCode.CantSubscribeYourself);
    }
    const [subscription] =
      await loadSubscriptionWithOrganizationAndCapabilitiesBy({
        'Subscription.id': subscriptionId,
      } as SubscriptionMutator);
    if (!subscription) {
      throw new Error(ErrorCode.SubscriptionNotFound);
    }

    return UserServiceDomain.addServiceToUsers(
      subscription,
      emails,
      capabilities
    );
  },

  deleteUserServices: async (
    userServiceIds: UserServiceId[],
    serviceInstanceId: ServiceInstanceId
  ) => {
    const userServiceIsInService =
      await UserServiceDomain.checkUserServiceIsInServiceInstance(
        userServiceIds[0],
        serviceInstanceId
      );
    if (!userServiceIsInService) {
      throw new Error(ForbiddenErrorCode.ServiceNotManageable);
    }
    return UserServiceDomain.deleteUserServices(userServiceIds);
  },
  editUserService: async (
    userServiceId: UserServiceId,
    capabilities: string[],
    subscriptionId: SubscriptionId
  ): Promise<UserService> => {
    const userService =
      await UserServiceDomain.loadUserServiceById(userServiceId);
    // Check the provided subscription_id correspond to the correct userService
    if (userService.subscription_id !== subscriptionId) {
      throw new Error(ForbiddenErrorCode.ServiceNotManageable);
    }
    await withTransaction(async () => {
      await UserServiceDomain.deleteUserCapabilityById(userService.id);
      await insertCapabilities(capabilities, [userService]);
    });
    return UserServiceDomain.loadUserServiceById(userServiceId);
  },
};
