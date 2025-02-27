import { Knex } from 'knex';
import { PortalContext } from '../model/portal-context';
export const setQueryForDocument = <T>(
  context: PortalContext,
  queryContext: Knex.QueryBuilder<T>
): Knex.QueryBuilder<T> => {
  queryContext
    .leftJoin('ServiceInstance as securityServiceInstance', function () {
      this.on(
        'securityServiceInstance.id',
        '=',
        'Document.service_instance_id'
      );
    })
    .leftJoin('Subscription as securitySubscription', function () {
      this.on(
        'securitySubscription.service_instance_id',
        '=',
        'securityServiceInstance.id'
      ).andOnVal(
        'securitySubscription.organization_id',
        '=',
        context?.user?.selected_organization_id
      );
    })
    .leftJoin('User_Service as securityUserService', function () {
      this.on(
        'securityUserService.subscription_id',
        '=',
        'securitySubscription.id'
      ).andOnVal('securityUserService.user_id', '=', context?.user?.id);
    });

  return queryContext;
};
