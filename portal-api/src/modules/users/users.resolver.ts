import { fromGlobalId } from 'graphql-relay/node/node.js';
import { GraphQLError } from 'graphql/error/index.js';
import crypto from 'node:crypto';
import { v4 as uuidv4 } from 'uuid';
import { dbTx } from '../../../knexfile';
import { MergeEvent, Resolvers } from '../../__generated__/resolvers-types';
import { PORTAL_COOKIE_NAME } from '../../index';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { RolePortalId } from '../../model/kanel/public/RolePortal';
import User, { UserId } from '../../model/kanel/public/User';
import { UserLoadUserBy } from '../../model/user';
import { dispatch, listen } from '../../pub';
import { sendMail } from '../../server/mail-service';
import { extractId } from '../../utils/utils';
import { createUserOrganizationRelation } from '../common/user-organization.helper';
import { createUserRolePortalRelation } from '../common/user-role-portal.helper';
import { insertNewOrganization } from '../organizations/organizations.helper';
import {
  addNewUser,
  loadUserBy,
  loadUserDetails,
  loadUsers,
  updateSelectedOrganization,
  updateUser,
  userHasSomeSubscription,
} from './users.domain';
import { mapUserToGraphqlUser, removeUser } from './users.helper';

const validPassword = (user: UserLoadUserBy, password: string): boolean => {
  const hash = crypto
    .pbkdf2Sync(password, user.salt, 1000, 64, `sha512`)
    .toString(`hex`);
  return user.password === hash;
};

const resolvers: Resolvers = {
  Query: {
    me: async (_, __, context) => {
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
    userHasSomeSubscription: async (_, __, context) => {
      return userHasSomeSubscription(context);
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
        const userId = uuidv4();

        // Create user personal space organization
        const [addOrganization] = await insertNewOrganization({
          id: userId as OrganizationId,
          name: input.email,
          personal_space: true,
        });

        // Create user with Personal space by default
        const addedUser = await addNewUser(context, {
          input,
          userId,
          selected_organization_id: addOrganization.id,
        });

        // Insert relation UserOrganization
        await createUserOrganizationRelation(context, {
          user_id: addedUser.id,
          organizations_id: [
            addOrganization.id,
            ...(input.organizations ?? []).map(
              (orgId) => fromGlobalId(orgId).id as OrganizationId
            ),
          ],
        });

        // Insert relation UserRolePortal
        await createUserRolePortalRelation({
          user_id: addedUser.id,
          roles_id: input.roles_id.map(
            (role_id) => extractId(role_id) as RolePortalId
          ),
        });

        await sendMail({
          to: input.email,
          subject: 'XTM Hub invitation',
          text: "An administrator has invited you to create your account on the Filigran's XTM Hub platform ! Register. ",
        });

        const user = await loadUserBy({
          'User.id': addedUser.id,
        });

        await dispatch('User', 'add', user);
        await trx.commit();

        return mapUserToGraphqlUser(user);
      } catch (error) {
        await trx.rollback();
        console.error('Error while adding the new user.', error);
        throw new GraphQLError('Error while adding the new user.', {
          extensions: { code: '[Users] addUser mutation' },
          originalError: error,
        });
      }
    },
    editUser: async (_, { id, input }, context) => {
      const trx = await dbTx();
      try {
        const completedUser = await updateUser(context, id as UserId, input);

        const user = await loadUserDetails({
          'User.id': completedUser.id,
        });

        await dispatch('User', 'edit', user);
        await trx.commit();
        return user;
      } catch (error) {
        await trx.rollback();
        console.log('Error while editing the new user.');
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
    // Login / logout
    login: async (_, { email, password }, context) => {
      const { req } = context;
      const logged = await loadUserBy({ email });
      if (logged && validPassword(logged, password)) {
        req.session.user = logged;
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
