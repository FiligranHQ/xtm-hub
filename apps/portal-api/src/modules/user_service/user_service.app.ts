import { Knex } from 'knex';
import Subscription from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';
import UserService from '../../model/kanel/public/UserService';
import { PortalContext } from '../../model/portal-context';
import {
  getOrCreateUser,
  insertUserIntoOrganization,
} from '../users/users.helper';
import {
  createUserServiceAccess,
  isUserServiceExist,
} from './user-service.helper';

export const userServiceApp = {
  addUserService: async (
    context: PortalContext,
    trx: Knex.Transaction,
    subscription: Subscription,
    emails: string[],
    capabilities: string[]
  ): Promise<UserService[]> => {
    try {
      const userServices: UserService[] = [];
      for (const email of emails) {
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
              capabilities: capabilities,
            }
          );
          userServices.push(createdUserService);
        }
      }

      await trx.commit();

      return userServices;
    } catch {
      await trx.rollback();
    }
  },
};
