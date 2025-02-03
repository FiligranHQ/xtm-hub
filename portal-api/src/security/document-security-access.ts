import { Knex } from 'knex';
import { PortalContext } from '../model/portal-context';
import { GenericServiceCapabilityNames } from '../modules/user_service/service-capability/generic_service_capability.const';
export const setQueryForDocument = <T>(
  context: PortalContext,
  queryContext: Knex.QueryBuilder<T>
): Knex.QueryBuilder<T> => {
  queryContext
    .innerJoin('Subscription as securitySubscription', function () {
      this.onVal(
        'securitySubscription.service_instance_id',
        '=',
        context.serviceInstanceId
      );
    })
    .innerJoin('User_Service as securityUserService', function () {
      this.on(
        'securityUserService.subscription_id',
        '=',
        'securitySubscription.id'
      ).andOnVal('securityUserService.user_id', '=', context?.user?.id);
    })
    .innerJoin(
      'UserService_Capability as securityUserServiceCapability',
      function () {
        this.on(
          'securityUserServiceCapability.user_service_id',
          '=',
          'securityUserService.id'
        ).andOnVal('securityUserService.user_id', '=', context?.user?.id);
      }
    )
    .innerJoin(
      'Generic_Service_Capability as securityServiceCapability',
      function () {
        this.on(
          'securityUserServiceCapability.id',
          '=',
          'securityUserServiceCapability.generic_service_capability_id'
        ).andOnVal(
          'securityServiceCapability.name',
          '=',
          GenericServiceCapabilityNames.AccessName
        );
      }
    );
  return queryContext;
};
