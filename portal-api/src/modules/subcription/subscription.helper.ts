import { db, dbRaw, dbUnsecure } from '../../../knexfile';
import Subscription, {
  SubscriptionId,
  SubscriptionInitializer,
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { PortalContext } from '../../model/portal-context';
import { User } from '../../model/user';
import Service from '../../model/kanel/public/Service';

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
