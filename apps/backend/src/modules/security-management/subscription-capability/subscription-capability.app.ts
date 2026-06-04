import { ServiceCapabilityId } from '../../../model/kanel/public/ServiceCapability';
import Subscription, {
  SubscriptionId,
} from '../../../model/kanel/public/Subscription';
import { SubscriptionDomain } from '../../subscription/subscription.domain';
import { addCapabilitiesToSubscriptions } from './subscription-capability.domain';

export const SubscriptionCapabilityApp = {
  addSubscriptionsCapabilities: async (
    subscriptionsId: SubscriptionId[],
    capabilitiesId: ServiceCapabilityId[]
  ): Promise<Subscription[]> => {
    await addCapabilitiesToSubscriptions(subscriptionsId, capabilitiesId);
    return SubscriptionDomain.loadSubscriptionsBy(subscriptionsId);
  },
};
