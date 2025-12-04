import { withTransaction } from '../../context/database.context';
import Subscription from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';
import UserService from '../../model/kanel/public/UserService';
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
    subscription: Subscription,
    emails: string[],
    capabilities: string[]
  ): Promise<UserService[]> => {
    const userServices: UserService[] = [];
    return await withTransaction(async () => {
      for (const email of emails) {
        const user = await getOrCreateUser({
          email: email,
        });

        await insertUserIntoOrganization(user, subscription.id);
        const userServiceAlreadyExist = await isUserServiceExist(
          user.id as UserId,
          subscription.id
        );

        if (!userServiceAlreadyExist) {
          const createdUserService = await createUserServiceAccess({
            subscription_id: subscription.id,
            user_id: user.id as UserId,
            capabilities: capabilities,
          });
          userServices.push(createdUserService);
        }
      }
      return userServices;
    });
  },
};
