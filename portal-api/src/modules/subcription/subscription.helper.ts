import { dbUnsecure } from '../../../knexfile';
import { Subscription } from '../../__generated__/resolvers-types';

export const deleteSubscriptionUnsecure = async (subscriptionId: string) => {
  return dbUnsecure<Subscription>('Subscription')
    .where('Subscription.id', '=', subscriptionId)
    .delete('*')
    .returning('*');
};
