import { Knex } from 'knex';
import { dbTx } from '../../../knexfile';
import { EditMeUserInput } from '../../__generated__/resolvers-types';
import Organization, {
  OrganizationId,
} from '../../model/kanel/public/Organization';
import User from '../../model/kanel/public/User';
import { PortalContext } from '../../model/portal-context';
import { dispatch } from '../../pub';
import { updateUserSession } from '../../sessionStoreManager';
import { auth0Client } from '../../thirdparty/auth0/client';
import { logApp } from '../../utils/app-logger.util';
import { ForbiddenAccess } from '../../utils/error.util';
import { isImgUrl } from '../../utils/utils';
import { ErrorCode } from '../common/error-code';
import { insertNewUserOrganizationPendingUnsecure } from '../common/user-organization-pending.domain';
import { removeUserFromOrganization } from '../common/user-organization.domain';
import {
  loadOrganizationsFromEmail,
  updateOrganization,
} from '../organizations/organizations.helper';
import { loadSubscriptionBy } from '../subcription/subscription.domain';
import { deleteUserServiceBy } from '../user_service/user_service.domain';
import {
  loadOrganizationAdministrators,
  loadUserDetails,
  updateUser,
} from './users.domain';
import { mapUserToGraphqlUser } from './users.helper';

const switchUserOnPersonalSpace = async (
  context,
  trx: Knex.Transaction,
  personalSpace: Organization
) => {
  const newUser = await updateUser(
    context,
    context.user.id,
    {
      selected_organization_id: personalSpace.id as OrganizationId,
    },
    trx
  );
  context.req.session.user = newUser;
};

const changeUserOrganization = async (
  context: PortalContext,
  trx: Knex.Transaction,
  newEmail: string,
  user: User
) => {
  const adminOrgas = await loadOrganizationAdministrators(
    context,
    context.user.selected_organization_id
  );
  if (adminOrgas.length === 1) {
    // No admin will left in the organization.
    throw ForbiddenAccess('NO_ADMIN_LEFT');
  }

  // Remove all user services linked to organization
  const [oldOrganization] = await loadOrganizationsFromEmail(
    context.user.email
  );
  const [newOrganization] = await loadOrganizationsFromEmail(newEmail);

  const organizationSubscriptions = await loadSubscriptionBy(context, {
    organization_id: oldOrganization.id,
  });
  await deleteUserServiceBy(
    context,
    {
      subscription_id: organizationSubscriptions.id,
    },
    trx
  );

  // Remove from old orga
  await removeUserFromOrganization(context, user.id, oldOrganization.id, trx);
  // Add user into orga_pending
  await insertNewUserOrganizationPendingUnsecure(
    {
      user_id: user.id,
      organization_id: newOrganization.id,
    },
    trx
  );
};

export const usersProfileApp = {
  editMeUser: async (context, input: EditMeUserInput) => {
    if (input.picture) {
      const isPictureImgUrl = await isImgUrl(input.picture);
      if (!isPictureImgUrl) {
        throw ErrorCode.InvalidImageUrl;
      }
    }

    const updatedUser = await updateUser(context, context.user.id, input);

    try {
      await auth0Client.updateUser({
        ...input,
        email: updatedUser.email,
      });
    } catch (err) {
      logApp.error(err);
    }

    const user = await loadUserDetails({
      'User.id': context.user.id,
    });

    updateUserSession(user);

    const mappedUser = mapUserToGraphqlUser(user);
    await dispatch('User', 'edit', mappedUser);

    return mappedUser;
  },
  editMeUserEmail: async (context, newEmail: string) => {
    const trx = await dbTx();
    const newDomainName = newEmail.split('@')[1];
    const oldDomainName = context.user.email.split('@')[1];
    const isUserChangingDomain = newDomainName !== oldDomainName;

    try {
      await updateUser(context, context.user.id, { email: newEmail }, trx);
      const user = await loadUserDetails({
        'User.id': context.user.id,
      });

      if (isUserChangingDomain) {
        await changeUserOrganization(context, trx, newEmail, user);
      }

      try {
        await auth0Client.updateUserEmail(newEmail, context.user.email);
      } catch (err) {
        logApp.error(err);
      }

      // Update personal space name
      const personalSpace = await updateOrganization(
        context,
        { name: context.user.email },
        { name: newEmail },
        trx
      );

      if (isUserChangingDomain) {
        await switchUserOnPersonalSpace(context, trx, personalSpace);
      }

      updateUserSession(user);

      const mappedUser = mapUserToGraphqlUser(user);

      await trx.commit();

      await dispatch('User', 'edit', mappedUser);

      return mappedUser;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  },
};
