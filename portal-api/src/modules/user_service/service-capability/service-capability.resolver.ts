import { fromGlobalId } from 'graphql-relay/node/node.js';
import { db, dbTx } from '../../../../knexfile';
import {
  Resolvers,
  UserServiceCapability,
} from '../../../__generated__/resolvers-types';
import { UserServiceId } from '../../../model/kanel/public/UserService';
import {
  FORBIDDEN_ACCESS,
  ForbiddenAccess,
  UnknownError,
} from '../../../utils/error.util';
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
        if (error.name.includes(FORBIDDEN_ACCESS)) {
          throw ForbiddenAccess(
            'EDIT_CAPABILITIES_CANT_REMOVE_LAST_MANAGE_ACCESS'
          );
        }
        throw UnknownError('EDIT_CAPABILITIES_ERROR', { detail: error });
      }
    },
  },
};
export default resolvers;
