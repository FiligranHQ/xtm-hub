import { Resolvers } from '../../../__generated__/resolvers-types';
import { ServiceCapabilityId } from '../../../model/kanel/public/ServiceCapability';
import { UnknownErrorCode } from '../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { createRelayIdScalar } from '../../../utils/scalar.util';
import { serviceCapabilityApp } from './service-capability.app';

const resolvers: Resolvers = {
  ServiceCapabilityId:
    createRelayIdScalar<ServiceCapabilityId>('Service_Capability'),
  Mutation: {
    editServiceCapability: async (_, { input, serviceInstanceId }) => {
      try {
        return await serviceCapabilityApp.editServiceCapability(
          input.user_service_id,
          input.capabilities,
          serviceInstanceId
        );
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.EditCapabilitiesError);
      }
    },
  },
};
export default resolvers;
