import { fromGlobalId } from 'graphql-relay/node/node.js';
import { db } from '../../../knexfile';
import { Resolvers } from '../../__generated__/resolvers-types';
import { requestContext } from '../../context/request.context';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import Subscription, {
  SubscriptionId,
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';
import UserService, {
  UserServiceId,
} from '../../model/kanel/public/UserService';
import { UnknownErrorCode } from '../../utils/error/error.code';
import { mapToGraphQLError } from '../../utils/error/error.mapping';
import { extractId } from '../../utils/utils';
import { loadSubscriptionWithOrganizationAndCapabilitiesBy } from '../subcription/subscription.helper';
import { loadUserBy, loadUserDetails } from '../users/users.domain';
import { loadUserServiceBy } from './user-service.helper';
import { userServiceApp } from './user_service.app';
import {
  getSubscription,
  getUserServiceCapabilities,
  loadUserServiceBySubscription,
  loadUserServiceByUser,
} from './user_service.domain';

const resolvers: Resolvers = {
  UserService: {
    user: ({ user_id }) => loadUserDetails({ 'User.id': user_id as UserId }),
    subscription: ({ id }, _) => getSubscription(id),
    user_service_capability: ({ id }, _) =>
      getUserServiceCapabilities(id as UserServiceId),
  },
  Query: {
    userServiceOwned: (_, { first, after, orderMode, orderBy }, context) => {
      return loadUserServiceByUser(context.user, {
        first,
        after,
        orderMode,
        orderBy,
      });
    },
    userServiceFromSubscription: async (
      _,
      { first, after, orderMode, orderBy, subscription_id }
    ) => {
      return loadUserServiceBySubscription(
        {
          first,
          after,
          orderMode,
          orderBy,
        },
        fromGlobalId(subscription_id).id
      );
    },
  },
  Mutation: {
    addYourselfInUserService: async (_, { input }) => {
      try {
        const { user } = requestContext.require();
        return await userServiceApp.addYourselfInUserService(
          user.selected_organization_id,
          extractId<ServiceInstanceId>(input.serviceInstanceId),
          input.email,
          []
        );
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.AddUserServiceError);
      }
    },
    addUserService: async (_, { input }) => {
      try {
        const { user } = requestContext.require();
        return await userServiceApp.addUserService(
          user,
          extractId<SubscriptionId>(input.subscriptionId),
          input.email,
          input.capabilities
        );
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.AddUserServiceError);
      }
    },
    deleteUserService: async (_, { input }) => {
      const userToDelete = await loadUserBy({ email: input.email });
      const [deletedUserService] = await db<UserService>('User_Service')
        .where('user_id', '=', userToDelete.id)
        .where(
          'subscription_id',
          '=',
          extractId<SubscriptionId>(input.subscriptionId)
        )
        .delete('*')
        .returning('*');

      if (!deletedUserService) {
        return;
      }
      // Find subscription and remove it if no other userServices
      const usersServices = await loadUserServiceBy({
        subscription_id: deletedUserService?.subscription_id,
      });

      if (usersServices.length === 0) {
        const [subscription] =
          await loadSubscriptionWithOrganizationAndCapabilitiesBy({
            'Subscription.id': deletedUserService?.subscription_id,
          } as SubscriptionMutator);
        await db<Subscription>('Subscription')
          .where('Subscription.id', '=', subscription.id)
          .delete('*')
          .returning('*');
      }

      return deletedUserService;
    },
  },
};

export default resolvers;
