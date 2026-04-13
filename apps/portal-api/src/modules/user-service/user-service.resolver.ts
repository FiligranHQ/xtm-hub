import { Resolvers } from '../../__generated__/resolvers-types';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';
import { UserServiceId } from '../../model/kanel/public/UserService';
import { UnknownErrorCode } from '../../utils/error/error.code';
import { mapToGraphQLError } from '../../utils/error/error.mapping';
import { extractId } from '../../utils/utils';
import { loadUserDetails } from '../organization-management/users/user-domain/users.domain';
import { UserServiceApp } from './user-service.app';
import { UserServiceDomain } from './user-service.domain';

const resolvers: Resolvers = {
  UserService: {
    user: ({ user_id }) => loadUserDetails({ 'User.id': user_id as UserId }),
    subscription: ({ id }, _) =>
      UserServiceDomain.loadSubscriptionByUserService(id as UserServiceId),
    user_service_capability: ({ id }, _) =>
      UserServiceDomain.loadUserServiceCapabilities(id as UserServiceId),
  },
  Query: {
    userServiceOwned: (_, { first, after, orderMode, orderBy }, context) => {
      return UserServiceDomain.loadUserServiceByUser(context.user, {
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
      return UserServiceDomain.loadUserServiceBySubscription(
        {
          first,
          after,
          orderMode,
          orderBy,
        },
        extractId<SubscriptionId>(subscription_id)
      );
    },
  },
  Mutation: {
    addYourselfInUserService: async (_, { input }, context) => {
      try {
        const user = context.user;
        return await UserServiceApp.addYourselfInUserService(
          user.selected_organization_id,
          input.serviceInstanceId,
          input.email,
          []
        );
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.AddUserServiceError);
      }
    },
    addUserService: async (_, { input }, context) => {
      try {
        const user = context.user;
        return await UserServiceApp.addUserService(
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
      try {
        return await UserServiceApp.deleteUserService(
          input.email,
          extractId<SubscriptionId>(input.subscriptionId)
        );
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
  },
};

export default resolvers;
