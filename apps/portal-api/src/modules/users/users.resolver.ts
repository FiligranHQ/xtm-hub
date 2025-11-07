import { fromGlobalId } from 'graphql-relay/node/node.js';
import { dbTx } from '../../../knexfile';
import {
  MergeEvent,
  Resolvers,
  User,
  UserPendingSubscription,
  UserSubscription,
} from '../../__generated__/resolvers-types';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { UserId } from '../../model/kanel/public/User';
import { CAPABILITY_BYPASS } from '../../portal.const';
import { dispatch, listen } from '../../pub';
import { logApp } from '../../utils/app-logger.util';

import { requestContext } from '../../context/request.context';
import { UserTransferRequestId } from '../../model/kanel/public/UserTransferRequest';
import { ErrorCode, UnknownErrorCode } from '../../utils/error/error.code';
import { mapToGraphQLError } from '../../utils/error/error.mapping';
import {
  FORBIDDEN_ACCESS,
  ForbiddenAccess,
  UnknownError,
} from '../../utils/error/error.util';
import { extractId } from '../../utils/utils';
import { removeUserFromOrganizationPending } from '../common/user-organization-pending.domain';
import {
  createUserOrgCapabilities,
  removeUserFromOrganization,
} from '../common/user-organization.domain';
import { loadOrganizationBy } from '../organizations/organizations.domain';
import { loadOrganizationsFromEmail } from '../organizations/organizations.helper';
import { usersAdminApp } from './users.admin.app';
import { UsersAuthApp } from './users.auth.app';
import {
  getCapabilities,
  getOrganizations,
  getRolesPortal,
  loadPendingUsers,
  loadUnsecureUser,
  loadUserBy,
  loadUsers,
  loadUsersByCapabilitiesInOrganization,
  resetPassword,
  updateUser,
  userHasOrganizationWithSubscription,
} from './users.domain';
import {
  createUserWithPersonalSpace,
  mapUserToGraphqlUser,
} from './users.helper';
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
      return loadUsers({
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
      return loadPendingUsers({
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
    addUser: async (_, { input }, context) => {
      const trx = await dbTx();
      try {
        const [organizationFromEmail] = await loadOrganizationsFromEmail(
          input.email
        );

        const chosenOrganization = await loadOrganizationBy({
          id: context.user.selected_organization_id,
        });

        if (chosenOrganization.personal_space) {
          logApp.warn('You cannot add a user in your personal space');
          throw new Error(ErrorCode.CantAddUserToPersonalSpace);
        }

        // The admin orga should only allow to add users in the same organization and with the same domain.
        // Only the admin PLTFM can by pass this check
        if (
          chosenOrganization.id !== organizationFromEmail?.id &&
          !context.user.capabilities.some((c) => c.id === CAPABILITY_BYPASS.id)
        ) {
          throw ForbiddenAccess('EMAIL_OUTSIDE_ORGANIZATION_ERROR');
        }

        const [existingUser] = await loadUnsecureUser({ email: input.email });

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

        const loadUserFinalUser = await loadUserBy({
          'User.id': user.id,
        });

        await dispatch('User', 'add', loadUserFinalUser);
        await trx.commit();

        return mapUserToGraphqlUser(loadUserFinalUser);
      } catch (error) {
        await trx.rollback();
        if (error.name.includes(FORBIDDEN_ACCESS)) {
          logApp.warn(
            'You cannot add a user whose email domain is outside your organization'
          );
          throw ForbiddenAccess('EMAIL_OUTSIDE_ORGANIZATION_ERROR');
        }
        throw UnknownError('ADDING_USER_ERROR', {
          detail: error,
        });
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
    changeSelectedOrganization: async (_, { organization_id }, context) => {
      const updatedUser = await updateUser(context.user.id, {
        selected_organization_id: fromGlobalId(organization_id)
          .id as OrganizationId,
      });
      const newUser = await loadUserBy({ 'User.id': updatedUser.id });
      context.req.session.user = newUser;
      requestContext.update({ user: newUser });

      return mapUserToGraphqlUser(newUser);
    },
    removeUserFromOrganization: async (
      _,
      { user_id, organization_id },
      context
    ) => {
      try {
        if (extractId(user_id) === context.user.id) {
          throw new Error(ErrorCode.CantRemoveYourselfFromOrgaError);
        }
        await removeUserFromOrganization(
          extractId(user_id),
          extractId(organization_id)
        );
        const user = await loadUserBy({
          'User.id': extractId(user_id),
        });
        return mapUserToGraphqlUser(user);
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.RemoveUserFromOrgaError
        );
      }
    },
    removePendingUserFromOrganization: async (
      _,
      { user_id, organization_id }
    ) => {
      try {
        await removeUserFromOrganizationPending(
          extractId(user_id),
          extractId(organization_id)
        );
        const user = await loadUserBy({
          'User.id': extractId(user_id),
        });
        const graphQLUser = mapUserToGraphqlUser(user);
        await dispatch(
          'UserPending',
          'delete',
          {
            ...graphQLUser,
            pending_organization_id: extractId(organization_id),
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
        [Symbol.asyncIterator]: () =>
          listen(
            context,
            ['UserPending'],
            info,
            (payload: UserPendingSubscription) => {
              return (
                payload.delete.pending_organization_id ===
                extractId(args.organizationId)
              );
            }
          ),
      }),
    },
  },
};

export default resolvers;
