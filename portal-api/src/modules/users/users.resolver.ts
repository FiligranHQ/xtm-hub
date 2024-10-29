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
import User, { UserId, UserMutator } from '../../model/kanel/public/User';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { AWXAction } from '../../managers/awx/awx.model';
import { loadTrackingDataBy } from '../tracking/tracking.domain';
import { createUserRolePortal } from '../common/user-role-portal';
import { loadSubscriptionsByOrganization } from '../subcription/subscription.domain';
import { insertUserService } from '../user_service/user_service.domain';
import { insertCapa } from '../subcription/service_capability.domain';
import { RolePortalId } from '../../model/kanel/public/RolePortal';
import { UserServiceId } from '../../model/kanel/public/UserService';
import { sendMail } from '../../server/mail-service';
import { updateUser } from './users.helper';
import { ROLE_ADMIN } from '../../portal.const';

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
      return loadUserBy({ 'User.id': id as UserId});
    },
    users: async (_, { first, after, orderMode, orderBy, filter }, context) => {
      if (!context.user)
        throw new GraphQLError('You must be logged in', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      return loadUsers(context, { first, after, orderMode, orderBy }, filter);
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
          await createUserRolePortal(
            addedUser.id as UserId,
            role_id as RolePortalId
          );
        }

        await launchAWXWorkflow({
          type: AWXAction.CREATE_USER,
          input: {
            ...data,
            roles: extractRolesId,
            password: input.password,
          },
        });

        // Send email to user
        await sendMail({
          from: 'no-reply@scredplatform.io',
          to: input.email,
          subject: 'XTM Hub invitation',
          text: "An administrator has invited you to create your account on the Filigran's XTM Hub platform ! Register. ",
        });

        // Add access to free services of its organization
        const subscriptions = await loadSubscriptionsByOrganization(context, {
          orderBy: 'service_name',
        });

        const subscriptableDirectSubscriptions = subscriptions.edges.filter(
          (subscription) => {
            return (
              typeof subscription.node.service.subscription_service_type ===
                'string' &&
              subscription.node.service.subscription_service_type ===
                'SUBSCRIPTABLE_DIRECT' &&
              subscription.node.joining === 'AUTO_JOIN'
            );
          }
        );

        for (const subscription of subscriptableDirectSubscriptions) {
          const [addedUserService] = await insertUserService(context, {
            id: uuidv4() as UserServiceId,
            user_id: context.user.id,
            subscription_id: subscription.node.id,
            service_personal_data: null,
          });
          await insertCapa(context, addedUserService.id, 'ACCESS_SERVICE');
        }
        await trx.commit();
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
        const userBeforeUpdate = await loadUserBy({
          'User.id': id as UserId,
        } as UserMutator);
        const completedUser = await updateUser(context, id, input);

        await dispatch('User', 'edit', completedUser);

        await launchAWXWorkflow({
          type: AWXAction.UPDATE_USER,
          input: {
            id: completedUser.id,
            ...completedUser,
            roles: completedUser.roles_portal_id.map(({ id }) => id),
          },
        });
        const hasAdminRole = (user) =>
          user.roles_portal_id.some(({ id }) => id === ROLE_ADMIN.id);

        const hadAdminRoleBefore = hasAdminRole(userBeforeUpdate);
        const hasAdminRoleNow = hasAdminRole(completedUser);

        if (hadAdminRoleBefore && !hasAdminRoleNow) {
          await launchAWXWorkflow({
            type: AWXAction.REMOVE_PLTF_USER,
            input: {
              id: completedUser.id,
              email: completedUser.email,
            },
          });
        } else if (!hadAdminRoleBefore && hasAdminRoleNow) {
          // add admin role
          await launchAWXWorkflow({
            type: AWXAction.ADD_PLTF_USER,
            input: {
              id: completedUser.id,
              email: completedUser.email,
            },
          });
        }
        await trx.commit();
        return completedUser as unknown as GeneratedUser;
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
      await launchAWXWorkflow({
        type: AWXAction.DISABLE_USER,
        input: {
          id: deletedUser.id,
          email: deletedUser.email,
        },
      });
      return deletedUser;
    },
    // Login / logout
    login: async (_, { email, password }, context) => {
      const { req } = context;
      const logged = await loadUserBy({ email });

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
