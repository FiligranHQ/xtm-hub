import { Resolvers } from '../../../__generated__/resolvers-types';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { UserServiceId } from '../../../model/kanel/public/UserService';
import { UnknownErrorCode } from '../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { extractId } from '../../../utils/utils';
import { serviceCapabilityApp } from './service-capability.app';

const resolvers: Resolvers = {
  Mutation: {
    editServiceCapability: async (_, { input, serviceInstanceId }) => {
      try {
        const user_service_id = extractId<UserServiceId>(input.user_service_id);

        return serviceCapabilityApp.editServiceCapability(
          user_service_id,
          input.capabilities,
          extractId<ServiceInstanceId>(serviceInstanceId)
        );
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.EditCapabilitiesError);
      }
    },
  },
};
export default resolvers;
