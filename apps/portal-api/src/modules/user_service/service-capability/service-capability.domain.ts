import { db } from '../../../../knexfile';
import { Restriction } from '../../../__generated__/resolvers-types';
import UserService, {
  UserServiceId,
} from '../../../model/kanel/public/UserService';
import { PortalContext } from '../../../model/portal-context';

export const getManageAccessLeft = async (
  context: PortalContext,
  userServiceId: UserServiceId
) => {
  const userService = await db<UserService>(context, 'User_Service')
    .select('subscription_id')
    .where('id', userServiceId)
    .first();

  if (!userService) {
    return false;
  }
  const result = await db<UserService>(context, 'User_Service')
    .leftJoin(
      'UserService_Capability',
      'User_Service.id',
      '=',
      'UserService_Capability.user_service_id'
    )
    .leftJoin(
      'Generic_Service_Capability',
      'UserService_Capability.generic_service_capability_id',
      '=',
      'Generic_Service_Capability.id'
    )
    .where('User_Service.subscription_id', userService.subscription_id)
    .andWhere('Generic_Service_Capability.name', Restriction.ManageAccess)
    .countDistinct('User_Service.id as count')
    .first();

  return result.count !== '1';
};
