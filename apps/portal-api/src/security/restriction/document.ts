import { dbRaw, KnexQueryBuilder } from '../../../knexfile';
import { requestContext } from '../../context/request.context';

export const restrictDocumentToActive = (qb: KnexQueryBuilder) => {
  return qb.where('Document.active', '=', 'true');
};

export const restrictDocumentToUserOrganization = (qb: KnexQueryBuilder) => {
  const { user } = requestContext.get();
  qb.leftJoin('ServiceInstance as securityServiceInstance', function () {
    this.on('securityServiceInstance.id', '=', 'Document.service_instance_id');
  })
    .leftJoin('Subscription as securitySubscription', function () {
      this.on(
        'securitySubscription.service_instance_id',
        '=',
        'securityServiceInstance.id'
      ).andOn(
        'securitySubscription.organization_id',
        '=',
        dbRaw('?', [user?.selected_organization_id])
      );
    })
    .leftJoin('User_Service as securityUserService', function () {
      this.on(
        'securityUserService.subscription_id',
        '=',
        'securitySubscription.id'
      ).andOn('securityUserService.user_id', '=', dbRaw('?', [user?.id]));
    });

  return qb;
};
