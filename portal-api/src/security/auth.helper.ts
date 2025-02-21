import { fromGlobalId } from 'graphql-relay/node/node.js';
import { dbRaw, dbUnsecure } from '../../knexfile';
import { loadSubscriptionBy } from '../modules/subcription/subscription.helper';
import { CAPABILITY_BYPASS } from '../portal.const';
import { ServiceCapabilityArgs } from './directive-auth';

import { ServiceInstance } from '../__generated__/resolvers-types';
import { SubscriptionMutator } from '../model/kanel/public/Subscription';
import { UserLoadUserBy } from '../model/user';
import { extractId } from '../utils/utils';

export const loadCapabilitiesByServiceId = async (
  user: UserLoadUserBy,
  serviceId: string
): Promise<{ capabilities: string[] } | undefined> => {
  const userId = user.id;
  const organizationId = user.selected_organization_id;
  return dbUnsecure<ServiceInstance>('ServiceInstance')
    .leftJoin('Subscription as subscription', function () {
      this.on(
        'subscription.service_instance_id',
        '=',
        'ServiceInstance.id'
      ).andOn(
        'subscription.organization_id',
        '=',
        dbRaw('?', [organizationId])
      );
    })
    .leftJoin('User_Service as userService', function () {
      this.on('userService.subscription_id', '=', 'subscription.id').andOn(
        'userService.user_id',
        '=',
        dbRaw('?', [userId])
      );
    })
    .leftJoin(
      'UserService_Capability as userServiceCapa',
      'userServiceCapa.user_service_id',
      '=',
      'userService.id'
    )
    .leftJoin(
      'Subscription_Capability',
      'userServiceCapa.subscription_capability_id',
      '=',
      'Subscription_Capability.id'
    )
    .leftJoin(
      'Service_Capability',
      'Subscription_Capability.service_capability_id',
      '=',
      'Service_Capability.id'
    )
    .leftJoin(
      'Generic_Service_Capability',
      'Generic_Service_Capability.id',
      '=',
      'userServiceCapa.generic_service_capability_id'
    )
    .select([
      dbRaw(
        `json_agg(
    CASE
      WHEN "Generic_Service_Capability".id IS NOT NULL THEN
        "Generic_Service_Capability".name
      WHEN "Service_Capability".id IS NOT NULL THEN
        "Service_Capability".name
      ELSE NULL
    END
  ) FILTER (WHERE "Generic_Service_Capability".id IS NOT NULL OR "Service_Capability".id IS NOT NULL) AS capabilities`
      ),
    ])
    .where('ServiceInstance.id', '=', dbRaw('?', [serviceId]))
    .groupBy(['ServiceInstance.id', 'subscription.id'])
    .first();
};

export const userHasBypassCapability = (user: UserLoadUserBy): boolean => {
  return user.capabilities.some((c) => c.name === CAPABILITY_BYPASS.name);
};

export const getCapabilityUser = (
  user: UserLoadUserBy,
  args: ServiceCapabilityArgs
) =>
  args.service_instance_id
    ? loadCapabilitiesByServiceId(
        user,
        fromGlobalId(args.service_instance_id).id
      )
    : loadSubscriptionBy({
        id: extractId(args.subscription_id),
      } as SubscriptionMutator).then(([subscription]) =>
        loadCapabilitiesByServiceId(user, subscription.service_instance_id)
      );
