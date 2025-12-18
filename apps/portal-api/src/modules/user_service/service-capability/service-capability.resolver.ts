import { Resolvers } from '../../../__generated__/resolvers-types';
import { withTransaction } from '../../../context/database.context';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { UserServiceId } from '../../../model/kanel/public/UserService';
import { assertUserCanManageService } from '../../../security/guard';
import { UnknownErrorCode } from '../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { extractId } from '../../../utils/utils';
import { fillSubscriptionWithOrgaServiceAndUserService } from '../../subcription/subscription.domain';
import { insertCapabilities } from '../user-service-capability/user-service-capability.helper';
import {
  deleteUserCapabilityById,
  loadUserServiceById,
} from '../user_service.domain';
import { willManageAccessBeConserved } from './service_capability.helper';

const resolvers: Resolvers = {
  Mutation: {
    editServiceCapability: async (
      _,
      { input, serviceInstanceId },
      portalContext
    ) => {
      try {
        const user_service_id = extractId<UserServiceId>(input.user_service_id);

        await assertUserCanManageService(
          portalContext.user,
          serviceInstanceId as ServiceInstanceId
        );
        await willManageAccessBeConserved(user_service_id, input.capabilities);

        const userService = await withTransaction(async () => {
          await deleteUserCapabilityById(user_service_id);

          const userService = await loadUserServiceById(user_service_id);

          await insertCapabilities(input.capabilities, userService);
          return userService;
        });
        return fillSubscriptionWithOrgaServiceAndUserService(
          userService.subscription_id
        );
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.EditCapabilitiesError);
      }
    },
  },
};
export default resolvers;
