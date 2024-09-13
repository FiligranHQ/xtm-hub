import { User } from '../model/user';
import { dbRaw, dbUnsecure } from '../../knexfile';
import Service from '../model/kanel/public/Service';

export const loadCapabilitiesByServiceId = async (
  user: User,
  serviceId: string
): Promise<{ capabilities: string[] } | undefined> => {
  const userId = user.id;
  const organizationId = user.organization_id;
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
