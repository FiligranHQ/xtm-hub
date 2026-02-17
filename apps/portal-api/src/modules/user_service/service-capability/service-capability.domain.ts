import { db } from '../../../../knexfile';
import UserService, {
  UserServiceId,
} from '../../../model/kanel/public/UserService';
import { restrictSubscriptionToUserOrganization } from '../../../security/restriction/user-service';
import { GenericServiceCapabilityName } from './generic_service_capability.const';

export const getManageAccessLeft = async (userServiceId: UserServiceId) => {
  const userService = await db<UserService>('User_Service')
    .select('subscription_id')
    .tap(restrictSubscriptionToUserOrganization)
    .where('User_Service.id', userServiceId)
    .first();

  if (!userService) {
    return false;
  }
  const result = await db<UserService>('User_Service')
    .tap(restrictSubscriptionToUserOrganization)
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
    .andWhere(
      'Generic_Service_Capability.name',
      GenericServiceCapabilityName.MANAGE_ACCESS
    )
    .countDistinct('User_Service.id as count')
    .first();

  return result.count !== '1';
};
