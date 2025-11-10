import { db } from '../../../../../knexfile';
import { SubscriptionCapability } from '../../../../__generated__/resolvers-types';

import { SubscriptionCapabilityMutator } from '../../../../model/kanel/public/SubscriptionCapability';
import UserServiceCapability from '../../../../model/kanel/public/UserServiceCapability';

export const loadSubscriptionCapabilitiesBy = async (
  field: SubscriptionCapabilityMutator
) => {
  return db<SubscriptionCapability>('Subscription_Capability').where(field);
};

export const insertServiceCapability = async (genericServiceCapabilityData) => {
  return db<UserServiceCapability>('UserService_Capability')
    .insert(genericServiceCapabilityData)
    .returning('*');
};
