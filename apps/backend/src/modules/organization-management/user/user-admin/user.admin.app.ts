import {
  AdminAddUserInput,
  AdminEditUserInput,
  EditUserCapabilitiesInput,
  Filter,
  OrganizationCapability,
} from '../../../../__generated__/resolvers-types';
import { withTransaction } from '../../../../context/database.context';
import { requestContext } from '../../../../context/request.context';
import { OrganizationId } from '../../../../model/kanel/public/Organization';
import { UserId } from '../../../../model/kanel/public/User';
import { UserLoadUserBy } from '../../../../model/user';
import { dispatch } from '../../../../pub';
import { isUserAdminPlatform } from '../../../../security/access';
import { securityGuard } from '../../../../security/guard';
import { updateUserSession } from '../../../../session-store-manager';
import { auth0Client } from '../../../../thirdparty/auth0/client';
import { logApp } from '../../../../utils/app-logger.util';
import { toError } from '../../../../utils/error/error-guard.util';
import { ErrorCode } from '../../../../utils/error/error.code';
import { ForbiddenAccess } from '../../../../utils/error/error.util';
import { stripNulls } from '../../../../utils/typescript';
import { OrganizationDomain } from '../../organization/organization.domain';
import { UserDomain } from '../user-domain/user.domain';
import { UserOrganizationDomain } from '../user-organization/user-organization.domain';
import { UserOrganizationPendingDomain } from '../user-pending/user-organization-pending.domain';
import {
  acceptPendingUserWithCapabilities,
  createUserWithPersonalSpace,
  mapUserToGraphqlUser,
  preventAdministratorRemovalOfAllOrganizations,
  preventAdministratorRemovalOfOneOrganization,
  updateUserOrgCapabilitiesAndDispatch,
} from '../user.helper';

export const UserAdminApp = {
  addUser: async (input: AdminAddUserInput): Promise<UserLoadUserBy> => {
    const contextUser = requestContext.requireUser();
    const [organizationFromEmail] =
      await OrganizationDomain.loadOrganizationsFromEmail(input.email);
    // In most of the case there will be only one organization in the list, but in case where the scenario is an admin pltfm it can be multiple or none
    const chosenOrganizationId: OrganizationId | undefined = input
      .organization_capabilities?.[0]
      ? input.organization_capabilities?.[0].organization_id
      : undefined;

    // The admin orga should only allow to add users in the same organization and with the same domain.
    // Only the admin PLTFM can by pass this check
    const isEmailOutsideOrganization =
      chosenOrganizationId !== organizationFromEmail?.id;

    if (isEmailOutsideOrganization && !isUserAdminPlatform(contextUser)) {
      logApp.warn(
        'You cannot add a user whose email domain is outside your organization'
      );
      throw new Error(ErrorCode.EmailOutsideOrganizationError);
    }

    const [existingUser] = await UserDomain.loadUser({ email: input.email });

    const finalUser = await withTransaction(async () => {
      const user = existingUser
        ? existingUser
        : await createUserWithPersonalSpace({
            email: input.email,
            password: input.password,
            first_name: input.first_name,
            last_name: input.last_name,
            selected_organization_id: chosenOrganizationId,
          });

      await UserOrganizationDomain.updateMultipleUserOrgWithCapabilities(
        user.id,
        input.organization_capabilities
      );

      return await UserDomain.loadUserBy({
        'User.id': user.id,
      });
    });

    if (!finalUser) {
      throw new Error(ErrorCode.UserNotFound);
    }

    await dispatch('User', 'add', finalUser);

    return finalUser;
  },
  editUser: async ({
    userId,
    input,
  }: {
    userId: UserId;
    input: AdminEditUserInput;
  }) => {
    const contextUser = requestContext.requireUser();
    if (!isUserAdminPlatform(contextUser)) {
      await securityGuard.assertUserCapabilities(
        [
          OrganizationCapability.AdministrateOrganization,
          OrganizationCapability.ManageAccess,
        ],
        contextUser.selected_organization_id
      );
      const targetUser = await UserDomain.loadUserBy({ 'User.id': userId });
      if (!targetUser) {
        throw new Error(ErrorCode.UserNotFound);
      }
      await securityGuard.assertUserIsInOrganization(
        targetUser,
        contextUser.selected_organization_id
      );

      const unauthorizedOrg = (input.organization_capabilities ?? []).find(
        (orgCapa) =>
          orgCapa.organization_id !== contextUser.selected_organization_id
      );
      if (unauthorizedOrg) {
        throw ForbiddenAccess(ErrorCode.MissingCapabilityOnOrganization);
      }
    }
    const { organization_capabilities, ...userInput } = input;
    const mappedCapabilities = (organization_capabilities ?? []).map(
      (orgCapability) => ({
        organizationId: orgCapability.organization_id,
        capabilities: orgCapability.capabilities,
      })
    );
    if (!input.disabled) {
      await preventAdministratorRemovalOfAllOrganizations(
        userId,
        mappedCapabilities
      );
    }
    const updatedUser = await UserDomain.updateUser(
      userId,
      stripNulls(userInput)
    );
    if (updatedUser) {
      try {
        await auth0Client.updateUser({
          ...stripNulls(input),
          email: updatedUser.email,
        });
      } catch (err) {
        logApp.error(toError(err));
      }
    }
    await UserOrganizationDomain.updateMultipleUserOrgWithCapabilities(
      userId,
      organization_capabilities
    );
    const user = await UserDomain.loadUserDetails({
      'User.id': userId,
    });
    updateUserSession(user);

    const userMapped = mapUserToGraphqlUser(user);

    await dispatch('User', 'edit', user);
    await dispatch('MeUser', 'edit', userMapped, 'User');

    if (updatedUser && input.disabled) {
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
    const user = requestContext.requireUser();
    const organizationId = user.selected_organization_id;
    await preventAdministratorRemovalOfOneOrganization(
      userId,
      organizationId,
      input.capabilities
    );

    const [userOrganization] =
      await UserOrganizationDomain.loadUserOrganization({
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

  bulkAcceptPendingUserInOrganization: async (
    organizationId: OrganizationId,
    ids: UserId[],
    searchTerm: string | undefined,
    filters: Filter[],
    excludedIds: UserId[]
  ) => {
    await securityGuard.assertUserCapabilities(
      [
        OrganizationCapability.AdministrateOrganization,
        OrganizationCapability.ManageAccess,
      ],
      organizationId
    );

    const userIds =
      await UserOrganizationPendingDomain.bulkLoadUserIdsFromOrganizationPending(
        organizationId,
        ids,
        searchTerm,
        filters,
        excludedIds
      );

    await Promise.all(
      userIds.map(async (userId: UserId) => {
        try {
          await acceptPendingUserWithCapabilities({
            user_id: userId,
            organization_id: organizationId,
            orgCapabilities: [],
          });
        } catch (error) {
          logApp.error('Error while accepting user in organization', {
            error,
            userId,
            organizationId,
          });
        }
      })
    );
  },

  bulkRemovePendingUserFromOrganization: async (
    organizationId: OrganizationId,
    ids: UserId[],
    searchTerm: string | undefined,
    filters: Filter[],
    excludedIds: UserId[]
  ) => {
    await securityGuard.assertUserCapabilities(
      [
        OrganizationCapability.AdministrateOrganization,
        OrganizationCapability.ManageAccess,
      ],
      organizationId
    );

    await UserOrganizationPendingDomain.bulkRemoveUserFromOrganizationPending(
      organizationId,
      ids,
      searchTerm,
      filters,
      excludedIds
    );
    await dispatch('UserPending', 'invalidate', {
      id: organizationId,
    });
  },
};
