import { dbRaw, dbUnsecure } from '../../../knexfile';
import { UserWithRoleCommunity } from '../../managers/awx/community/awx-user-community.helper';
import Service, {
  ServiceId,
  ServiceMutator,
} from '../../model/kanel/public/Service';

export const deleteServiceUnsecure = async (field: ServiceMutator) => {
  return dbUnsecure<Service>('Service').where(field).delete('*');
};

export const loadUnsecureAllUserFromServiceForAWX = async (
  id: ServiceId
): Promise<UserWithRoleCommunity[]> => {
  return dbUnsecure<Service>('Service')
    .leftJoin('Subscription', 'Subscription.service_id', '=', 'Service.id')
    .leftJoin(
      'User_Service',
      'User_Service.subscription_id',
      '=',
      'Subscription.id'
    )
    .leftJoin('User', 'User_Service.user_id', '=', 'User.id')
    .leftJoin(
      'Service_Capability',
      'Service_Capability.user_service_id',
      '=',
      'User_Service.id'
    )
    .where('Service.id', '=', id)
    .select([
      'User.email',
      dbRaw(`
      CASE 
        WHEN array_agg("Service_Capability".service_capability_name) @> ARRAY['MANAGE_ACCESS', 'ADMIN_SUBSCRIPTION'] 
        THEN true 
        ELSE false 
      END as admin
    `),
    ])
    .groupBy('User.id');
};
