import { ForbiddenAccess } from '@xtm-hub/error';
import { dbUnsecure } from '../../../../knexfile';
import {
  Restriction,
  ServiceCapability,
} from '../../../__generated__/resolvers-types';
import { ServiceCapabilityMutator } from '../../../model/kanel/public/ServiceCapability';
import { UserServiceId } from '../../../model/kanel/public/UserService';
import { PortalContext } from '../../../model/portal-context';
import { loadUserServiceById } from '../user_service.domain';
import { getManageAccessLeft } from './service-capability.domain';

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
  const manageAccessWillLeft = await getManageAccessLeft(
    context,
    userServiceId
  );
  const userService = await loadUserServiceById(context, userServiceId);
  // Needed if : the currentUser is the only one with manage access and want to update another user, without manage_access (from upload to delete for instance)
  const isCurrentUserModified = context.user.id === userService.user_id;
  const isAuthorizedToEditCapabilities =
    capabilities.includes(Restriction.ManageAccess) ||
    manageAccessWillLeft ||
    !isCurrentUserModified;
  if (!isAuthorizedToEditCapabilities) {
    throw ForbiddenAccess('EDIT_CAPABILITIES_CANT_REMOVE_LAST_MANAGE_ACCESS');
  }
  return;
};
