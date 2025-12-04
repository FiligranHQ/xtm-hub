import { fromGlobalId } from 'graphql-relay/node/node.js';
import { db } from '../../../../knexfile';
import {
  Resolvers,
  UserServiceCapability,
} from '../../../__generated__/resolvers-types';
import { withTransaction } from '../../../context/database.context';
import { UserServiceId } from '../../../model/kanel/public/UserService';
import { UnknownErrorCode } from '../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { fillSubscriptionWithOrgaServiceAndUserService } from '../../subcription/subscription.domain';
import { insertCapabilities } from '../user-service-capability/user-service-capability.helper';
import { loadUserServiceById } from '../user_service.domain';
import { willManageAccessBeConserved } from './service_capability.helper';

const resolvers: Resolvers = {
  Mutation: {
    editServiceCapability: async (_, { input }) => {
      try {
        await willManageAccessBeConserved(
          fromGlobalId(input.user_service_id).id as UserServiceId,
          input.capabilities
        );
        const user_service_id = fromGlobalId(input.user_service_id).id;

        const userService = await withTransaction(async () => {
          await db<UserServiceCapability>('UserService_Capability')
            .where('user_service_id', '=', user_service_id)
            .delete('*');
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
