import { GraphQLError } from 'graphql/error/index.js';
import { db } from '../../../knexfile';
import { Resolvers } from '../../__generated__/resolvers-types';
import Subscription, {
  SubscriptionId,
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';
import UserService from '../../model/kanel/public/UserService';
import { extractId } from '../../utils/utils';
import { fillSubscriptionWithOrgaServiceAndUserService } from '../subcription/subscription.domain';
import { loadSubscriptionBy } from '../subcription/subscription.helper';
import { loadUserBy } from '../users/users.domain';
import {
  getOrCreateUser,
  insertUserIntoOrganization,
} from '../users/users.helper';
import {
  createUserServiceAccess,
  isUserServiceExist,
  loadUnsecureUserServiceBy,
} from './user-service.helper';
import { loadUserServiceByUser } from './user_service.domain';

const resolvers: Resolvers = {
  Query: {
    userServiceOwned: async (
      _,
      { first, after, orderMode, orderBy },
      context
    ) => {
      return loadUserServiceByUser(context, {
        first,
        after,
        orderMode,
        orderBy,
      });
    },
  },
  Mutation: {
    //TODO Modify for the use case
    addUserService: async (_, { input }, context) => {
      const user = await getOrCreateUser({
        email: input.email,
      });

      const [subscription] = await loadSubscriptionBy({
        service_id: extractId(input.serviceId),
        organization_id: extractId(input.organizationId),
      } as SubscriptionMutator);

      await insertUserIntoOrganization(context, user, subscription.id);
      if (!subscription) {
        throw new GraphQLError('Sorry the subscription does not exist', {
          extensions: { code: '[User_Service] UNKNOWN SUBSCRIPTION' },
        });
      }
      if (await isUserServiceExist(user.id as UserId, subscription.id)) {
        throw new GraphQLError(' The User access to service is already exist', {
          extensions: { code: '[User_Service] ALREADY_EXIST' },
        });
      }

      await createUserServiceAccess(context, {
        subscription_id: subscription.id,
        user_id: user.id as UserId,
        capabilities: input.capabilities,
      });

      const returningSubscription =
        await fillSubscriptionWithOrgaServiceAndUserService(
          context,
          subscription.id as SubscriptionId
        );
      return returningSubscription;
    },
    deleteUserService: async (_, { input }, context) => {
      const userToDelete = await loadUserBy({ email: input.email });
      const [deletedUserService] = await db<UserService & Subscription>(
        context,
        'User_Service'
      )
        .where('user_id', '=', userToDelete.id)
        .where('subscription_id', '=', extractId(input.subscriptionId))
        .delete('*')
        .returning('*');

      // Find subscription and remove it if no other userServices
      const usersServices = await loadUnsecureUserServiceBy({
        subscription_id: deletedUserService.subscription_id,
      });

      if (usersServices.length === 0) {
        const [subscription] = await loadSubscriptionBy({
          id: deletedUserService.subscription_id,
        });
        await db<Subscription>(context, 'Subscription')
          .where('id', '=', subscription.id)
          .delete('*')
          .returning('*');
      }

      const subscription = await fillSubscriptionWithOrgaServiceAndUserService(
        context,
        extractId(input.subscriptionId) as SubscriptionId
      );

      return subscription;
    },
  },
};

export default resolvers;
