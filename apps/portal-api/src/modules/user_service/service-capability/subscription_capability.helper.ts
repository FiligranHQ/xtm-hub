import { dbUnsecure } from '../../../../knexfile';
import { SubscriptionCapability } from '../../../__generated__/resolvers-types';
import { SubscriptionCapabilityMutator } from '../../../model/kanel/public/SubscriptionCapability';

export const loadSubscriptionCapabilityBy = async (
  field: SubscriptionCapabilityMutator
) => {
  return dbUnsecure<SubscriptionCapability>('Subscription_Capability').where(
    field
  );
};
