import { fromGlobalId } from 'graphql-relay/node/node.js';
import crypto from 'node:crypto';
import { dbTx } from '../../../knexfile';
import { MergeEvent, Resolvers } from '../../__generated__/resolvers-types';
import { PORTAL_COOKIE_NAME } from '../../index';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { UserId } from '../../model/kanel/public/User';
import { UserLoadUserBy } from '../../model/user';
import { CAPABILITY_BYPASS } from '../../portal.const';
import { dispatch, listen } from '../../pub';
import { logApp } from '../../utils/app-logger.util';

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
  updateMultipleUserOrgWithCapabilities,
} from '../common/user-organization.domain';
import { loadOrganizationBy } from '../organizations/organizations.domain';
import { loadOrganizationsFromEmail } from '../organizations/organizations.helper';
import { usersAdminApp } from './users.admin.app';
import {
  getCapabilities,
  getOrganizations,
  getRolesPortal,
  loadPendingUsers,
  loadUnsecureUser,
  loadUserBy,
  loadUserDetails,
  loadUsers,
  loadUsersByCapabilitiesInOrganization,
  resetPassword,
  updateUser,
  updateUserAtLogin,
  userHasOrganizationWithSubscription,
} from './users.domain';
import {
  createUserWithPersonalSpace,
  mapUserToGraphqlUser,
} from './users.helper';
import { usersProfileApp } from './users.profile.app';

const validPassword = (user: UserLoadUserBy, password: string): boolean => {
  const hash = crypto
    .pbkdf2Sync(password, user.salt, 1000, 64, `sha512`)
    .toString(`hex`);
  return user.password === hash;
};

const resolvers: Resolvers = {
  User: {
    organizations: ({ id }, _, context) => getOrganizations(context, id),
    capabilities: ({ id }, _, context) => getCapabilities(context, id),
    roles_portal: ({ id }, _, context) => getRolesPortal(context, id),
  },
  Query: {
    me: async (_, __, context) => {
      // User is not logged in
      if (!context.user) {
        return null;
      }
      return mapUserToGraphqlUser(context.user);
    },
    user: async (_, { id }) => {
      return loadUserDetails({
        'User.id': id as UserId,
      });
    },
    usersWithCapabilitiesInOrganization: async (_, { input }, context) => {
      return loadUsersByCapabilitiesInOrganization(
        context,
        fromGlobalId(input.organizationId).id,
        input.capabilities
      );
    },
    users: async (
      _,
      { first, after, orderMode, orderBy, searchTerm, filters },
      context
    ) => {
      return loadUsers(context, {
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
      { first, after, orderMode, orderBy, searchTerm, filters },
      context
    ) => {
      return loadPendingUsers(context, {
        first,
        after,
        orderMode,
        orderBy,
        filters,
        searchTerm,
      });
    },
    userHasOrganizationWithSubscription: async (_, __, context) => {
      return userHasOrganizationWithSubscription(context);
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

        await createUserOrgCapabilities(context, {
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
    adminAddUser: async (_, { input }, context) => {
      const trx = await dbTx();
      try {
        const [organizationFromEmail] = await loadOrganizationsFromEmail(
          input.email
        );
        // In most of the case there will be only one organization in the list, but in case where the scenario is an admin pltfm it can be multiple or none
        const chosenOrganization: OrganizationId | undefined = input
          .organization_capabilities?.[0]
          ? extractId<OrganizationId>(
              input.organization_capabilities?.[0].organization_id
            )
          : undefined;

        // The admin orga should only allow to add users in the same organization and with the same domain.
        // Only the admin PLTFM can by pass this check
        if (
          chosenOrganization !== organizationFromEmail?.id &&
          !context.user.capabilities.some((c) => c.id === CAPABILITY_BYPASS.id)
        ) {
          logApp.warn(
            'You cannot add a user whose email domain is outside your organization'
          );
          throw new Error(ErrorCode.EmailOutsideOrganizationError);
        }

        const [existingUser] = await loadUnsecureUser({ email: input.email });

        const user = existingUser
          ? existingUser
          : await createUserWithPersonalSpace({
              email: input.email,
              password: input.password,
              first_name: input.first_name,
              last_name: input.last_name,
              selected_organization_id: chosenOrganization,
            });

        await updateMultipleUserOrgWithCapabilities(
          context,
          user.id,
          input.organization_capabilities
        );

        const loadUserFinalUser = await loadUserBy({
          'User.id': user.id,
        });

        await dispatch('User', 'add', loadUserFinalUser);
        await trx.commit();

        return mapUserToGraphqlUser(loadUserFinalUser);
      } catch (error) {
        await trx.rollback();
        if (error.message.includes(ErrorCode.UserDisabled)) {
          logApp.warn('You cannot add a user who is disabled in the plaform');
          throw ForbiddenAccess(ErrorCode.CantAddDisabledUser);
        }

        throw mapToGraphQLError(error, UnknownErrorCode.AddingUserError);
      }
    },
    editUserCapabilities: async (_, { id, input }, context) => {
      try {
        return await usersAdminApp.editUserCapabilities(context, {
          userId: id as UserId,
          input,
        });
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.EditUserError);
      }
    },
    adminEditUser: async (_, { id, input }, context) => {
      try {
        return await usersAdminApp.editUser(context, {
          userId: id as UserId,
          input,
        });
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.EditUserError);
      }
    },

    editMeUser: async (_, { input }, context) => {
      try {
        return await usersProfileApp.editMeUser(context, input);
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.EditMeUserError);
      }
    },
    resetPassword: async (_, __, context) => {
      await resetPassword(context);
      return { success: true };
    },
    requestTransferPersonalSpace: async (_, { new_email }, context) => {
      try {
        await usersProfileApp.requestTransferPersonalSpace(context, new_email);

        return { success: true };
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.TransferMeError);
      }
    },
    transferPersonalSpace: async (_, { from, to }, context) => {
      try {
        await usersProfileApp.transferPersonalSpace(
          context,
          from as UserId,
          to as UserId
        );

        return { success: true };
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.EditMeUserError);
      }
    },
    changeSelectedOrganization: async (_, { organization_id }, context) => {
      const updatedUser = await updateUser(context, context.user.id, {
        selected_organization_id: fromGlobalId(organization_id)
          .id as OrganizationId,
      });
      const newUser = await loadUserBy({ 'User.id': updatedUser.id });
      context.req.session.user = newUser;
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
          context,
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
      { user_id, organization_id },
      context
    ) => {
      try {
        await removeUserFromOrganizationPending(
          context,
          extractId(user_id),
          extractId(organization_id)
        );
        const user = await loadUserBy({
          'User.id': extractId(user_id),
        });
        await dispatch('UserPending', 'delete', user, 'User');
        return mapUserToGraphqlUser(user);
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.RemoveUserFromPendingOrgaError
        );
      }
    },
    login: async (_, { email, password }, context) => {
      const { req } = context;
      try {
        const logged = await loadUserBy({ email });
        if (logged && validPassword(logged, password)) {
          req.session.user = await updateUserAtLogin(
            {
              ...context,
              user: logged,
            },
            logged
          );
          return mapUserToGraphqlUser(logged);
        }
        return undefined;
      } catch (error) {
        if (error.message.includes(ErrorCode.UserDisabled)) {
          throw ForbiddenAccess(ErrorCode.YouCanNotLogin);
        }

        throw mapToGraphQLError(error);
      }
    },
    logout: async (_, __, { user, req, res }) => {
      return new Promise((resolve) => {
        res.clearCookie(PORTAL_COOKIE_NAME);
        req.session.destroy(() => {
          resolve(user ? user.id : 'anonymous');
        });
      });
    },
  },
  Subscription: {
    User: {
      subscribe: (_, __, context) => ({
        [Symbol.asyncIterator]: () => listen(context, ['User']),
      }),
    },
    MeUser: {
      subscribe: (_, __, context) => ({
        [Symbol.asyncIterator]: () => listen(context, ['MeUser']),
      }),
    },
    UserPending: {
      subscribe: (_, __, context) => ({
        [Symbol.asyncIterator]: () => listen(context, ['UserPending']),
      }),
    },
  },
};

export default resolvers;
