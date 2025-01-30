import { fromGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { db, dbTx } from '../../../../knexfile';
import { Resolvers } from '../../../__generated__/resolvers-types';
import GenericServiceCapability, {
  GenericServiceCapabilityId,
} from '../../../model/kanel/public/GenericServiceCapability';
import { UserServiceId } from '../../../model/kanel/public/UserService';
import { UnknownError } from '../../../utils/error.util';
import { fillSubscriptionWithOrgaServiceAndUserService } from '../../subcription/subscription.domain';
import { loadUserServiceById } from '../user_service.domain';

const resolvers: Resolvers = {
  Mutation: {
    editServiceCapability: async (_, { input }, context) => {
      const trx = await dbTx();
      try {
        const user_service_id = fromGlobalId(input.user_service_id).id;
        await db<GenericServiceCapability>(
          context,
          'Generic_Service_Capability'
        )
          .where('user_service_id', '=', user_service_id)
          .delete('*')
          .transacting(trx);

        for (const capability of input.capabilities) {
          const service_capability = {
            id: uuidv4() as GenericServiceCapabilityId,
            user_service_id: user_service_id as UserServiceId,
            service_capability_name: capability,
          };
          await db<GenericServiceCapability>(
            context,
            'Generic_Service_Capability'
          ).insert(service_capability);
        }

        const userService = await loadUserServiceById(context, user_service_id);
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
