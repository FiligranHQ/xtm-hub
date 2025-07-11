import { db, dbRaw, dbUnsecure } from '../../../knexfile';
import { OrganizationId } from '../../model/kanel/public/Organization';
import Subscription, {
  SubscriptionId,
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import { PortalContext } from '../../model/portal-context';
import { formatRawObject } from '../../utils/queryRaw.util';

export const deleteSubscriptionUnsecure = async (
  field: SubscriptionMutator
) => {
  return dbUnsecure<Subscription>('Subscription')
    .where(field)
    .delete('*')
    .returning('*');
};

export const loadUnsecureSubscriptionBy = async (
  field: SubscriptionMutator
) => {
  return dbUnsecure<Subscription>('Subscription').where(field);
};

export const loadSubscriptionBy = async (
  context: PortalContext,
  field: SubscriptionMutator
) => {
  return db<Subscription>(context, 'Subscription')
    .where(field)
    .leftJoin(
      'Organization',
      'Organization.id',
      '=',
      'Subscription.organization_id'
    )
    .leftJoin(
      'ServiceInstance',
      'ServiceInstance.id',
      '=',
      'Subscription.service_instance_id'
    )
    .leftJoin(
      'ServiceDefinition',
      'ServiceDefinition.id',
      '=',
      'ServiceInstance.service_definition_id'
    )
    .leftJoin(
      'Service_Capability',
      'Service_Capability.service_definition_id',
      '=',
      'ServiceDefinition.id'
    )
    .leftJoin(
      'Subscription_Capability',
      'Subscription_Capability.subscription_id',
      '=',
      'Subscription.id'
    )
    .select([
      'Subscription.*',
      dbRaw(
        formatRawObject({
          columnName: 'Organization',
          typename: 'Organization',
          as: 'organization',
        })
      ),
      dbRaw(
        `
     
            json_build_object(
                'id', "ServiceInstance".id, 
                'name', "ServiceInstance".name, 
                'description', "ServiceInstance".description,
         
                'service_definition', 
                  json_build_object(
                  'id', "ServiceDefinition".id,
                    'service_capability', 
                        json_agg(json_build_object(
                          'id', "Service_Capability".id, 
                          'name', "Service_Capability".name, 
                          'description', "Service_Capability".description, 
                          '__typename', 'Service_Capability'
                        )), 
                  '__typename', 'ServiceDefinition'
                  ), 
                '__typename', 'ServiceInstance'
            
        
    ) AS service_instance`
      ),
      dbRaw(
        `COALESCE(
        json_agg(
            json_build_object(
                'id', "Subscription_Capability".id, 
                'service_capability_id', "Subscription_Capability".service_capability_id, 
                'service_capability', json_build_object(
                    'id', "Service_Capability".id, 
                    'name', "Service_Capability".name, 
                    'description', "Service_Capability".description, 
                    '__typename', 'Service_Capability'
                ), 
                '__typename', 'Subscription_Capability'
            )
        ) FILTER (WHERE "Subscription_Capability".id IS NOT NULL),
        '[]'::json
    ) AS subscription_capability`
      ),
    ])
    .groupBy([
      'Subscription.id',
      'Organization.id',
      'ServiceInstance.id',
      'ServiceDefinition.id',
      'Service_Capability.id',
    ]);
};

export const isOrgMatchingSub = async (
  organization_id: OrganizationId,
  subscriptionId: SubscriptionId
) => {
  const [subscription] = await loadUnsecureSubscriptionBy({
    id: subscriptionId,
  });
  return subscription.organization_id === organization_id;
};

export const insertSubscription = async (
  context: PortalContext,
  dataSubscription
) => {
  await db<Subscription>(context, 'Subscription').insert(dataSubscription);
};

export const insertUnsecureSubscription = async (dataSubscription) => {
  return dbUnsecure<Subscription>('Subscription')
    .insert(dataSubscription)
    .returning('*');
};
