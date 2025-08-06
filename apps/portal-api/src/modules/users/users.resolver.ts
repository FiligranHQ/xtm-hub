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

import { updateUserSession } from '../../sessionStoreManager';
import {
  BadRequestError,
  FORBIDDEN_ACCESS,
  ForbiddenAccess,
  UnknownError,
} from '../../utils/error.util';
import { extractId } from '../../utils/utils';
import { ErrorCode } from '../common/error-code';
import { removeUserFromOrganizationPending } from '../common/user-organization-pending.domain';
import {
  createUserOrgCapabilities,
  loadUserOrganization,
  removeUserFromOrganization,
  updateMultipleUserOrgWithCapabilities,
  updateUserOrgCapabilities,
} from '../common/user-organization.domain';
import { createUserOrganizationRelationAndRemovePending } from '../common/user-organization.helper';
import {
  loadOrganizationBy,
  loadOrganizationsFromEmail,
} from '../organizations/organizations.helper';
import { usersAdminApp } from './users.admin.app';
import {
  getCapabilities,
  getOrganizations,
  getRolesPortal,
  loadOrganizationAdministrators,
  loadPendingUsers,
  loadUnsecureUser,
  loadUserBy,
  loadUserDetails,
  loadUsers,
  resetPassword,
  updateUser,
  updateUserAtLogin,
  userHasOrganizationWithSubscription,
} from './users.domain';
import {
  createUserWithPersonalSpace,
  mapUserToGraphqlUser,
  preventAdministratorRemovalOfOneOrganization,
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
    organizationAdministrators: async (_, { organizationId }, context) => {
      return loadOrganizationAdministrators(
        context,
        fromGlobalId(organizationId).id
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

        const chosenOrganization = await loadOrganizationBy(
          context,
          'id',
          context.user.selected_organization_id
        );

        if (chosenOrganization.personal_space) {
          throw new Error('CANT_ADD_USER_TO_PERSONAL_SPACE');
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
        if (error.message.includes('CANT_ADD_USER_TO_PERSONAL_SPACE')) {
          logApp.warn('You cannot add a user in your personal space');
          throw ForbiddenAccess(error.message);
        }
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
          throw ForbiddenAccess('EMAIL_OUTSIDE_ORGANIZATION_ERROR');
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
        if (
          error.name.includes(FORBIDDEN_ACCESS) &&
          error.message.includes('User disabled')
        ) {
          logApp.warn('You cannot add a user who is disabled in the plaform');
          throw ForbiddenAccess('CANT_ADD_DISABLED_USER');
        }
        if (
          error.name.includes(FORBIDDEN_ACCESS) &&
          error.message.includes('EMAIL_OUTSIDE_ORGANIZATION_ERROR')
        ) {
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
    editUserCapabilities: async (_, { id, input }, context) => {
      const trx = await dbTx();
      try {
        const userId = id as UserId;
        const organization_id = context.user.selected_organization_id;
        await preventAdministratorRemovalOfOneOrganization(
          userId,
          organization_id,
          input.capabilities
        );

        const [userOrganization] = await loadUserOrganization(context, {
          user_id: userId,
          organization_id,
        });

        if (!userOrganization) {
          await createUserOrganizationRelationAndRemovePending(context, {
            user_id: userId,
            organizations_id: [organization_id],
          });
        }

        await updateUserOrgCapabilities(context, {
          user_id: userId,
          organization_id,
          orgCapabilities: input.capabilities,
        });
        const user = await loadUserDetails({
          'User.id': id as UserId,
        });

        updateUserSession(user);

        await dispatch('User', 'edit', user);

        const userMapped = mapUserToGraphqlUser(user);
        await dispatch('MeUser', 'edit', userMapped, 'User');

        await trx.commit();
        return user;
      } catch (error) {
        await trx.rollback();
        if (error.message === 'CANT_REMOVE_LAST_ADMINISTRATOR') {
          throw BadRequestError('CANT_REMOVE_LAST_ADMINISTRATOR');
        }
        if (error.name === 'FORBIDDEN_ACCESS') {
          logApp.warn('Forbidden access while editing user');
          throw ForbiddenAccess('Not authorized');
        }
        throw UnknownError('EDIT_USER_ERROR', {
          detail: error.message,
        });
      }
    },
    adminEditUser: async (_, { id, input }, context) => {
      try {
        return await usersAdminApp.editUser(context, {
          userId: id as UserId,
          input,
        });
      } catch (error) {
        if (error.message.includes('CANT_REMOVE_LAST_ADMINISTRATOR')) {
          throw BadRequestError('CANT_REMOVE_LAST_ADMINISTRATOR');
        }

        throw UnknownError('EDIT_USER_ERROR', {
          detail: error.message,
        });
      }
    },

    editMeUser: async (_, { input }, context) => {
      try {
        return await usersProfileApp.editMeUser(context, input);
      } catch (error) {
        if (error.message.includes(ErrorCode.InvalidImageUrl)) {
          throw BadRequestError(error.message);
        }

        throw UnknownError('EDIT_ME_USER_ERROR', {
          detail: error,
        });
      }
    },
    resetPassword: async (_, __, context) => {
      await resetPassword(context);
      return { success: true };
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
          throw ForbiddenAccess('CANT_REMOVE_YOURSELF_FROM_ORGA_ERROR');
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
        if (error.name.includes(FORBIDDEN_ACCESS)) {
          logApp.warn('CANT_REMOVE_YOURSELF_FROM_ORGA_ERROR');
          throw ForbiddenAccess('CANT_REMOVE_YOURSELF_FROM_ORGA_ERROR');
        }
        throw UnknownError('REMOVE_USER_FROM_ORGA_ERROR', { detail: error });
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
        return mapUserToGraphqlUser(user);
      } catch (error) {
        throw UnknownError('REMOVE_USER_FROM_PENDING_ORGA_ERROR', {
          detail: error,
        });
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
        if (
          error.name.includes(FORBIDDEN_ACCESS) &&
          error.message.includes('User disabled')
        ) {
          logApp.warn('You can not login');
          throw ForbiddenAccess('You can not login');
        }
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
  },
};

export default resolvers;
