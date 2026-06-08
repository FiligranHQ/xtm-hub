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
import { checkUserServiceIsInServiceInstance } from '../security-management/capability/auth.helper';
import { insertCapabilities } from '../security-management/user-service-capability/user-service-capability.helper';
import { SubscriptionDomain } from '../subscription/subscription.domain';
import { UserServiceDomain } from './user-service.domain';

export const UserServiceApp = {
  addUserService: async (
    user: User,
    subscriptionId: SubscriptionId,
    emails: string[],
    capabilities: string[],
    serviceInstanceId: ServiceInstanceId
  ): Promise<UserService[]> => {
    if (emails.some((email) => email === user.email)) {
      throw new Error(ErrorCode.CantSubscribeYourself);
    }
    const [subscription] =
      await SubscriptionDomain.loadSubscriptionWithOrganizationAndCapabilitiesBy(
        {
          'Subscription.id': subscriptionId,
        } as SubscriptionMutator
      );
    if (!subscription) {
      throw new Error(ErrorCode.SubscriptionNotFound);
    }

    if (subscription.service_instance_id !== serviceInstanceId) {
      throw new Error(ForbiddenErrorCode.ServiceNotManageable);
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
    const [firstUserServiceId] = userServiceIds;
    if (!firstUserServiceId) {
      return [];
    }
    const userServiceIsInService = await checkUserServiceIsInServiceInstance(
      firstUserServiceId,
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
    serviceInstanceId: ServiceInstanceId
  ): Promise<UserService> => {
    const userService =
      await UserServiceDomain.loadUserServiceById(userServiceId);

    if (userService.subscription.service_instance_id !== serviceInstanceId) {
      throw new Error(ForbiddenErrorCode.ServiceNotManageable);
    }
    await withTransaction(async () => {
      await UserServiceDomain.deleteUserCapabilityById(userService.id);
      await insertCapabilities(capabilities, [userService]);
    });
    return UserServiceDomain.loadUserServiceById(userServiceId);
  },
};
