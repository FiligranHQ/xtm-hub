import { fromGlobalId } from 'graphql-relay/node/node.js';
import { db, dbTx } from '../../../../knexfile';
import {
  Resolvers,
  UserServiceCapability,
} from '../../../__generated__/resolvers-types';
import { UnknownError } from '../../../utils/error.util';
import { fillSubscriptionWithOrgaServiceAndUserService } from '../../subcription/subscription.domain';
import { insertCapabilities } from '../user-service-capability/user-service-capability.helper';
import { loadUserServiceById } from '../user_service.domain';

const resolvers: Resolvers = {
  Mutation: {
    editServiceCapability: async (_, { input }, context) => {
      const trx = await dbTx();
      try {
        const user_service_id = fromGlobalId(input.user_service_id).id;
        await db<UserServiceCapability>(context, 'UserService_Capability')
          .where('user_service_id', '=', user_service_id)
          .delete('*')
          .transacting(trx);
        const userService = await loadUserServiceById(context, user_service_id);

        await insertCapabilities(context, trx, input.capabilities, userService);
        await trx.commit();
        return fillSubscriptionWithOrgaServiceAndUserService(
          context,
          userService.subscription_id
        );
      } catch (error) {
        await trx.rollback();
        throw UnknownError('EDIT_CAPABILITIES_ERROR', { detail: error });
      }
    },
  },
};
export default resolvers;
