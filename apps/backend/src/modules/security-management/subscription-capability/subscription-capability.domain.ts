import { db, dbRaw } from '../../../../knexfile';
import { withTransaction } from '../../../context/database.context';
import { ServiceCapabilityId } from '../../../model/kanel/public/ServiceCapability';
import { SubscriptionId } from '../../../model/kanel/public/Subscription';
import SubscriptionCapability, {
  SubscriptionCapabilityMutator,
} from '../../../model/kanel/public/SubscriptionCapability';

export const loadSubscriptionCapabilitiesBy = async (
  field: SubscriptionCapabilityMutator
): Promise<SubscriptionCapability[]> => {
  return db<SubscriptionCapability>('Subscription_Capability').where(field);
};

export const addCapabilitiesToSubscription = async (
  subscriptionId: SubscriptionId,
  capabilityIds: ServiceCapabilityId[]
): Promise<SubscriptionCapability[]> => {
  return addCapabilitiesToSubscriptions([subscriptionId], capabilityIds);
};

export const addCapabilitiesToSubscriptions = async (
  subscriptionIds: SubscriptionId[],
  capabilityIds: ServiceCapabilityId[]
): Promise<SubscriptionCapability[]> => {
  if (!subscriptionIds.length || !capabilityIds.length) {
    return [];
  }

  const data = subscriptionIds.flatMap((subscriptionId) =>
    capabilityIds.map((capabilityId) => ({
      service_capability_id: capabilityId,
      subscription_id: subscriptionId,
    }))
  );

  return db<SubscriptionCapability>('Subscription_Capability')
    .insert(data)
    .onConflict(['subscription_id', 'service_capability_id'])
    .ignore()
    .returning('*');
};

export const replaceCapabilitiesForSubscription = async (
  subscriptionId: SubscriptionId,
  capabilityIds: ServiceCapabilityId[]
): Promise<SubscriptionCapability[]> => {
  let subscriptionCapabilities: SubscriptionCapability[] = [];
  await withTransaction(async () => {
    await db<SubscriptionCapability>('Subscription_Capability')
      .where({
        subscription_id: subscriptionId,
      })
      .delete();

    subscriptionCapabilities = await addCapabilitiesToSubscription(
      subscriptionId,
      capabilityIds
    );
  });
  return subscriptionCapabilities;
};

export const loadSubscriptionCapabilities = async (
  subscriptionId: SubscriptionId
) => {
  return db<SubscriptionCapability>('Subscription_Capability')
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
