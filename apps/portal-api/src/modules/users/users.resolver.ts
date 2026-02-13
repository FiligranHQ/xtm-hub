import { fromGlobalId } from 'graphql-relay/node/node.js';
import {
  MergeEvent,
  Resolvers,
  User,
  UserPendingSubscription,
  UserSubscription,
} from '../../__generated__/resolvers-types';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { UserId } from '../../model/kanel/public/User';
import { dispatch, listen } from '../../pub';
import { hubspotReachOutSalesHook } from '../../thirdparty/hubspot/hubspot';
import { logApp } from '../../utils/app-logger.util';

import { requestContext } from '../../context/request.context';
import { UserTransferRequestId } from '../../model/kanel/public/UserTransferRequest';
import { PortalContext } from '../../model/portal-context';
import { ErrorCode, UnknownErrorCode } from '../../utils/error/error.code';
import { mapToGraphQLError } from '../../utils/error/error.mapping';
import { ForbiddenAccess } from '../../utils/error/error.util';
import { extractId } from '../../utils/utils';
import { UserOrganizationPendingDomain } from './users-pending/user-organization-pending.domain';
import { usersAdminApp } from './users.admin.app';
import { UsersAuthApp } from './users.auth.app';
import {
  getCapabilities,
  getOrganizations,
  getRolesPortal,
  loadUserConnection,
  loadUsersByCapabilitiesInOrganization,
  resetPassword,
  userHasOrganizationWithSubscription,
} from './users.domain';
import { mapUserToGraphqlUser } from './users.helper';
import { UsersOrganizationApp } from './users.organization.app';
import { usersProfileApp } from './users.profile.app';

const resolvers: Resolvers = {
  User: {
    organizations: ({ id }, _) => getOrganizations(id),
    capabilities: ({ id }, _) => getCapabilities(id),
    roles_portal: ({ id }, _) => getRolesPortal(id),
  },
  Query: {
    me: async (_, __, context) => {
      // User is not logged in
      if (!context.user) {
        return null;
      }
      return mapUserToGraphqlUser(context.user);
    },

    usersWithCapabilitiesInOrganization: async (_, { input }) => {
      return loadUsersByCapabilitiesInOrganization(
        fromGlobalId(input.organizationId).id,
        input.capabilities
      );
    },
    users: async (
      _,
      { first, after, orderMode, orderBy, searchTerm, filters }
    ) => {
      return loadUserConnection({
        first,
        after,
        orderMode,
        orderBy,
        filters,
        searchTerm,
      });
    },
    pendingUsers: async (
      _,
      { first, after, orderMode, orderBy, searchTerm, filters }
    ) => {
      return UserOrganizationPendingDomain.loadPendingUsers({
        first,
        after,
        orderMode,
        orderBy,
        filters,
        searchTerm,
      });
    },
    userHasOrganizationWithSubscription: async (_, __) => {
      return userHasOrganizationWithSubscription();
    },
  },
  Mutation: {
    // Api for testing merge event behavior
    mergeTest: async (_, { from, target }) => {
      const test: MergeEvent = { id: 'merge', from, target };
      await dispatch('User', 'merge', test);
      return from;
    },
    // Management
    addUser: async (_, { input }) => {
      try {
        const user = await UsersOrganizationApp.addUserToOrganization(input);

        await dispatch('User', 'add', user);

        return mapUserToGraphqlUser(user);
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.AddingUserError);
      }
    },

    // Admin
    adminAddUser: async (_, { input }) => {
      try {
        const user = await usersAdminApp.addUser(input);
        return mapUserToGraphqlUser(user);
      } catch (error) {
        if (error.message.includes(ErrorCode.UserDisabled)) {
          logApp.warn('You cannot add a user who is disabled in the plaform');
          throw ForbiddenAccess(ErrorCode.CantAddDisabledUser);
        }

        throw mapToGraphQLError(error, UnknownErrorCode.AddingUserError);
      }
    },
    editUserCapabilities: async (_, { id, input }) => {
      try {
        return await usersAdminApp.editUserCapabilities({
          userId: id as UserId,
          input,
        });
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.EditUserError);
      }
    },
    adminEditUser: async (_, { id, input }) => {
      try {
        return await usersAdminApp.editUser({
          userId: id as UserId,
          input,
        });
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.EditUserError);
      }
    },

    editMeUser: async (_, { input }, context) => {
      try {
        return await usersProfileApp.editMeUser(context.user, input);
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.EditMeUserError);
      }
    },
    resetPassword: async (_, __) => {
      await resetPassword();
      return { success: true };
    },
    requestTransferPersonalSpace: async (_, { new_email }, context) => {
      try {
        await usersProfileApp.requestTransferPersonalSpace(
          context.user,
          new_email
        );

        return { success: true };
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.TransferMeError);
      }
    },
    transferPersonalSpace: async (_, { requestId }) => {
      try {
        await usersProfileApp.transferPersonalSpace(
          requestId as UserTransferRequestId
        );

        return { success: true };
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.TransferMeError);
      }
    },
    changeSelectedOrganization: async (_, { organization_id }) => {
      try {
        const user = await UsersOrganizationApp.changeSelectedOrganization(
          extractId<OrganizationId>(organization_id)
        );

        return mapUserToGraphqlUser(user);
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
    removeUserFromOrganization: async (_, { user_id, organization_id }) => {
      try {
        const user = await UsersOrganizationApp.removeUserFromOrganization({
          userId: extractId<UserId>(user_id),
          organizationId: extractId<OrganizationId>(organization_id),
        });
        return mapUserToGraphqlUser(user);
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.RemoveUserFromOrgaError
        );
      }
    },
    bulkRemovePendingUserFromOrganization: async (
      _,
      { input },
      context: PortalContext
    ) => {
      try {
        const { ids, searchTerm, filters, excludedIds } = input;
        const extractedIds = ids.map(extractId<UserId>);
        const extractedExcludedIds = excludedIds.map(extractId<UserId>);
        await usersAdminApp.bulkRemovePendingUserFromOrganization(
          context.user.selected_organization_id,
          extractedIds,
          searchTerm,
          filters,
          extractedExcludedIds
        );

        return { success: true };
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.RemoveUserFromPendingOrgaError
        );
      }
    },
    bulkAcceptPendingUserInOrganization: async (
      _,
      { input },
      context: PortalContext
    ) => {
      try {
        const { ids, searchTerm, filters, excludedIds } = input;
        const extractedIds = ids.map(extractId<UserId>);
        const extractedExcludedIds = excludedIds.map(extractId<UserId>);

        await usersAdminApp.bulkAcceptPendingUserInOrganization(
          context.user.selected_organization_id,
          extractedIds,
          searchTerm,
          filters,
          extractedExcludedIds
        );
        return { success: true };
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.AcceptUserInPendingOrgaError
        );
      }
    },
    removePendingUserFromOrganization: async (
      _,
      { user_id, organization_id }
    ) => {
      try {
        const organizationId = extractId<OrganizationId>(organization_id);
        const user =
          await UsersOrganizationApp.removePendingUserFromOrganization({
            userId: extractId<UserId>(user_id),
            organizationId,
          });

        const graphQLUser = mapUserToGraphqlUser(user);
        await dispatch(
          'UserPending',
          'delete',
          {
            ...graphQLUser,
            pending_organization_id: organizationId,
          } as User,
          'User'
        );

        return graphQLUser;
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.RemoveUserFromPendingOrgaError
        );
      }
    },
    login: async (_, args, context) => {
      try {
        const loggedUser = await UsersAuthApp.login(context, args);
        if (loggedUser) {
          return mapUserToGraphqlUser(loggedUser);
        }

        return undefined;
      } catch (error) {
        if (error.message.includes(ErrorCode.UserDisabled)) {
          throw ForbiddenAccess(ErrorCode.YouCanNotLogin);
        }

        throw mapToGraphQLError(error);
      }
    },
    logout: async (_, __, context) => {
      return UsersAuthApp.logout(context);
    },
    contactUs: async (_, { message, platformIdentifier, platformId }) => {
      try {
        const { portalContext } = requestContext.require();
        const platformToken = portalContext?.req.header(
          'XTM-Hub-Platform-Token'
        );

        await hubspotReachOutSalesHook({
          message,
          platformToken,
          platformId,
          platformIdentifier,
        });
        return { success: true };
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.HubspotError);
      }
    },
  },
  Subscription: {
    User: {
      subscribe: (_, args, context, info) => {
        return {
          [Symbol.asyncIterator]: () =>
            listen(context, ['User'], info, (payload: UserSubscription) => {
              if (!args.organizationId || payload.merge) {
                return true;
              }
              const user = payload.add ?? payload.delete ?? payload.edit;
              return user.organizations
                .map((org) => org.id)
                .includes(extractId(args.organizationId));
            }),
        };
      },
    },
    MeUser: {
      subscribe: (_, __, context, info) => ({
        [Symbol.asyncIterator]: () => listen(context, ['MeUser'], info),
      }),
    },
    UserPending: {
      subscribe: (_, args, context, info) => ({
        [Symbol.asyncIterator]: () => {
          return listen(
            context,
            ['UserPending'],
            info,
            (payload: UserPendingSubscription) => {
              const organizationId = payload.delete
                ? payload.delete.pending_organization_id
                : payload.invalidate.id;
              return organizationId === extractId(args.organizationId);
            }
          );
        },
      }),
    },
  },
};

export default resolvers;
