import { fromGlobalId } from 'graphql-relay/node/node.js';
import { db, dbRaw } from '../../../../knexfile';
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

export const loadSubscriptionCapabilities = async (
  context: PortalContext,
  subscriptionId: SubscriptionId
) => {
  return db<SubscriptionCapability>(context, 'Subscription_Capability')
    .where('Subscription_Capability.subscription_id', '=', subscriptionId)
    .leftJoin(
      'Service_Capability',
      'Service_Capability.id',
      '=',
      'Subscription_Capability.service_capability_id'
    )
    .select(
      'Subscription_Capability.*',
      dbRaw(
        `json_build_object('id', "Service_Capability".id, 'name', "Service_Capability".name, 'description', "Service_Capability".description, '__typename', 'Service_Capability') as service_capability`
      )
    );
};
