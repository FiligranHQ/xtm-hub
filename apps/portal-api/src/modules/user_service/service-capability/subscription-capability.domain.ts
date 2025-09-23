import { db, dbRaw } from '../../../../knexfile';
import { ServiceCapabilityId } from '../../../model/kanel/public/ServiceCapability';
import { SubscriptionId } from '../../../model/kanel/public/Subscription';
import SubscriptionCapability from '../../../model/kanel/public/SubscriptionCapability';
import { PortalContext } from '../../../model/portal-context';

export const addCapabilitiesToSubscription = async (
  context: PortalContext,
  subscriptionId: SubscriptionId,
  capabilityIds: ServiceCapabilityId[]
) => {
  const promises = capabilityIds.map((capabilityId) => {
    const data = {
      service_capability_id: capabilityId,
      subscription_id: subscriptionId,
    };

    return db<SubscriptionCapability>(context, 'Subscription_Capability')
      .insert(data)
      .returning('*');
  });

  await Promise.all(promises);
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
