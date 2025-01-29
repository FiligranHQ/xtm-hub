import { db, dbTx } from '../../../knexfile';
import { Resolvers } from '../../__generated__/resolvers-types';
import Subscription, {
  SubscriptionId,
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';
import UserService from '../../model/kanel/public/UserService';
import {
  ALREADY_EXISTS,
  AlreadyExistsError,
  NOT_FOUND,
  NotFoundError,
  UnknownError,
} from '../../utils/error.util';
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
      const trx = await dbTx();
      try {
        const user = await getOrCreateUser({
          email: input.email,
        });

        const [subscription] = await loadSubscriptionBy({
          service_instance_id: extractId(input.serviceInstanceId),
          organization_id: extractId(input.organizationId),
        } as SubscriptionMutator);

        await insertUserIntoOrganization(context, user, subscription.id);
        if (!subscription) {
          throw NotFoundError('SUBSCRIPTION_NOT_FOUND_ERROR');
        }
        if (await isUserServiceExist(user.id as UserId, subscription.id)) {
          throw AlreadyExistsError(
            'The User access to service is already exist'
          );
        }
        console.log('ICI');
        await createUserServiceAccess(context, {
          subscription_id: subscription.id,
          user_id: user.id as UserId,
          capabilities: input.capabilities,
        });

        console.log('LA ? ');
        const returningSubscription =
          await fillSubscriptionWithOrgaServiceAndUserService(
            context,
            subscription.id as SubscriptionId
          );
        await trx.commit();
        return returningSubscription;
      } catch (error) {
        await trx.rollback();
        if (error.name.includes(ALREADY_EXISTS)) {
          throw AlreadyExistsError('USER_ALREADY_EXISTS_ERROR');
        }
        if (error.name.includes(NOT_FOUND)) {
          throw NotFoundError('SUBSCRIPTION_NOT_FOUND_ERROR');
        }
        throw UnknownError('ADD_USER_SERVICE_ERROR', { detail: error });
      }
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
