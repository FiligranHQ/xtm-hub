import { withTransaction } from '../../../context/database.context';
import { ServiceCapabilityId } from '../../../model/kanel/public/ServiceCapability';
import { SubscriptionId } from '../../../model/kanel/public/Subscription';
import { loadSubscriptionBy } from '../../subscription/subscription.domain';
import { addCapabilitiesToSubscription } from './subscription-capability.domain';

export const subscriptionCapabilityApp = {
  addSubscriptionCapability: async (
    subscriptionsId: SubscriptionId[],
    capabilitiesId: ServiceCapabilityId[]
  ) => {
    const modifiedSubscriptions = [];
    await withTransaction(async () => {
      for (const subscriptionId of subscriptionsId) {
        await addCapabilitiesToSubscription(subscriptionId, capabilitiesId);
        modifiedSubscriptions.push(loadSubscriptionBy({ id: subscriptionId }));
      }
    });
    return modifiedSubscriptions;
  },
};
