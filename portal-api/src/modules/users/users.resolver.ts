import { fromGlobalId } from 'graphql-relay/node/node.js';
import { GraphQLError } from 'graphql/error/index.js';
import crypto from 'node:crypto';
import { dbTx } from '../../../knexfile';
import { MergeEvent, Resolvers } from '../../__generated__/resolvers-types';
import { PORTAL_COOKIE_NAME } from '../../index';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { RolePortalId } from '../../model/kanel/public/RolePortal';
import User, { UserId } from '../../model/kanel/public/User';
import { UserLoadUserBy } from '../../model/user';
import { CAPABILITY_BYPASS } from '../../portal.const';
import { dispatch, listen } from '../../pub';
import { logApp } from '../../utils/app-logger.util';
import { extractId } from '../../utils/utils';
import {
  removeUserFromOrganization,
  updateUserOrg,
} from '../common/user-organization.helper';
import { updateUserRolePortal } from '../common/user-role-portal.helper';
import { loadOrganizationsFromEmail } from '../organizations/organizations.helper';
import {
  loadUnsecureUser,
  loadUserBy,
  loadUserDetails,
  loadUsers,
  selectOrganizationAtLogin,
  updateSelectedOrganization,
  updateUser,
  userHasOrganizationWithSubscription,
} from './users.domain';
import {
  addNewUserWithRoles,
  mapUserToGraphqlUser,
  removeUser,
} from './users.helper';

const validPassword = (user: UserLoadUserBy, password: string): boolean => {
  const hash = crypto
    .pbkdf2Sync(password, user.salt, 1000, 64, `sha512`)
    .toString(`hex`);
  return user.password === hash;
};

const resolvers: Resolvers = {
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
    users: async (_, { first, after, orderMode, orderBy, filter }, context) => {
      return loadUsers(context, { first, after, orderMode, orderBy }, filter);
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
        // In most of the case there will be only one organization in the list, but in case where the scenario is an admin pltfm it can be multiple or none
        const chosenOrganization: OrganizationId | undefined = input
          .organizations?.[0]
          ? (extractId(input.organizations?.[0]) as OrganizationId)
          : undefined;

        // The admin orga should only allow to add users in the same organization and with the same domain.
        // Only the admin PLTFM can by pass this check
        if (
          chosenOrganization !== organizationFromEmail?.id &&
          !context.user.capabilities.some((c) => c.id === CAPABILITY_BYPASS.id)
        ) {
          throw new GraphQLError(
            'You cannot add a user whose email domain is outside your organization',
            {
              extensions: { code: '[User] addUser' },
            }
          );
        }

        const [existingUser] = await loadUnsecureUser({ email: input.email });
        const user = existingUser
          ? existingUser
          : await addNewUserWithRoles(
              {
                email: input.email,
                password: input.password,
                selected_organization_id: chosenOrganization,
              },
              []
            );

        await updateUserOrg(context, user.id, [
          user.id, // Should always add the user personal space. User.Id is equal to Organization.Id
          ...input.organizations.map(extractId<OrganizationId>),
        ]);
        await updateUserRolePortal(
          context,
          user.id,
          input.roles_id.map(extractId<RolePortalId>)
        );

        const loadUserFinalUser = await loadUserBy({
          'User.id': user.id,
        });

        await dispatch('User', 'add', loadUserFinalUser);
        await trx.commit();

        return mapUserToGraphqlUser(loadUserFinalUser);
      } catch (error) {
        await trx.rollback();
        logApp.error('Error while adding the new user.', error);
        throw new GraphQLError('Error while adding the new user.', {
          extensions: { code: '[Users] addUser mutation' },
          originalError: error,
        });
      }
    },
    editUser: async (_, { id, input }, context) => {
      if (id === context.user.id) {
        throw new GraphQLError('You cannot edit yourself', {
          extensions: { code: '[User] editUser' },
        });
      }
      const trx = await dbTx();
      try {
        await updateUser(context, id as UserId, input);
        const user = await loadUserDetails({
          'User.id': id as UserId,
        });

        await dispatch('User', 'edit', user);
        await trx.commit();
        return user;
      } catch (error) {
        await trx.rollback();
        logApp.error('Error while editing the new user.');
        throw error;
      }
    },
    deleteUser: async (_, { id }, context) => {
      const deletedUser = await removeUser(context, { id: id as UserId });

      await dispatch('User', 'delete', deletedUser);
      return deletedUser as User;
    },
    changeSelectedOrganization: async (_, { organization_id }, context) => {
      const updatedUser = await updateSelectedOrganization(
        context.user.id,
        fromGlobalId(organization_id).id
      );
      context.req.session.user.selected_organization_id =
        updatedUser.selected_organization_id;

      return mapUserToGraphqlUser(updatedUser);
    },
    removeUserFromOrganization: async (
      _,
      { user_id, organization_id },
      context
    ) => {
      if (extractId(user_id) === context.user.id) {
        throw new GraphQLError('You cannot remove yourself from organization', {
          extensions: { code: '[User] removeUserFromOrganization' },
        });
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
    },
    login: async (_, { email, password }, context) => {
      const { req } = context;
      const logged = await loadUserBy({ email });
      if (logged && validPassword(logged, password)) {
        req.session.user = await selectOrganizationAtLogin(logged);
        return mapUserToGraphqlUser(logged);
      }
      return undefined;
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
  },
};

export default resolvers;
