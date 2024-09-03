import { dbUnsecure } from '../../../knexfile';
import Subscription, {
  SubscriptionId,
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import { OrganizationId } from '../../model/kanel/public/Organization';
export const deleteSubscriptionUnsecure = async (subscriptionId: string) => {
  return dbUnsecure<Subscription>('Subscription')
    .where('Subscription.id', '=', subscriptionId)
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
