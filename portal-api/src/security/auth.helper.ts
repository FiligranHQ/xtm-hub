import { fromGlobalId } from 'graphql-relay/node/node.js';
import { dbRaw, dbUnsecure } from '../../knexfile';
import Service from '../model/kanel/public/Service';
import { loadSubscriptionBy } from '../modules/subcription/subscription.helper';
import { CAPABILITY_BYPASS } from '../portal.const';
import { ServiceCapabilityArgs } from './directive-auth';

import { SubscriptionMutator } from '../model/kanel/public/Subscription';
import { UserLoadUserBy } from '../model/user';
import { extractId } from '../utils/utils';

export const loadCapabilitiesByServiceId = async (
  user: UserLoadUserBy,
  serviceId: string
): Promise<{ capabilities: string[] } | undefined> => {
  const userId = user.id;
  const organizationId = user.selected_organization_id;
  return dbUnsecure<Service>('Service')
    .leftJoin('Subscription as subscription', function () {
      this.on('subscription.service_id', '=', 'Service.id').andOn(
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
      'Service_Capability as serviceCapability',
      'serviceCapability.user_service_id',
      '=',
      'userService.id'
    )
    .select([
      dbRaw(`
      COALESCE(json_agg("serviceCapability"."service_capability_name") FILTER (WHERE "serviceCapability"."service_capability_name" IS NOT NULL), '[]'::json) AS capabilities
    `),
    ])
    .where('Service.id', '=', dbRaw('?', [serviceId]))
    .groupBy(['Service.id', 'subscription.id'])
    .first();
};

export const userHasBypassCapability = (user: UserLoadUserBy): boolean => {
  return user.capabilities.some((c) => c.name === CAPABILITY_BYPASS.name);
};

export const getCapabilityUser = (
  user: UserLoadUserBy,
  args: ServiceCapabilityArgs
) =>
  args.service_id
    ? loadCapabilitiesByServiceId(user, fromGlobalId(args.service_id).id)
    : loadSubscriptionBy({
        id: extractId(args.subscription_id),
      } as SubscriptionMutator).then(([subscription]) =>
        loadCapabilitiesByServiceId(user, subscription.service_id)
      );
