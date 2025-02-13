import { fromGlobalId } from 'graphql-relay/node/node.js';
import { db } from '../../../../knexfile';
import { ServiceCapabilityId } from '../../../model/kanel/public/ServiceCapability';
import { SubscriptionId } from '../../../model/kanel/public/Subscription';
import SubscriptionCapability from '../../../model/kanel/public/SubscriptionCapability';
import { PortalContext } from '../../../model/portal-context';

export const addCapabilitiesToSubscription = async (
  context: PortalContext,
  capabilityIds: string[],
  subscription_id: SubscriptionId
) => {
  for (const capaId of capabilityIds) {
    const data = {
      service_capability_id: fromGlobalId(capaId).id as ServiceCapabilityId,
      subscription_id: subscription_id as SubscriptionId,
    };
    await db<SubscriptionCapability>(context, 'Subscription_Capability')
      .insert(data)
      .returning('*');
  }
};
