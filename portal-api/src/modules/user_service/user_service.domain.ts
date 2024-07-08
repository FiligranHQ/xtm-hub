import { PortalContext } from '../../model/portal-context';
import { db, dbRaw } from '../../../knexfile';
import UserService, {
  UserServiceId,
} from '../../model/kanel/public/UserService';
import { UserId } from '../../model/kanel/public/User';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { v4 as uuidv4 } from 'uuid';

export const insertUserService = async (
  context: PortalContext,
  user_id: string,
  addedSuscriptionId: string
) => {
  return db<UserService>(context, 'User_Service')
    .insert({
      id: uuidv4() as UserServiceId,
      user_id: user_id as UserId,
      subscription_id: addedSuscriptionId as SubscriptionId,
      service_personal_data: null,
    })
    .returning('*');
};

export const loadUsersBySubscription = async (
  context: PortalContext,
  serviceId
) => {
  const userServiceQuery = db<UserService>(context, 'User_Service')
    .leftJoin('User as user', 'User_Service.user_id', '=', 'user.id')
    .leftJoin(
      'Subscription as sub',
      'User_Service.subscription_id',
      '=',
      'sub.id'
    )
    .leftJoin('Service as service', 'sub.service_id', '=', 'service.id')
    .leftJoin(
      'Service_Capability as servcapa',
      'User_Service.id',
      '=',
      'servcapa.user_service_id'
    )
    .where('service.id', serviceId)
    .select([
      'User_Service.*',
      dbRaw(
        "(json_agg(json_build_object('id', \"user\".id,'last_name', \"user\".last_name, 'first_name', \"user\".first_name,  'email', \"user\".email, '__typename', 'User')) ->> 0)::json as user"
      ),
      dbRaw(
        "(json_agg(json_build_object('id', \"sub\".id,'service_id', \"sub\".service_id, 'service', json_build_object('id', \"service\".id,'name', \"service\".name,'url', \"service\".url,'__typename', 'Service'), '__typename', 'Subscription')) ->> 0)::json as subscription"
      ),
      dbRaw(
        "(json_agg(json_build_object('id', \"servcapa\".id, 'service_capability_name', \"servcapa\".service_capability_name, '__typename', 'Service_Capability'))) as service_capability"
      ),
    ])
    .groupBy(['User_Service.id']);
  const userService = await userServiceQuery;
  return userService;
};
