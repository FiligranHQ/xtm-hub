import { Resolvers } from '../../__generated__/resolvers-types';
import {
  loadUserServiceById,
  loadUserServiceByUser,
} from './user_service.domain';
import { loadUserBy } from '../users/users.domain';
import { db } from '../../../knexfile';
import { fromGlobalId } from 'graphql-relay/node/node.js';
import {
  createUserAccessForOtherOrg,
  createUserServiceAccess,
  isUserServiceExist,
  loadUnsecureUserServiceBy,
} from './user-service.helper';
import { UserId } from '../../model/kanel/public/User';
import Subscription, {
  SubscriptionId,
} from '../../model/kanel/public/Subscription';
import { GraphQLError } from 'graphql/error/index.js';
import { getOrCreateUser } from '../users/users.helper';
import UserService from '../../model/kanel/public/UserService';
import { OrganizationId } from '../../model/kanel/public/Organization';
import {
  isOrgMatchingSub,
  loadSubscriptionBy,
} from '../subcription/subscription.helper';

const resolvers: Resolvers = {
  Query: {
    userServiceOwned: async (
      _,
      { first, after, orderMode, orderBy },
      context
    ) => {
      return loadUserServiceByUser(context, context.user.id, {
        first,
        after,
        orderMode,
        orderBy,
      });
    },
  },
  Mutation: {
    addUserService: async (_, { input }, context) => {
      const user = await getOrCreateUser(input.email);

      const subscription_id = fromGlobalId(input.subscriptionId)
        .id as SubscriptionId;

      if (!subscription_id) {
        throw new GraphQLError('Sorry the subscription does not exist', {
          extensions: { code: '[User_Service] UNKNOWN SUBSCRIPTION' },
        });
      }

      if (await isUserServiceExist(user.id as UserId, subscription_id)) {
        throw new GraphQLError(' The User access to service is already exist', {
          extensions: { code: '[User_Service] ALREADY_EXIST' },
        });
      }

      const isSameOrganization = await isOrgMatchingSub(
        user.organization_id as OrganizationId,
        subscription_id
      );
      const addedUserService = await (isSameOrganization
        ? createUserServiceAccess(context, {
            subscription_id,
            user_id: user.id as UserId,
            capabilities: input.capabilities,
          })
        : createUserAccessForOtherOrg(context, {
            subscription_id,
            user_id: user.id as UserId,
            capabilities: input.capabilities,
            organization_id: user.organization_id as OrganizationId,
          }));
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

      // Find subscription and remove it if no other userServices
      const usersServices = await loadUnsecureUserServiceBy({
        subscription_id: deletedUserService.subscription_id,
      });

      if (usersServices.length === 0) {
        const [subscription] = await loadSubscriptionBy(
          'id',
          deletedUserService.subscription_id
        );
        await db<Subscription>(context, 'Subscription')
          .where('id', '=', subscription.id)
          .delete('*')
          .returning('*');
      }

      return deletedUserService;
    },
  },
};

export default resolvers;
