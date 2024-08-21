import { dbUnsecure } from '../../../knexfile';
import Subscription, {
    SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
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