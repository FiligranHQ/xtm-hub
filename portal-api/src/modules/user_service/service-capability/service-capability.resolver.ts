import {
  Resolvers,
  ServiceCapability,
} from '../../../__generated__/resolvers-types';
import { db } from '../../../../knexfile';
import { ServiceCapabilityId } from '../../../model/kanel/public/ServiceCapability';
import { v4 as uuidv4 } from 'uuid';
import { fromGlobalId } from 'graphql-relay/node/node.js';
import { loadUserServiceById } from '../user_service.domain';

const resolvers: Resolvers = {
  Mutation: {
    editServiceCapability: async (_, { input }, context) => {
      const user_service_id = fromGlobalId(input.user_service_id).id;
      await db<ServiceCapability>(context, 'Service_Capability')
        .where('user_service_id', '=', user_service_id)
        .delete('*');

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

      const userService = loadUserServiceById(context, user_service_id);

      return userService;
    },
  },
};
export default resolvers;
