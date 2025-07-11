import { Knex } from 'knex';
import { dbUnsecure, QueryOpts } from '../../knexfile';
import Subscription from '../model/kanel/public/Subscription';
import { PortalContext } from '../model/portal-context';
import { GenericServiceCapabilityName } from '../modules/user_service/service-capability/generic_service_capability.const';
import { ForbiddenAccess } from '../utils/error.util';

export const setDeleteSecurityForUserServiceCapability = <T>(
  context: PortalContext,
  queryContext: Knex.QueryBuilder<T>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  opts: QueryOpts
): Knex.QueryBuilder<T> => {
  const subscription = dbUnsecure('Subscription')
    .where({
      service_instance_id: context.serviceInstanceId,
      organization_id: context.user.selected_organization_id,
    })
    .first() as unknown as Subscription;

  const getUserCapability = dbUnsecure('User_Service')
    .leftJoin(
      'UserService_Capability',
      'User_Service.id',
      'UserService_Capability.user_service_id'
    )
    .leftJoin(
      'Generic_Service_Capability',
      'Generic_Service_Capability.id',
      'UserService_Capability.generic_service_capability_id'
    )
    .where({
      user_id: context.user.id,
      'User_Service.subscription_id': subscription.id,
      'Generic_Service_Capability.name':
        GenericServiceCapabilityName.MANAGE_ACCESS,
    })
    .first();

  if (!getUserCapability) {
    throw ForbiddenAccess('Insufficient rights');
  }
  return queryContext;
};
