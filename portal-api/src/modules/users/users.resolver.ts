import {
  MergeEvent,
  Resolvers,
  User as GeneratedUser,
} from '../../__generated__/resolvers-types';
import { db, dbTx } from '../../../knexfile';
import { UserWithAuthentication } from './users';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'node:crypto';
import { PORTAL_COOKIE_NAME } from '../../index';
import { loadUserBy, loadUsers } from './users.domain';
import { dispatch, listen } from '../../pub';
import { extractId } from '../../utils/utils';
import { loadOrganizationBy } from '../organizations/organizations.domain';
import { hashPassword } from '../../utils/hash-password.util';
import { GraphQLError } from 'graphql/error/index.js';
import { launchAWXWorkflow } from '../../managers/awx/awx-configuration';
import User, { UserId } from '../../model/kanel/public/User';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { AWXAction } from '../../managers/awx/awx.model';
import { loadTrackingDataBy } from '../tracking/tracking.domain';
import {
  createUserRolePortal,
  deleteUserRolePortalByUserId,
} from '../common/user-role-portal';
import { loadSubscriptionsByOrganization } from '../subcription/subscription.domain';
import { insertUserService } from '../user_service/user_service.domain';
import { insertCapa } from '../subcription/service_capability.domain';

const validPassword = (
  user: UserWithAuthentication,
  password: string
): boolean => {
  const hash = crypto
    .pbkdf2Sync(password, user.salt, 1000, 64, `sha512`)
    .toString(`hex`);
  return user.password === hash;
};

const resolvers: Resolvers = {
  Query: {
    me: async (_, __, context) => {
      if (!context.user)
        throw new GraphQLError('You must be logged in', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      return context.user;
    },
    user: async (_, { id }, context) => {
      if (!context.user)
        throw new GraphQLError('You must be logged in', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      return loadUserBy('User.id', id);
    },
    users: async (_, { first, after, orderMode, orderBy }, context) => {
      if (!context.user)
        throw new GraphQLError('You must be logged in', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      return loadUsers(context, { first, after, orderMode, orderBy });
    },
  },
  User: {
    organization: (user, __, context) => {
      return user.organization
        ? user.organization
        : loadOrganizationBy(context, 'Organization.id', user.organization_id);
    },
    tracking_data: async (user, __, context) => {
      return user?.tracking_data
        ? user?.tracking_data
        : await loadTrackingDataBy(
            context,
            'ActionTracking.contextual_id',
            user.id
          );
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
        const [addedUser] = await db<GeneratedUser>(context, 'User')
          .insert(data)
          .returning('*');

        const extractRolesId = input.roles_id.map((role_id) =>
          extractId(role_id)
        );
        for (const role_id of extractRolesId) {
          await createUserRolePortal(addedUser.id, role_id);
        }

        await launchAWXWorkflow({
          type: AWXAction.CREATE_USER,
          input: {
            ...data,
            roles: extractRolesId,
            password: input.password,
          },
        });

        // Add access to free services of its organization
        const subscriptions = await loadSubscriptionsByOrganization(context, {
          orderBy: 'service_name',
        });

        const subscriptableDirectSubscriptions = subscriptions.edges.filter(
          (subscription) => {
            return (
              typeof subscription.node.service.subscription_type === 'string' &&
              subscription.node.service.subscription_type ===
                'SUBSCRIPTABLE_DIRECT'
            );
          }
        );

        for (const subscription of subscriptableDirectSubscriptions) {
          const [addedUserService] = await insertUserService(
            context,
            context.user.id,
            subscription.node.id
          );
          await insertCapa(context, addedUserService.id, 'ACCESS_SERVICE');
        }

        return addedUser;
      } catch (error) {
        await trx.rollback();
        console.log('Error while adding the new user.', error);
        throw error;
      }
    },
    editUser: async (_, { id, input }, context) => {
      const trx = await dbTx();
      try {
        const organization_id = extractId(input.organization_id);
        const { roles_id, ...inputWithoutRoles } = input;
        const extracted_roles_portal_id = roles_id.map((role_portal_id) =>
          extractId(role_portal_id)
        );
        const update = { ...inputWithoutRoles, organization_id };
        const [updatedUser] = await db<GeneratedUser>(context, 'User')
          .where({ id })
          .update(update)
          .returning('*');
        await deleteUserRolePortalByUserId(updatedUser.id);
        extracted_roles_portal_id.map(async (role_id) => {
          await createUserRolePortal(updatedUser.id, role_id);
          return {
            id: role_id,
          };
        });
        const roles_portal_id = extracted_roles_portal_id.map((role_id) => {
          return {
            id: role_id,
          };
        });
        updatedUser.organization = await loadOrganizationBy(
          context,
          'Organization.id',
          organization_id
        );
        updatedUser.roles_portal_id = roles_portal_id;
        await dispatch('User', 'edit', updatedUser);
        return updatedUser;
      } catch (error) {
        await trx.rollback();
        console.log('Error while editing the new user.');
        throw error;
      }
    },
    deleteUser: async (_, { id }, context) => {
      const [deletedUser] = await db<GeneratedUser>(context, 'User')
        .where({ id })
        .delete('*');
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
