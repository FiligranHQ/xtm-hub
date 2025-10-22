import {
  AdminEditUserInput,
  EditUserCapabilitiesInput,
} from '../../__generated__/resolvers-types';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { UserId } from '../../model/kanel/public/User';
import { dispatch } from '../../pub';
import { requestContext } from '../../requestContext';
import { updateUserSession } from '../../session-store-manager';
import { auth0Client } from '../../thirdparty/auth0/client';
import { logApp } from '../../utils/app-logger.util';
import { extractId } from '../../utils/utils';
import {
  loadUserOrganization,
  updateMultipleUserOrgWithCapabilities,
} from '../common/user-organization.domain';
import { loadUserDetails, updateUser } from './users.domain';
import {
  acceptPendingUserWithCapabilities,
  mapUserToGraphqlUser,
  preventAdministratorRemovalOfAllOrganizations,
  preventAdministratorRemovalOfOneOrganization,
  updateUserOrgCapabilitiesAndDispatch,
} from './users.helper';

export const usersAdminApp = {
  editUser: async ({
    userId,
    input,
  }: {
    userId: UserId;
    input: AdminEditUserInput;
  }) => {
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
        userId,
        mappedCapabilities
      );
    }
    const updatedUser = await updateUser(userId, userInput);

    try {
      await auth0Client.updateUser({
        ...input,
        email: updatedUser.email,
      });
    } catch (err) {
      logApp.error(err);
    }
    await updateMultipleUserOrgWithCapabilities(
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

  editUserCapabilities: async ({
    userId,
    input,
  }: {
    userId: UserId;
    input: EditUserCapabilitiesInput;
  }) => {
    const { user } = requestContext.require();
    const organizationId = user.selected_organization_id;
    await preventAdministratorRemovalOfOneOrganization(
      userId,
      organizationId,
      input.capabilities
    );

    const [userOrganization] = await loadUserOrganization({
      user_id: userId,
      organization_id: organizationId,
    });

    return userOrganization
      ? await updateUserOrgCapabilitiesAndDispatch({
          user_id: userId,
          organization_id: organizationId,
          orgCapabilities: input.capabilities,
        })
      : await acceptPendingUserWithCapabilities({
          user_id: userId,
          organization_id: organizationId,
          orgCapabilities: input.capabilities,
        });
  },
};
