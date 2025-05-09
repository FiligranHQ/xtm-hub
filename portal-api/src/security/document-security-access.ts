import { Knex } from 'knex';
import { dbRaw } from '../../knexfile';
import { ServiceRestriction } from '../__generated__/resolvers-types';
import { PortalContext } from '../model/portal-context';
import { getServiceDefinition } from '../modules/services/service-instance.domain';
import { loadCapabilities } from '../modules/user_service/user-service-capability/user-service-capability.helper';
export const setQueryForDocument = <T>(
  context: PortalContext,
  queryContext: Knex.QueryBuilder<T>
): Knex.QueryBuilder<T> => {
  loadCapabilities(
    context,
    context.serviceInstanceId,
    context.user.id,
    context.user.selected_organization_id
  ).then((capabilities) => {
    return getServiceDefinition(context, context.serviceInstanceId).then(
      (serviceDef) => {
        if (
          !capabilities?.includes(ServiceRestriction.Upload) &&
          ['custom_dashboards', 'csv_feed'].includes(serviceDef.identifier)
        ) {
          queryContext.where('Document.active', '=', 'true');
        }
      }
    );
  });

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
      ).andOn(
        'securitySubscription.organization_id',
        '=',
        dbRaw('?', [context?.user?.selected_organization_id])
      );
    })
    .leftJoin('User_Service as securityUserService', function () {
      this.on(
        'securityUserService.subscription_id',
        '=',
        'securitySubscription.id'
      ).andOn(
        'securityUserService.user_id',
        '=',
        dbRaw('?', [context?.user?.id])
      );
    });

  return queryContext;
};
