import {
  SubscriptionId,
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import User from '../../model/kanel/public/User';
import UserService from '../../model/kanel/public/UserService';
import { ErrorCode } from '../../utils/error/error.code';
import { UserDomain } from '../organization-management/user/user-domain/user.domain';
import { SubscriptionDomain } from '../subscription/subscription.domain';
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

  deleteUserService: async (email: string, subscriptionId: SubscriptionId) => {
    const userToDelete = await UserDomain.loadUserBy({ email });
    const deletedUserService = await UserServiceDomain.deleteUserService(
      userToDelete.id,
      subscriptionId
    );
    if (!deletedUserService) {
      return;
    }
    // Find subscription and remove it if no other userServices
    const usersServices =
      await UserServiceDomain.loadUserServiceWithCapabilitiesBy({
        subscription_id: deletedUserService?.subscription_id,
      });

    if (usersServices.length === 0) {
      const [subscription] =
        await loadSubscriptionWithOrganizationAndCapabilitiesBy({
          'Subscription.id': deletedUserService?.subscription_id,
        } as SubscriptionMutator);
      await SubscriptionDomain.deleteSubscription([subscription.id]);
    }

    return deletedUserService;
  },
};
