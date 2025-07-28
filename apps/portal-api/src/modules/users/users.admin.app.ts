import { AdminEditUserInput } from '../../__generated__/resolvers-types';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { UserId } from '../../model/kanel/public/User';
import { PortalContext } from '../../model/portal-context';
import { dispatch } from '../../pub';
import { updateUserSession } from '../../sessionStoreManager';
import { auth0Client } from '../../thirdparty/auth0/client';
import { logApp } from '../../utils/app-logger.util';
import { extractId } from '../../utils/utils';
import { updateMultipleUserOrgWithCapabilities } from '../common/user-organization.domain';
import { loadUserDetails, updateUser } from './users.domain';
import {
  mapUserToGraphqlUser,
  preventAdministratorRemovalOfAllOrganizations,
} from './users.helper';

export const usersAdminApp = {
  editUser: async (
    context: PortalContext,
    { userId, input }: { userId: UserId; input: AdminEditUserInput }
  ) => {
    const { organization_capabilities, ...userInput } = input;
    const mappedCapabilities = (organization_capabilities ?? []).map(
      (orgCapability) => ({
        organizationId: extractId<OrganizationId>(
          orgCapability.organization_id
        ),
        capabilities: orgCapability.capabilities,
      })
    );
    if (!input.disabled) {
      await preventAdministratorRemovalOfAllOrganizations(
        context,
        userId,
        mappedCapabilities
      );
    }
    const updatedUser = await updateUser(context, userId, userInput);

    try {
      await auth0Client.updateUser({
        ...input,
        email: updatedUser.email,
      });
    } catch (err) {
      logApp.error(err);
    }

    await updateMultipleUserOrgWithCapabilities(
      context,
      userId,
      organization_capabilities
    );
    const user = await loadUserDetails({
      'User.id': userId,
    });
    updateUserSession(user);

    const userMapped = mapUserToGraphqlUser(user);

    await dispatch('User', 'edit', user);
    await dispatch('MeUser', 'edit', userMapped, 'User');

    if (input.disabled) {
      await dispatch('User', 'delete', updatedUser);
      await dispatch('MeUser', 'delete', updatedUser, 'User');
    }

    return user;
  },
};
