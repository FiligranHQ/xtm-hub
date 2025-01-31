import { fromGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { db, dbTx } from '../../../../knexfile';
import {
  Resolvers,
  UserServiceCapability,
} from '../../../__generated__/resolvers-types';
import {
  Resolvers,
  UserServiceCapability,
} from '../../../__generated__/resolvers-types';
import { GenericServiceCapabilityId } from '../../../model/kanel/public/GenericServiceCapability';
import { UserServiceId } from '../../../model/kanel/public/UserService';
import { UserServiceCapabilityId } from '../../../model/kanel/public/UserServiceCapability';
import { UnknownError } from '../../../utils/error.util';
import { loadUnsecureServiceCapabilitiesBy } from '../../services/instances/service-capabilities/service_capabilities.helper';
import { fillSubscriptionWithOrgaServiceAndUserService } from '../../subcription/subscription.domain';
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

        for (const capabilityName of input.capabilities) {
          const [capability] = await loadUnsecureServiceCapabilitiesBy({
            name: capabilityName,
          });
          const user_service_capability = {
            id: uuidv4() as UserServiceCapabilityId,
            user_service_id: user_service_id as UserServiceId,
            generic_service_capability_id:
              capability.generic_service_capability_id,
          };
          await db<UserServiceCapability>(
            context,
            'UserService_Capability'
          ).insert(user_service_capability);
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
