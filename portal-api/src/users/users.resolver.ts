import { MergeEvent, Resolvers, User } from '../__generated__/resolvers-types.js';
import { DatabaseType, db } from '../../knexfile.js';
import { UserWithAuthentication } from './users.js';
import { GraphQLError } from 'graphql/error/index.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'node:crypto';
import { fromGlobalId } from 'graphql-relay/node/node.js';
import { PORTAL_COOKIE_NAME } from '../index.js';
import { hashPassword } from '../server/initialize.js';
import { loadUserBy, loadUsers } from './users.domain.js';
import { dispatch, listen } from '../pub.js';
import { extractId } from '../utils/utils.js';
import { loadOrganizationBy } from '../organizations/organizations.domain.js';

const validPassword = (user: UserWithAuthentication, password: string): boolean => {
  const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, `sha512`).toString(`hex`);
  return user.password === hash;
};

const resolvers: Resolvers = {
  Query: {
    me: async (_, __, context) => {
      if (!context.user) throw new GraphQLError('You must be logged in', { extensions: { code: 'UNAUTHENTICATED' } });
      return context.user;
    },
    user: async (_, { id }, context) => {
      if (!context.user) throw new GraphQLError('You must be logged in', { extensions: { code: 'UNAUTHENTICATED' } });
      const { id: databaseId } = fromGlobalId(id) as { type: DatabaseType, id: string };
      return loadUserBy('User.id', databaseId);
    },
    users: async (_, { first, after, orderMode, orderBy }, context) => {
      if (!context.user) throw new GraphQLError('You must be logged in', { extensions: { code: 'UNAUTHENTICATED' } });
      return loadUsers(context, { first, after, orderMode, orderBy });
    },
  },
  User: {
    organization: (user, __, context) => {
      const id = extractId(user.organization_id);
      return user.organization ? user.organization : loadOrganizationBy(context, 'Organization.id', id);
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
      const { salt, hash } = hashPassword(input.password);
      const data = {
        id: uuidv4(),
        email: input.email,
        salt,
        password: hash,
        organization_id: extractId(input.organization_id),
      };
      const [addedUser] = await db<UserWithAuthentication>(context, 'User').insert(data).returning('*');
      return addedUser;
    },
    editUser: async (_, { id, input }, context) => {
      const { id: databaseId } = fromGlobalId(id);
      const organization_id = extractId(input.organization_id);
      const update = { ...input, organization_id };
      const [updatedUser] = await db<User>(context, 'User').where({ id: databaseId }).update(update).returning('*');
      updatedUser.organization = await loadOrganizationBy(context, 'Organization.id', organization_id);
      await dispatch('User', 'edit', updatedUser);
      return updatedUser;
    },
    deleteUser: async (_, { id }, context) => {
      const { id: databaseId } = fromGlobalId(id) as { type: DatabaseType, id: string };
      const [deletedUser] = await db<User>(context, 'User').where({ id: databaseId }).delete('*');
      await dispatch('User', 'delete', deletedUser);
      return deletedUser;
    },
    // Login / logout
    login: async (_, { email, password }, context) => {
      const { req } = context;
      const logged = await loadUserBy('User.email', email);
      if (logged && validPassword(logged, password)) {
        req.session.user = logged;
        return logged;
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
