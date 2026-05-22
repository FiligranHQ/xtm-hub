import {
  SubscriptionId,
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import User from '../../model/kanel/public/User';
import UserService, {
  UserServiceId,
} from '../../model/kanel/public/UserService';
import { ErrorCode } from '../../utils/error/error.code';
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

  deleteUserServices: async (userServiceIds: UserServiceId[]) => {
    return UserServiceDomain.deleteUserServices(userServiceIds);
  },
  editUserService: async (
    userServiceId: UserServiceId,
    capabilities: string[]
  ): Promise<UserService> => {
    const userService =
      await UserServiceDomain.loadUserServiceById(userServiceId);
    await UserServiceDomain.deleteUserCapabilityById(userService.id);
    await insertCapabilities(capabilities, [userService]);
    return UserServiceDomain.loadUserServiceById(userServiceId);
  },
};
