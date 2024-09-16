import { db, dbRaw, dbUnsecure } from '../../../knexfile';
import Subscription, {
  SubscriptionId,
  SubscriptionInitializer,
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { PortalContext } from '../../model/portal-context';

export const deleteSubscriptionUnsecure = async (serviceId: string) => {
  return dbUnsecure<Subscription>('Subscription')
    .where('Subscription.service_id', '=', serviceId)
    .delete('*')
    .returning('*');
};

export const loadUnsecureSubscriptionBy = async (
  field: SubscriptionMutator
) => {
  return dbUnsecure<Subscription>('Subscription').where(field);
};

export const loadSubscriptionBy = async (field: string, value: string) => {
  return dbUnsecure<Subscription>('Subscription').where(field, value);
};

export const isOrgMatchingSub = async (
  organization_id: OrganizationId,
  subscriptionId: SubscriptionId
) => {
  const [subscription] = await loadUnsecureSubscriptionBy({
    id: subscriptionId,
  });
  return subscription.organization_id === organization_id;
};

export const insertSubscription = async (
  context: PortalContext,
  dataSubscription
) => {
  return db<Subscription>(context, 'Subscription')
    .insert(dataSubscription)
    .returning('*');
};

export const insertUnsecureSubscription = async (
  dataSubscription: SubscriptionInitializer
) => {
  return dbUnsecure<Subscription>('Subscription')
    .insert(dataSubscription)
    .returning('*');
};

export const loadUsersBySubscriptionForAWX = async (id: SubscriptionId) => {
  return dbUnsecure<Subscription>('Subscription')
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
    .where('Subscription.id', id)
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
