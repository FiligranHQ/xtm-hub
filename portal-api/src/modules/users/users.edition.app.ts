import { dbTx } from '../../../knexfile';
import {
  AdminEditUserInput,
  EditMeUserInput,
  EditUserInput,
} from '../../__generated__/resolvers-types';
import User, { UserId } from '../../model/kanel/public/User';
import { PortalContext } from '../../model/portal-context';
import { UserWithOrganizationsAndRole } from '../../model/user';
import { dispatch } from '../../pub';
import { updateUserSession } from '../../sessionStoreManager';
import { auth0Client } from '../../thirdparty/auth0/client';
import {
  updateMultipleUserOrgWithCapabilities,
  updateUserOrgCapabilities,
} from '../common/user-organization.domain';
import { loadUserDetails, updateUser } from './users.domain';
import { mapUserToGraphqlUser } from './users.helper';

export const usersEditionApp = {
  adminEditUser: async (
    context: PortalContext,
    id: UserId,
    input: AdminEditUserInput
  ): Promise<UserWithOrganizationsAndRole> => {
    const tx = await dbTx();
    const { organization_capabilities, ...userInput } = input;
    try {
      const updatedUser = await updateUser(context, id, userInput);
      await updateMultipleUserOrgWithCapabilities(
        context,
        id,
        organization_capabilities
      );

      if (updatedUser) {
        await auth0Client.updateUser({
          ...input,
          email: updatedUser.email,
        });
      }
    } catch (err) {
      await tx.rollback();
      throw err;
    }

    return loadUserDetails({
      'User.id': id,
    });
  },
  editUser: async (
    context: PortalContext,
    id: UserId,
    input: EditUserInput
  ): Promise<UserWithOrganizationsAndRole> => {
    const tx = await dbTx();
    const { capabilities, ...userInput } = input;
    try {
      const updatedUser = await updateUser(context, id, userInput, tx);
      await updateUserOrgCapabilities(context, {
        user_id: id,
        organization_id: context.user.selected_organization_id,
        orgCapabilities: capabilities,
      });

      if (updatedUser) {
        await auth0Client.updateUser({
          ...input,
          email: updatedUser.email,
        });
      }
    } catch (err) {
      await tx.rollback();
      throw err;
    }

    return loadUserDetails({
      'User.id': id,
    });
  },
  editMeUser: async (
    context: PortalContext,
    input: EditMeUserInput
  ): Promise<UserWithOrganizationsAndRole> => {
    const tx = await dbTx();
    try {
      const updatedUser = await updateUser(context, context.user.id, input, tx);

      if (updatedUser) {
        await auth0Client.updateUser({
          ...input,
          email: updatedUser.email,
        });
      }
    } catch (err) {
      await tx.rollback();
      throw err;
    }

    return loadUserDetails({
      'User.id': context.user.id,
    });
  },
  dispatchUserDeleted: async (user: User): Promise<void> => {
    await dispatch('User', 'delete', user);
    await dispatch('MeUser', 'delete', user, 'User');
  },
  dispatchUserUpdated: async (
    user: UserWithOrganizationsAndRole
  ): Promise<void> => {
    updateUserSession(user);

    await dispatch('User', 'edit', user);

    const userMapped = mapUserToGraphqlUser(user);
    await dispatch('MeUser', 'edit', userMapped, 'User');
  },
};
