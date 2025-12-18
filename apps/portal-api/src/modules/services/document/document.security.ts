import { ServiceRestriction } from '../../../__generated__/resolvers-types';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { UserLoadUserBy } from '../../../model/user';
import { isUserGranted } from '../../../security/access';
import { loadCapabilities } from '../../user_service/user-service-capability/user-service-capability.helper';
import { loadServiceDefinitionByServiceInstance } from '../service-instance.domain';

export const isUserRestrictedToActiveDocument = async (
  user: UserLoadUserBy,
  serviceInstanceId: ServiceInstanceId
) => {
  if (isUserGranted(user)) {
    return false;
  }

  const capabilities = await loadCapabilities(
    serviceInstanceId,
    user.id,
    user.selected_organization_id
  );
  const serviceDef =
    await loadServiceDefinitionByServiceInstance(serviceInstanceId);
  return (
    !capabilities?.includes(ServiceRestriction.Upload) &&
    ['opencti_custom_dashboards', 'opencti_integrations'].includes(
      serviceDef.identifier
    )
  );
};
