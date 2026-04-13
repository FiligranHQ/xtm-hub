import { withTransaction } from '../../../context/database.context';
import { requestContext } from '../../../context/request.context';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { UserServiceId } from '../../../model/kanel/public/UserService';
import { assertUserCanManageService } from '../../../security/guard';
import { fillSubscriptionWithOrgaServiceAndUserService } from '../../subscription/subscription.domain';
import { UserServiceDomain } from '../../user_service/user_service.domain';
import { insertCapabilities } from '../user-service-capability/user-service-capability.helper';
import { willManageAccessBeConserved } from './service_capability.helper';

export const serviceCapabilityApp = {
  editServiceCapability: async (
    user_service_id: UserServiceId,
    capabilities: string[],
    serviceInstanceId: ServiceInstanceId
  ) => {
    const { user } = requestContext.require();

    await assertUserCanManageService(
      user,
      serviceInstanceId as ServiceInstanceId
    );
    await willManageAccessBeConserved(user_service_id, capabilities);

    const userService = await withTransaction(async () => {
      await UserServiceDomain.deleteUserCapabilityById(user_service_id);

      const userService =
        await UserServiceDomain.loadUserServiceById(user_service_id);

      await insertCapabilities(capabilities, userService);
      return userService;
    });
    return fillSubscriptionWithOrgaServiceAndUserService(
      userService.subscription_id
    );
  },
};
