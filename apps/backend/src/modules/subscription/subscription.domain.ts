import { db, dbRaw } from '../../../knexfile';
import { OrganizationId } from '../../model/kanel/public/Organization';
import ServiceCapability from '../../model/kanel/public/ServiceCapability';
import Subscription, {
  SubscriptionId,
  SubscriptionInitializer,
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import SubscriptionCapability, {
  SubscriptionCapabilityId,
} from '../../model/kanel/public/SubscriptionCapability';
import UserService from '../../model/kanel/public/UserService';
import { restrictSubscriptionToUserOrganization } from '../../security/restriction/user-service';
import { UnknownErrorCode } from '../../utils/error/error.code';
import { formatRawObject } from '../../utils/query-raw.util';

export const SubscriptionDomain = {
  deleteSubscriptions: async (
    ids: SubscriptionId[]
  ): Promise<Subscription[]> => {
    return db<Subscription>('Subscription').whereIn('id', ids).delete('*');
  },

  getSubscriptionCapability: async (
    id: SubscriptionId
  ): Promise<SubscriptionCapability[]> => {
    return db<SubscriptionCapability>('Subscription_Capability')
      .where('Subscription_Capability.subscription_id', '=', id)
      .select('Subscription_Capability.*');
  },

  getUserService: (id: SubscriptionId): Promise<UserService[]> => {
    return db<UserService>('User_Service')
      .tap(restrictSubscriptionToUserOrganization)
      .where('User_Service.subscription_id', '=', id)
      .select('User_Service.*');
  },

  getServiceCapability: async (
    id: SubscriptionCapabilityId
  ): Promise<ServiceCapability | undefined> => {
    return db<ServiceCapability>('Service_Capability')
      .leftJoin(
        'Subscription_Capability',
        'Subscription_Capability.service_capability_id',
        '=',
        'Service_Capability.id'
      )
      .where('Subscription_Capability.id', '=', id)
      .select('Service_Capability.*')
      .first();
  },

  transferSubscriptionToOrganization: async ({
    subscriptionId,
    organizationId,
  }: {
    subscriptionId: SubscriptionId;
    organizationId: OrganizationId;
  }) => {
    return db<Subscription>('Subscription')
      .update({ organization_id: organizationId })
      .where({ id: subscriptionId });
  },

  createSubscription: async (
    data: SubscriptionInitializer
  ): Promise<Subscription> => {
    const [createdSubscription] = await db<Subscription>('Subscription')
      .insert(data)
      .returning('*');
    if (!createdSubscription) {
      throw new Error(UnknownErrorCode.ServiceSubscriptionError);
    }
    return createdSubscription;
  },

  loadSubscriptionBy: async (
    field: SubscriptionMutator
  ): Promise<Subscription | undefined> => {
    return db<Subscription>('Subscription').where(field).first();
  },

  loadSubscriptionsByIds: async (
    ids: SubscriptionId[]
  ): Promise<Subscription[]> => {
    return db<Subscription>('Subscription').whereIn('id', ids);
  },

  updateSubscriptionBy: async (
    field: SubscriptionMutator,
    data: SubscriptionMutator
  ): Promise<Subscription[]> => {
    return db<Subscription>('Subscription')
      .where(field)
      .update(data)
      .returning('*');
  },

  loadSubscriptionWithOrganizationAndCapabilitiesBy: async (
    field: SubscriptionMutator
  ) => {
    return db<Subscription>('Subscription')
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
  },
};
