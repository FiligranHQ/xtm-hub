import { Resolvers } from '../../../__generated__/resolvers-types';
import { UnknownErrorCode } from '../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { userServiceCapabilityApp } from './user-service-capability.app';

const resolvers: Resolvers = {
  Mutation: {
    addCapabilitiesToUserServices: async (
      _,
      { input, service_instance_id }
    ) => {
      try {
        return userServiceCapabilityApp.addCapabilitiesToUserServices(
          input.userServiceIds,
          input.capabilities,
          service_instance_id
        );
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.AddCapabilitiesError);
      }
    },
  },
};

export default resolvers;
