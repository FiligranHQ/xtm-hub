import { OrganizationId } from '../../model/kanel/public/Organization';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import {
  SubscriptionId,
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import User from '../../model/kanel/public/User';
import UserService from '../../model/kanel/public/UserService';
import { ErrorCode } from '../../utils/error/error.code';
import { extractId } from '../../utils/utils';
import { subscriptionDomain } from '../subcription/subscription.domain';
import { loadSubscriptionWithOrganizationAndCapabilitiesBy } from '../subcription/subscription.helper';
import { loadUserBy } from '../users/users.domain';
import { loadUserServiceBy } from './user-service.helper';
import { UserServiceDomain } from './user_service.domain';

export const UserServiceApp = {
  addYourselfInUserService: async (
    organizationId: OrganizationId,
    serviceInstanceId: ServiceInstanceId,
    emails: string[],
    capabilities: string[]
  ): Promise<UserService[]> => {
    const [subscription] =
      await loadSubscriptionWithOrganizationAndCapabilitiesBy({
        'Subscription.organization_id': organizationId,
        'Subscription.service_instance_id': serviceInstanceId,
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
        'Subscription.id': extractId<SubscriptionId>(subscriptionId),
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
    const userToDelete = await loadUserBy({ email });
    const deletedUserService = await UserServiceDomain.deleteUserService(
      userToDelete.id,
      subscriptionId
    );
    if (!deletedUserService) {
      return;
    }
    // Find subscription and remove it if no other userServices
    const usersServices = await loadUserServiceBy({
      subscription_id: deletedUserService?.subscription_id,
    });

    if (usersServices.length === 0) {
      const [subscription] =
        await loadSubscriptionWithOrganizationAndCapabilitiesBy({
          'Subscription.id': deletedUserService?.subscription_id,
        } as SubscriptionMutator);
      await subscriptionDomain.deleteSubscription(subscription.id);
    }

    return deletedUserService;
  },
};
