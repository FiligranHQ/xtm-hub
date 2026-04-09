import { db } from '../../../../knexfile';
import { ServiceCapability } from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import { ServiceCapabilityMutator } from '../../../model/kanel/public/ServiceCapability';
import { UserServiceId } from '../../../model/kanel/public/UserService';
import { ErrorCode } from '../../../utils/error/error.code';
import { UserServiceDomain } from '../../user_service/user_service.domain';
import { GenericServiceCapabilityName } from './generic_service_capability.const';
import { getManageAccessLeft } from './service-capability.domain';

export const loadServiceCapabilityBy = async (
  field: ServiceCapabilityMutator
) => {
  return db<ServiceCapability>('Service_Capability').where(field);
};

export const willManageAccessBeConserved = async (
  userServiceId: UserServiceId,
  capabilities: string[]
) => {
  const { user } = requestContext.require();
  const manageAccessWillLeft = await getManageAccessLeft(userServiceId);
  const userService =
    await UserServiceDomain.loadUserServiceById(userServiceId);
  // Needed if : the currentUser is the only one with manage access and want to update another user, without manage_access (from upload to delete for instance)
  const isCurrentUserModified = user.id === userService.user_id;
  const isAuthorizedToEditCapabilities =
    capabilities.includes(GenericServiceCapabilityName.MANAGE_ACCESS) ||
    manageAccessWillLeft ||
    !isCurrentUserModified;
  if (!isAuthorizedToEditCapabilities) {
    throw new Error(ErrorCode.EditCapabilitiesCantRemoveLastManageAccess);
  }
  return;
};
