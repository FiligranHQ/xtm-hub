import { db } from '../../../../knexfile';

import { ServiceRestriction } from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import { UserServiceId } from '../../../model/kanel/public/UserService';
import UserServiceCapability, {
  UserServiceCapabilityInitializer,
} from '../../../model/kanel/public/UserServiceCapability';
import { ErrorCode } from '../../../utils/error/error.code';
import { UserServiceDomain } from '../../user-service/user-service.domain';
import { ServiceCapabilityDomain } from './service-capability.domain';

export const ServiceCapabilityHelper = {
  insertServiceCapability: async (
    genericServiceCapabilityData: UserServiceCapabilityInitializer[]
  ) => {
    return db<UserServiceCapability>('UserService_Capability')
      .insert(genericServiceCapabilityData)
      .returning('*');
  },

  willManageAccessBeConserved: async (
    userServiceId: UserServiceId,
    capabilities: string[]
  ) => {
    const user = requestContext.requireUser();
    const manageAccessWillLeft =
      await ServiceCapabilityDomain.getManageAccessLeft(userServiceId);
    const userService =
      await UserServiceDomain.loadUserServiceById(userServiceId);
    // Needed if : the currentUser is the only one with manage access and want to update another user, without manage_access (from upload to delete for instance)
    const isCurrentUserModified = user.id === userService.user_id;
    const isAuthorizedToEditCapabilities =
      capabilities.includes(ServiceRestriction.ManageAccess) ||
      manageAccessWillLeft ||
      !isCurrentUserModified;
    if (!isAuthorizedToEditCapabilities) {
      throw new Error(ErrorCode.EditCapabilitiesCantRemoveLastManageAccess);
    }
    return;
  },
};
