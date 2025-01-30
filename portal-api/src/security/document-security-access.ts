import { Knex } from 'knex';
import { PortalContext } from '../model/portal-context';
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
      'Generic_Service_Capability as securityServiceCapability',
      function () {
        this.on(
          'securityUserService.id',
          '=',
          'securityServiceCapability.user_service_id'
        ).andOnVal(
          'securityServiceCapability.service_capability_name',
          '=',
          'ACCESS_SERVICE'
        );
      }
    );
  return queryContext;
};
