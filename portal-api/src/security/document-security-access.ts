import { Knex } from 'knex';
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
          (serviceDef.identifier === 'custom_dashboards' ||
            serviceDef.identifier === 'csv_feed')
        ) {
          queryContext.where('Document.active', '=', 'true');
        }
      }
    );
  });

  queryContext
    .leftJoin(
      'ServiceInstance as securityServiceInstance',
      'securityServiceInstance.id',
      'Document.service_instance_id'
    )
    .leftJoin(
      'Subscription as securitySubscription',
      'securitySubscription.service_instance_id',
      'securityServiceInstance.id'
    )
    .leftJoin(
      'User_Service as securityUserService',
      'securityUserService.subscription_id',
      'securitySubscription.id'
    )
    .where(
      'securitySubscription.organization_id',
      context?.user?.selected_organization_id
    )
    .where('securityUserService.user_id', context?.user?.id);

  return queryContext;
};
