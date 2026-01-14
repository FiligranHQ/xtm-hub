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
import { loadSubscriptionWithOrganizationAndCapabilitiesBy } from '../subcription/subscription.helper';
import { UserServiceDomain } from './user_service.domain';

export const userServiceApp = {
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
};
