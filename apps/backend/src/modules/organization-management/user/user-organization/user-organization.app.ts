import {
  AddUserInput,
  User as GraphqlUser,
  OrganizationCapability,
} from '../../../../__generated__/resolvers-types';
import portalConfig from '../../../../config';
import { withTransaction } from '../../../../context/database.context';
import { requestContext } from '../../../../context/request.context';
import { OrganizationId } from '../../../../model/kanel/public/Organization';
import { UserId } from '../../../../model/kanel/public/User';
import { UserLoadUserBy } from '../../../../model/user';
import { dispatch } from '../../../../pub';
import { isUserAdminPlatform } from '../../../../security/access';
import { securityGuard } from '../../../../security/guard';
import { sendMail } from '../../../../server/mail-service';
import { logApp } from '../../../../utils/app-logger.util';
import { ErrorCode } from '../../../../utils/error/error.code';
import { ForbiddenAccess } from '../../../../utils/error/error.util';
import { formatName } from '../../../../utils/format';
import { OrganizationDomain } from '../../organization/organization.domain';
import { UserDomain } from '../user-domain/user.domain';
import { UserOrganizationPendingDomain } from '../user-pending/user-organization-pending.domain';
import { createUserWithPersonalSpace } from '../user.helper';
import { UserOrganizationDomain } from './user-organization.domain';

export const UserOrganizationApp = {
  addUserToOrganization: async (
    input: AddUserInput
  ): Promise<UserLoadUserBy> => {
    const { user: contextUser } = requestContext.require();
    const [organizationFromEmail] =
      await OrganizationDomain.loadOrganizationsFromEmail(input.email);

    const chosenOrganization = await OrganizationDomain.loadOrganizationBy({
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

    const [existingUser] = await UserDomain.loadUser({ email: input.email });

    const user = await withTransaction(async () => {
      const user = existingUser
        ? existingUser
        : await createUserWithPersonalSpace({
            email: input.email,
            password: input.password ?? undefined,
            selected_organization_id: chosenOrganization.id,
          });

      await UserOrganizationDomain.createUserOrgCapabilities({
        user,
        organization: chosenOrganization,
        orgCapabilities: input.capabilities ?? [],
        userExists: !!existingUser,
      });

      const userIsDeletedFromPendingList =
        await UserOrganizationDomain.removeUserFromPendingList({
          user_id: user.id,
          organization_id: chosenOrganization.id,
        });

      if (userIsDeletedFromPendingList.length > 0) {
        const userPendingPayload: GraphqlUser = {
          ...user,
          pending_organization_id: chosenOrganization.id,
        };
        await dispatch('UserPending', 'delete', userPendingPayload, 'User');
      }

      return user;
    });

    return UserDomain.loadUserBy({
      'User.id': user.id,
    });
  },
  changeSelectedOrganization: async (
    organization_id: OrganizationId
  ): Promise<UserLoadUserBy> => {
    const { user } = requestContext.require();

    await securityGuard.assertUserIsInOrganization(user, organization_id);

    const updatedUser = await UserDomain.updateUser(user.id, {
      selected_organization_id: organization_id,
    });
    const updatedUserLoadUserBy = await UserDomain.loadUserBy({
      'User.id': updatedUser.id,
    });
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

    await UserOrganizationDomain.removeUserFromOrganization(
      userId,
      organizationId
    );
    return UserDomain.loadUserBy({
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
    return UserDomain.loadUserBy({
      'User.id': userId,
    });
  },

  sendPendingUsersDigest: async (): Promise<void> => {
    if (!portalConfig.enabled_emails.pending_user_digest) {
      logApp.info('Pending user digest email disabled.');
      return;
    }

    const cleanupPendingUser =
      await UserOrganizationPendingDomain.cleanupPendingUsers();

    if (cleanupPendingUser.totalDeleted > 0) {
      logApp.error(
        `[Cleanup] Removed ${cleanupPendingUser.totalDeleted} User_Organization_Pending records matching existing User_Organization entries`,
        cleanupPendingUser
      );
    }

    const organizationsWithPendingUsers =
      await UserOrganizationPendingDomain.loadOrganizationsWithPendingUsers();

    const promises = organizationsWithPendingUsers.map(async (organization) => {
      try {
        const adminUsers =
          await UserDomain.loadUsersByCapabilitiesInOrganization(
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
                users: organization.users
                  .sort((a, b) => a.first_name.localeCompare(b.first_name))
                  .map(({ first_name, last_name, email }) => ({
                    firstName: formatName(first_name),
                    lastName: formatName(last_name),
                    email,
                  })),
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
