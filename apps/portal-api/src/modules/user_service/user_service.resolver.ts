import { fromGlobalId } from 'graphql-relay/node/node.js';
import { db, dbTx } from '../../../knexfile';
import { Resolvers } from '../../__generated__/resolvers-types';
import Subscription, {
  SubscriptionId,
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';
import UserService, {
  UserServiceId,
} from '../../model/kanel/public/UserService';
import {
  ALREADY_EXISTS,
  AlreadyExistsError,
  FORBIDDEN_ACCESS,
  ForbiddenAccess,
  NOT_FOUND,
  NotFoundError,
  UnknownError,
} from '../../utils/error.util';
import { extractId } from '../../utils/utils';
import { loadSubscriptionWithOrganizationAndCapabilitiesBy } from '../subcription/subscription.helper';
import { loadUserBy, loadUserDetails } from '../users/users.domain';
import {
  getOrCreateUser,
  insertUserIntoOrganization,
} from '../users/users.helper';
import {
  createUserServiceAccess,
  isUserServiceExist,
  loadUnsecureUserServiceBy,
} from './user-service.helper';
import {
  getSubscription,
  getUserServiceCapabilities,
  loadUserServiceBySubscription,
  loadUserServiceByUser,
} from './user_service.domain';

const resolvers: Resolvers = {
  UserService: {
    user: ({ user_id }) => loadUserDetails({ 'User.id': user_id as UserId }),
    subscription: ({ id }, _, context) => getSubscription(context, id),
    user_service_capability: ({ id }, _, context) =>
      getUserServiceCapabilities(context, id as UserServiceId),
  },
  Query: {
    userServiceOwned: (_, { first, after, orderMode, orderBy }, context) => {
      return loadUserServiceByUser(context, {
        first,
        after,
        orderMode,
        orderBy,
      });
    },
    userServiceFromSubscription: async (
      _,
      { first, after, orderMode, orderBy, subscription_id },
      context
    ) => {
      return loadUserServiceBySubscription(
        context,
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
    addUserService: async (_, { input }, context) => {
      const trx = await dbTx();
      try {
        if (input.email.some((email) => email === context.user.email)) {
          throw ForbiddenAccess('CANT_SUBSCRIBE_YOURSELF');
        }
        const [subscription] =
          await loadSubscriptionWithOrganizationAndCapabilitiesBy(context, {
            'Subscription.id': extractId<SubscriptionId>(input.subscriptionId),
          } as SubscriptionMutator);

        if (!subscription) {
          throw NotFoundError('SUBSCRIPTION_NOT_FOUND_ERROR');
        }
        const userServices = [];
        for (const email of input.email) {
          const user = await getOrCreateUser({
            email: email,
          });

          await insertUserIntoOrganization(context, user, subscription.id);
          const userServiceAlreadyExist = await isUserServiceExist(
            user.id as UserId,
            subscription.id
          );

          if (!userServiceAlreadyExist) {
            const createdUserService = await createUserServiceAccess(
              context,
              trx,
              {
                subscription_id: subscription.id,
                user_id: user.id as UserId,
                capabilities: input.capabilities,
              }
            );
            userServices.push(createdUserService);
          }
        }

        await trx.commit();

        return userServices;
      } catch (error) {
        await trx.rollback();
        if (error.name.includes(ALREADY_EXISTS)) {
          throw AlreadyExistsError('USER_ALREADY_EXISTS_ERROR');
        }
        if (error.name.includes(NOT_FOUND)) {
          throw NotFoundError('SUBSCRIPTION_NOT_FOUND_ERROR');
        }
        if (error.name.includes(FORBIDDEN_ACCESS)) {
          throw ForbiddenAccess('CANT_SUBSCRIBE_YOURSELF');
        }
        throw UnknownError('ADD_USER_SERVICE_ERROR', { detail: error });
      }
    },
    deleteUserService: async (_, { input }, context) => {
      const userToDelete = await loadUserBy({ email: input.email });
      const [deletedUserService] = await db<UserService>(
        context,
        'User_Service'
      )
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
      const usersServices = await loadUnsecureUserServiceBy({
        subscription_id: deletedUserService?.subscription_id,
      });

      if (usersServices.length === 0) {
        const [subscription] =
          await loadSubscriptionWithOrganizationAndCapabilitiesBy(context, {
            'Subscription.id': deletedUserService?.subscription_id,
          } as SubscriptionMutator);
        await db<Subscription>(context, 'Subscription')
          .where('Subscription.id', '=', subscription.id)
          .delete('*')
          .returning('*');
      }

      return deletedUserService;
    },
  },
};

export default resolvers;
