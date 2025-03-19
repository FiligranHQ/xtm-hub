import { dbUnsecure } from '../../../../knexfile';
import { ServiceCapability } from '../../../__generated__/resolvers-types';
import { ServiceCapabilityMutator } from '../../../model/kanel/public/ServiceCapability';
import { UserServiceId } from '../../../model/kanel/public/UserService';
import { PortalContext } from '../../../model/portal-context';
import { ForbiddenAccess } from '../../../utils/error.util';
import {
  getUserServiceCapabilities,
  loadUserServiceBy,
  loadUserServiceById,
} from '../user_service.domain';

export const loadServiceCapabilityBy = async (
  field: ServiceCapabilityMutator
) => {
  return dbUnsecure<ServiceCapability>('Service_Capability').where(field);
};

export const willManageAccessBeConserved = async (
  context: PortalContext,
  userServiceId: UserServiceId,
  capabilities: string[]
) => {
  const manageAccessCount = await getManageAccessCount(context, userServiceId);
  const isCurrentUserManageAccess = await currentUserIsManageAccess(
    context,
    userServiceId
  );

  const isAuthorizedToEditCapabilities = calculateShouldEditCapabilities(
    isCurrentUserManageAccess,
    capabilities,
    manageAccessCount
  );
  if (!isAuthorizedToEditCapabilities) {
    throw ForbiddenAccess('EDIT_CAPABILITIES_CANT_REMOVE_LAST_MANAGE_ACCESS');
  }

  return;
};

export const calculateShouldEditCapabilities = (
  isCurrentUserManageAccess: boolean,
  capabilities: string[],
  manageAccessCount: number
) => {
  if (!isCurrentUserManageAccess || capabilities.includes('MANAGE_ACCESS')) {
    return true;
  }

  return manageAccessCount !== 1;
};

const getManageAccessCount = async (
  context: PortalContext,
  userServiceId: UserServiceId
) => {
  const userService = await loadUserServiceById(context, userServiceId);
  const allUserServices = await loadUserServiceBy(context, {
    subscription_id: userService.subscription_id,
  });

  const manageAccessCount = await Promise.all(
    allUserServices.map(async ({ id }) => {
      const capabilities = await getUserServiceCapabilities(context, id);
      return capabilities?.some(
        (capa) => capa.generic_service_capability?.name === 'MANAGE_ACCESS'
      );
    })
  );

  return manageAccessCount.reduce(
    (acc, hasManageAccess) => acc + (hasManageAccess ? 1 : 0),
    0
  );
};

const currentUserIsManageAccess = async (
  context: PortalContext,
  userServiceId: UserServiceId
) => {
  const capabilities = await getUserServiceCapabilities(context, userServiceId);
  return capabilities?.some(
    (capa) => capa?.generic_service_capability?.name === 'MANAGE_ACCESS'
  );
};
