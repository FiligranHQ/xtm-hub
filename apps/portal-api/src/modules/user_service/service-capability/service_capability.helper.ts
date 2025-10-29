import { dbUnsecure } from '../../../../knexfile';
import {
  Restriction,
  ServiceCapability,
} from '../../../__generated__/resolvers-types';
import { ServiceCapabilityMutator } from '../../../model/kanel/public/ServiceCapability';
import { UserServiceId } from '../../../model/kanel/public/UserService';
import { requestContext } from '../../../requestContext';
import { ErrorCode } from '../../../utils/error/error.code';
import { loadUserServiceById } from '../user_service.domain';
import { getManageAccessLeft } from './service-capability.domain';

export const loadServiceCapabilityBy = async (
  field: ServiceCapabilityMutator
) => {
  return dbUnsecure<ServiceCapability>('Service_Capability').where(field);
};

export const willManageAccessBeConserved = async (
  userServiceId: UserServiceId,
  capabilities: string[]
) => {
  const { user } = requestContext.require();
  const manageAccessWillLeft = await getManageAccessLeft(userServiceId);
  const userService = await loadUserServiceById(userServiceId);
  // Needed if : the currentUser is the only one with manage access and want to update another user, without manage_access (from upload to delete for instance)
  const isCurrentUserModified = user.id === userService.user_id;
  const isAuthorizedToEditCapabilities =
    capabilities.includes(Restriction.ManageAccess) ||
    manageAccessWillLeft ||
    !isCurrentUserModified;
  if (!isAuthorizedToEditCapabilities) {
    throw new Error(ErrorCode.EditCapabilitiesCantRemoveLastManageAccess);
  }
  return;
};
