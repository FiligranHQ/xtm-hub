import { Resolvers } from '../../__generated__/resolvers-types';
import { UserId } from '../../model/kanel/public/User';
import { UserServiceId } from '../../model/kanel/public/UserService';
import { UnknownErrorCode } from '../../utils/error/error.code';
import { mapToGraphQLError } from '../../utils/error/error.mapping';
import { createRelayIdScalar } from '../../utils/scalar.util';
import { UserDomain } from '../organization-management/user/user-domain/user.domain';
import { UserServiceApp } from './user-service.app';
import { UserServiceDomain } from './user-service.domain';

const resolvers: Resolvers = {
  UserServiceId: createRelayIdScalar<UserServiceId>('User_Service'),
  UserService: {
    user: ({ user_id }) =>
      UserDomain.loadUserDetails({ 'User.id': user_id as UserId }),
    subscription: ({ id }, _) =>
      UserServiceDomain.loadSubscriptionByUserService(id as UserServiceId),
    user_service_capability: ({ id }, _) =>
      UserServiceDomain.loadUserServiceCapabilities(id as UserServiceId),
  },
  Query: {
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
        subscription_id
      );
    },
  },
  Mutation: {
    addUserService: async (_, { input }, context) => {
      try {
        const user = context.user;
        return await UserServiceApp.addUserService(
          user,
          input.subscriptionId,
          input.email,
          input.capabilities
        );
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.AddUserServiceError);
      }
    },
    editUserService: async (_, { input }) => {
      try {
        return await UserServiceApp.editUserService(
          input.userServiceId,
          input.capabilities
        );
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.AddUserServiceError);
      }
    },
    deleteUserServices: async (_, { input }) => {
      try {
        return await UserServiceApp.deleteUserServices(input.userServiceIds);
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
  },
};

export default resolvers;
