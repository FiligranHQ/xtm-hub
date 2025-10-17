import { fromGlobalId } from 'graphql-relay/node/node.js';
import { db, dbTx } from '../../../../knexfile';
import {
  Resolvers,
  UserServiceCapability,
} from '../../../__generated__/resolvers-types';
import { UserServiceId } from '../../../model/kanel/public/UserService';
import { UnknownErrorCode } from '../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { fillSubscriptionWithOrgaServiceAndUserService } from '../../subcription/subscription.domain';
import { insertCapabilities } from '../user-service-capability/user-service-capability.helper';
import { loadUserServiceById } from '../user_service.domain';
import { willManageAccessBeConserved } from './service_capability.helper';

const resolvers: Resolvers = {
  Mutation: {
    editServiceCapability: async (_, { input }, context) => {
      const trx = await dbTx();
      try {
        await willManageAccessBeConserved(
          context,
          fromGlobalId(input.user_service_id).id as UserServiceId,
          input.capabilities
        );

        const user_service_id = fromGlobalId(input.user_service_id).id;
        await db<UserServiceCapability>(context, 'UserService_Capability', {
          methodType: 'del',
        })
          .where('user_service_id', '=', user_service_id)
          .delete('*')
          .transacting(trx);
        const userService = await loadUserServiceById(context, user_service_id);

        await insertCapabilities(context, trx, input.capabilities, userService);
        await trx.commit();
        return fillSubscriptionWithOrgaServiceAndUserService(
          userService.subscription_id
        );
      } catch (error) {
        await trx.rollback();
        throw mapToGraphQLError(error, UnknownErrorCode.EditCapabilitiesError);
      }
    },
  },
};
export default resolvers;
