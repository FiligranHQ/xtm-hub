import { fromGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { db, dbTx } from '../../../../knexfile';
import {
  Resolvers,
  ServiceCapability,
} from '../../../__generated__/resolvers-types';
import { ServiceCapabilityId } from '../../../model/kanel/public/ServiceCapability';
import { UnknownError } from '../../../utils/error.util';
import { fillSubscriptionWithOrgaServiceAndUserService } from '../../subcription/subscription.domain';
import { loadUserServiceById } from '../user_service.domain';

const resolvers: Resolvers = {
  Mutation: {
    editServiceCapability: async (_, { input }, context) => {
      const trx = await dbTx();
      try {
        const user_service_id = fromGlobalId(input.user_service_id).id;
        await db<ServiceCapability>(context, 'Service_Capability')
          .where('user_service_id', '=', user_service_id)
          .delete('*')
          .transacting(trx);

        for (const capability of input.capabilities) {
          const service_capability = {
            id: uuidv4() as ServiceCapabilityId,
            user_service_id: user_service_id,
            service_capability_name: capability,
          };
          await db<ServiceCapability>(context, 'Service_Capability').insert(
            service_capability
          );
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
