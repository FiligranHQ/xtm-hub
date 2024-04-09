import { MergeEvent, Resolvers, User as GeneratedUser } from '../../__generated__/resolvers-types';
import { DatabaseType, db } from '../../../knexfile';
import { UserWithAuthentication } from './users';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'node:crypto';
import { fromGlobalId } from 'graphql-relay/node/node.js';
import { PORTAL_COOKIE_NAME } from '../../index';
import { loadUserBy, loadUsers } from './users.domain';
import { dispatch, listen } from '../../pub';
import { extractId } from '../../utils/utils';
import { loadOrganizationBy } from '../organizations/organizations.domain';
import { hashPassword } from '../../utils/hash-password.util';
import { GraphQLError } from 'graphql/error/index.js';
import { AWXAction, launchAWXWorkflow } from '../../managers/awx/awx-configuration';
import User, { UserId } from '../../model/kanel/public/User';
import { OrganizationId } from '../../model/kanel/public/Organization';

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
      const data: User = {
        id: uuidv4() as UserId,
        email: input.email,
        salt,
        password: hash,
        first_name: input.first_name,
        last_name: input.last_name,
        organization_id: extractId(input.organization_id) as OrganizationId,
      };
      // TODO check how to make it work between Kanel and Graphql
      const [addedUser] = await db<GeneratedUser>(context, 'User').insert(data).returning('*');
      await launchAWXWorkflow({
        type: AWXAction.CREATE_USER,
        input: data,
      });
      return addedUser;
    },
    editUser: async (_, { id, input }, context) => {
      const { id: databaseId } = fromGlobalId(id);
      const organization_id = extractId(input.organization_id);
      const update = { ...input, organization_id };
      const [updatedUser] = await db<GeneratedUser>(context, 'User').where({ id: databaseId }).update(update).returning('*');
      updatedUser.organization = await loadOrganizationBy(context, 'Organization.id', organization_id);
      await dispatch('User', 'edit', updatedUser);
      return updatedUser;
    },
    deleteUser: async (_, { id }, context) => {
      const { id: databaseId } = fromGlobalId(id) as { type: DatabaseType, id: string };
      const [deletedUser] = await db<GeneratedUser>(context, 'User').where({ id: databaseId }).delete('*');
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
