import { Resolvers } from '../../../__generated__/resolvers-types';
import { UnknownErrorCode } from '../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { userServiceCapabilityApp } from './user-service-capability.app';

const resolvers: Resolvers = {
  Mutation: {
    AddCapabilitiesToUserServices: async (_, { input }) => {
      try {
        return userServiceCapabilityApp.addCapabilitiesToUserServices(
          input.userServiceIds,
          input.capabilities
        );
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.AddCapabilitiesError);
      }
    },
  },
};

export default resolvers;
