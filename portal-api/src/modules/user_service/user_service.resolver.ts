import {
  Resolvers,
  ServiceCapability,
  UserService,
} from '../../__generated__/resolvers-types';
import {
  loadUsersBySubscription,
  loadUserServiceById,
} from './user_service.domain';
import { v4 as uuidv4 } from 'uuid';
import { loadUserBy } from '../users/users.domain';
import { db } from '../../../knexfile';
import { fromGlobalId } from 'graphql-relay/node/node.js';
import { loadUnsecureUserServiceBy } from './user-service.helper';
import { UserId } from '../../model/kanel/public/User';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { GraphQLError } from 'graphql/error/index.js';

const resolvers: Resolvers = {
  Query: {
    serviceUsers: async (
      _,
      { id, first, after, orderMode, orderBy },
      context
    ) => {
      return loadUsersBySubscription(context, id, {
        first,
        after,
        orderMode,
        orderBy,
      });
    },
  },
  Mutation: {
    addUserService: async (_, { input }, context) => {
      const user = await loadUserBy('email', input.email);
      const user_service = {
        id: uuidv4(),
        subscription_id: fromGlobalId(input.subscriptionId).id,
        user_id: user.id,
      };

      if (!user_service.subscription_id) {
        throw new GraphQLError('Sorry the subscription does not exist', {
          extensions: { code: 'UNKNOWN SUBSCRIPTION' },
        });
      }

      const [existingUserService] = await loadUnsecureUserServiceBy({
        user_id: user_service.user_id as UserId,
        subscription_id: user_service.subscription_id as SubscriptionId,
      });

      if (existingUserService) {
        throw new GraphQLError('The User access to service is already exist', {
          extensions: { code: 'ALREADY_EXIST' },
        });
      }

      const [addedUserService] = await db<UserService>(context, 'User_Service')
        .insert(user_service)
        .returning('*');

      for (const capability of input.capabilities) {
        const service_capa = {
          id: uuidv4(),
          user_service_id: addedUserService.id,
          service_capability_name: capability,
        };

        await db<ServiceCapability>(context, 'Service_Capability')
          .insert(service_capa)
          .returning('*');
      }

      return await loadUserServiceById(context, addedUserService.id);
    },
    deleteUserService: async (_, { input }, context) => {
      const userToDelete = await loadUserBy('email', input.email);

      const [deletedUserService] = await db<UserService>(
        context,
        'User_Service'
      )
        .where('user_id', '=', userToDelete.id)
        .delete('*')
        .returning('*');

      return deletedUserService;
    },
  },
};

export default resolvers;
