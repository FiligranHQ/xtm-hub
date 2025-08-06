import { ServiceInstance } from '../../__generated__/resolvers-types';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { PortalContext } from '../../model/portal-context';
import { loadSubscriptionBy } from '../subcription/subscription.domain';
import { GenericServiceCapabilityIds } from '../user_service/service-capability/generic_service_capability.const';
import { loadUserServiceBy } from '../user_service/user_service.domain';
import {
  grantServiceAccess,
  loadServiceInstanceBy,
} from './service-instance.domain';

export const serviceInstanceApp = {
  loadServiceInstance: async (
    context: PortalContext,
    serviceInstanceId: ServiceInstanceId
  ): Promise<ServiceInstance> => {
    const subscription = await loadSubscriptionBy(context, {
      service_instance_id: serviceInstanceId,
    });
    const userService = await loadUserServiceBy(context, {
      subscription_id: subscription.id,
      user_id: context.user.id,
    });
    if (userService.length === 0) {
      console.warn('USER_MUST_JOIN_SERVICE_BEFORE_ACCESSING_IT');
      if (subscription.joining === 'AUTO_JOIN') {
        await grantServiceAccess(
          context,
          [GenericServiceCapabilityIds.AccessId],
          [context.user.id],
          subscription.id
        );
      }
    }
    return loadServiceInstanceBy(context, 'id', serviceInstanceId);
  },
};
