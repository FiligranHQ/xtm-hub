import { db } from '../../../../knexfile';

import { requestContext } from '../../../context/request.context';
import { UserServiceId } from '../../../model/kanel/public/UserService';
import UserServiceCapability from '../../../model/kanel/public/UserServiceCapability';
import { ErrorCode } from '../../../utils/error/error.code';
import { UserServiceDomain } from '../../user-service/user-service.domain';
import { GenericServiceCapabilityName } from './generic-service-capability.const';
import { getManageAccessLeft } from './service-capability.domain';

export const insertServiceCapability = async (genericServiceCapabilityData) => {
  return db<UserServiceCapability>('UserService_Capability')
    .insert(genericServiceCapabilityData)
    .returning('*');
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
