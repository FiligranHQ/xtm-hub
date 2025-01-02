import { db, dbUnsecure } from '../../../knexfile';
import { OrganizationId } from '../../model/kanel/public/Organization';
import Subscription, {
  SubscriptionId,
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import { PortalContext } from '../../model/portal-context';

export const deleteSubscriptionUnsecure = async (
  field: SubscriptionMutator
) => {
  return dbUnsecure<Subscription>('Subscription')
    .where(field)
    .delete('*')
    .returning('*');
};

export const loadUnsecureSubscriptionBy = async (
  field: SubscriptionMutator
) => {
  return dbUnsecure<Subscription>('Subscription').where(field);
};

export const loadSubscriptionBy = async (field: SubscriptionMutator) => {
  return dbUnsecure<Subscription>('Subscription').where(field);
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

export const insertUnsecureSubscription = async (dataSubscription) => {
  return dbUnsecure<Subscription>('Subscription')
    .insert(dataSubscription)
    .returning('*');
};
