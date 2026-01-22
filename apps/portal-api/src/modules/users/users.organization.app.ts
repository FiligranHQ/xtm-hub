import {
  AddUserInput,
  OrganizationCapability,
} from '../../__generated__/resolvers-types';
import portalConfig from '../../config';
import { withTransaction } from '../../context/database.context';
import { requestContext } from '../../context/request.context';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { UserId } from '../../model/kanel/public/User';
import { UserLoadUserBy } from '../../model/user';
import { isUserAdminPlatform } from '../../security/access';
import { sendMail } from '../../server/mail-service';
import { logApp } from '../../utils/app-logger.util';
import { ErrorCode } from '../../utils/error/error.code';
import { ForbiddenAccess } from '../../utils/error/error.util';
import { formatName } from '../../utils/format';
import {
  createUserOrgCapabilities,
  removeUserFromOrganization,
} from '../common/user-organization.domain';
import { loadOrganizationBy } from '../organizations/organizations.domain';
import { loadOrganizationsFromEmail } from '../organizations/organizations.helper';
import { UserOrganizationPendingDomain } from './users-pending/user-organization-pending.domain';
import {
  loadUser,
  loadUserBy,
  loadUsersByCapabilitiesInOrganization,
  updateUser,
} from './users.domain';
import { createUserWithPersonalSpace } from './users.helper';

export const UsersOrganizationApp = {
  addUserToOrganization: async (
    input: AddUserInput
  ): Promise<UserLoadUserBy> => {
    const { user: contextUser } = requestContext.require();
    const [organizationFromEmail] = await loadOrganizationsFromEmail(
      input.email
    );

    const chosenOrganization = await loadOrganizationBy({
      id: contextUser.selected_organization_id,
    });

    if (chosenOrganization.personal_space) {
      logApp.warn('You cannot add a user in your personal space');
      throw new Error(ErrorCode.CantAddUserToPersonalSpace);
    }

    // The admin orga should only allow to add users in the same organization and with the same domain.
    // Only the admin PLTFM can by pass this check
    const isEmailOutsideOrganization =
      chosenOrganization.id !== organizationFromEmail?.id;
    if (isEmailOutsideOrganization && !isUserAdminPlatform(contextUser)) {
      logApp.warn(
        'You cannot add a user whose email domain is outside your organization'
      );
      throw ForbiddenAccess(ErrorCode.EmailOutsideOrganizationError);
    }

    const [existingUser] = await loadUser({ email: input.email });

    const user = await withTransaction(async () => {
      const user = existingUser
        ? existingUser
        : await createUserWithPersonalSpace({
            email: input.email,
            password: input.password,
            selected_organization_id: chosenOrganization.id,
          });

      await createUserOrgCapabilities({
        user,
        organization: chosenOrganization,
        orgCapabilities: input.capabilities ?? [],
        userExists: !!existingUser,
      });

      return user;
    });

    return loadUserBy({
      'User.id': user.id,
    });
  },
  changeSelectedOrganization: async (
    organization_id: OrganizationId
  ): Promise<UserLoadUserBy> => {
    const { user, portalContext } = requestContext.require();
    const updatedUser = await updateUser(user.id, {
      selected_organization_id: organization_id,
    });
    const updatedUserLoadUserBy = await loadUserBy({
      'User.id': updatedUser.id,
    });
    portalContext.req.session.user = updatedUserLoadUserBy;
    requestContext.update({ user: updatedUserLoadUserBy });

    return updatedUserLoadUserBy;
  },

  removeUserFromOrganization: async ({
    userId,
    organizationId,
  }: {
    userId: UserId;
    organizationId: OrganizationId;
  }): Promise<UserLoadUserBy> => {
    const { user } = requestContext.require();
    if (userId === user.id) {
      throw new Error(ErrorCode.CantRemoveYourselfFromOrgaError);
    }

    await removeUserFromOrganization(userId, organizationId);
    return loadUserBy({
      'User.id': userId,
    });
  },

  removePendingUserFromOrganization: async ({
    userId,
    organizationId,
  }: {
    userId: UserId;
    organizationId: OrganizationId;
  }): Promise<UserLoadUserBy> => {
    await UserOrganizationPendingDomain.removeUserFromOrganizationPending(
      userId,
      organizationId
    );
    return loadUserBy({
      'User.id': userId,
    });
  },

  sendPendingUsersDigest: async (): Promise<void> => {
    if (!portalConfig.enabled_emails.pending_user_digest) {
      logApp.info('Pending user digest email disabled.');
      return;
    }

    const organizationsWithPendingUsers =
      await UserOrganizationPendingDomain.loadOrganizationsWithPendingUsers();
    const promises = organizationsWithPendingUsers.map(async (organization) => {
      try {
        const adminUsers = await loadUsersByCapabilitiesInOrganization(
          organization.id,
          [OrganizationCapability.AdministrateOrganization]
        );

        return await Promise.all(
          adminUsers.map((adminUser) =>
            sendMail({
              to: adminUser.email,
              template: 'organization_pending_user_digest',
              params: {
                adminName: formatName(adminUser.first_name ?? ''),
                organizationName: organization.name,
                userEmailList: organization.users
                  .sort((a, b) => a.first_name.localeCompare(b.first_name))
                  .map(
                    ({ first_name, last_name, email }) =>
                      `<li>${formatName(first_name)} ${formatName(last_name)} (${email})</li>`
                  )
                  .join(''),
                userCount: organization.users.length,
                requestLabel:
                  organization.users.length === 1 ? 'request' : 'requests',
              },
            })
          )
        );
      } catch (error) {
        logApp.error(
          `An error occurred while sending pending user digest to ${organization.name}`,
          { error }
        );
      }
    });

    await Promise.all(promises);
  },
};
