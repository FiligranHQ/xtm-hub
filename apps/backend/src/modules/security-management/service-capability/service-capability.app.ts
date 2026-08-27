import { UserServiceCapability } from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { SubscriptionId } from '../../../model/kanel/public/Subscription';
import UserServiceCapabilityModel from '../../../model/kanel/public/UserServiceCapability';
import { SubscriptionDomain } from '../../subscription/subscription.domain';
import { ServiceCapabilityDomain } from './service-capability.domain';

type UserServiceCapabilitiesResponse = {
  userServiceCapabilities: UserServiceCapability[];
  subscription_id: SubscriptionId | null;
};

export const ServiceCapabilityApp = {
  loadServiceCapabilitiesByServiceId: async (
    serviceInstanceId: ServiceInstanceId
  ): Promise<UserServiceCapabilitiesResponse> => {
    const user = requestContext.requireUser();
    const subscriptionPromise = user.selected_organization_id
      ? await SubscriptionDomain.loadSubscriptionBy({
          service_instance_id: serviceInstanceId,
          organization_id: user.selected_organization_id,
        })
      : Promise.resolve(undefined);

    const [serviceCapabilities, subscription] = await Promise.all([
      ServiceCapabilityDomain.loadServiceCapabilitiesByServiceId(
        serviceInstanceId,
        user.id
      ),
      subscriptionPromise,
    ]);

    const userServiceCapabilities = serviceCapabilities.filter(
      (
        serviceCapability
      ): serviceCapability is UserServiceCapabilityModel & {
        user_service_id: string;
      } => serviceCapability.user_service_id !== null
    );

    return {
      userServiceCapabilities,
      subscription_id: subscription?.id ?? null,
    };
  },
};
