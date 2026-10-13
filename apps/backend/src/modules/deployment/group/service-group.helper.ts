import type { Management } from 'auth0';
import {
  PlatformIdentifier,
  ServiceGroupName,
  ServiceGroup as ServiceGroupResponse,
} from '../../../__generated__/resolvers-types';
import DeploymentRequest, {
  DeploymentRequestId,
} from '../../../model/kanel/public/DeploymentRequest';
import Organization from '../../../model/kanel/public/Organization';
import ServiceGroupModel from '../../../model/kanel/public/ServiceGroup';
import User, { UserId } from '../../../model/kanel/public/User';
import {
  buildXtmPlatformTrialLink,
  sendMail,
} from '../../../server/mail-service';
import {
  formatProductNames,
  sortProductsForMail,
} from '../../../server/mail-template/mail';
import {
  Auth0UpdateUserRBACInstance,
  auth0Client,
} from '../../../thirdparty/auth0/client';
import { logApp } from '../../../utils/app-logger.util';
import { ErrorCode } from '../../../utils/error/error.code';
import { formatName } from '../../../utils/format';
import { UserDomain } from '../../organization-management/user/user-domain/user.domain';
import { UserHelper } from '../../organization-management/user/user.helper';
import { TelemetryApp } from '../../telemetry/telemetry.app';
import { TelemetryHelper } from '../../telemetry/telemetry.helper';
import { DeploymentRequestDomain } from '../deployment.domain';
import { DeploymentRequestWithServiceGroupName } from './service-group.domain';

export type TrialAccessTelemetryContext = {
  organization: Organization | undefined;
  actorUserId: UserId;
  emailByUserId: Map<UserId, string>;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const ServiceGroupHelper = {
  toServiceGroupResponse: (
    serviceGroup: ServiceGroupModel
  ): ServiceGroupResponse => ({
    ...serviceGroup,
    name: serviceGroup.name as ServiceGroupName,
  }),

  uniqueRolesByProduct: <T extends { product: PlatformIdentifier }>(
    roles: T[]
  ): T[] =>
    roles.filter(
      (roleAssignment, index) =>
        roles.findIndex((other) => other.product === roleAssignment.product) ===
        index
    ),

  matchRolesToChildren: <T extends ServiceGroupName | null>(
    children: DeploymentRequest[],
    roles: { product: PlatformIdentifier; role?: T | null }[]
  ): { child: DeploymentRequest; role: T | null }[] =>
    roles.flatMap((roleAssignment) => {
      const child = children.find(
        (deploymentRequest) =>
          deploymentRequest.platform_identifier === roleAssignment.product
      );
      return child ? [{ child, role: roleAssignment.role ?? null }] : [];
    }),

  loadEmailByUserId: async (
    userIds: UserId[]
  ): Promise<{ users: User[]; emailByUserId: Map<UserId, string> }> => {
    const users = await UserDomain.loadUsers(userIds);
    return {
      users,
      emailByUserId: new Map(users.map(({ id, email }) => [id, email])),
    };
  },

  syncAuth0GroupsForChildren: async (
    childGroupAssignments: {
      child: DeploymentRequest;
      groupNames: ServiceGroupName[];
    }[],
    userIds: UserId[],
    emailByUserId: Map<UserId, string>,
    prefetchedAuth0UsersByUserId?: Map<UserId, Management.UserResponseSchema[]>
  ): Promise<void> => {
    const rbacInstance: Auth0UpdateUserRBACInstance = {};
    childGroupAssignments.forEach(({ child, groupNames }) => {
      if (!child.platform_id) {
        return;
      }
      rbacInstance[child.platform_id] = { groups: groupNames };
    });

    if (Object.keys(rbacInstance).length === 0) {
      return;
    }

    await Promise.all(
      userIds.map((userId) => {
        const email = emailByUserId.get(userId);
        if (!email) {
          return undefined;
        }
        return auth0Client.updateUserRBACInstance(
          email,
          rbacInstance,
          prefetchedAuth0UsersByUserId?.get(userId)
        );
      })
    );
  },

  sendTrialAccessTelemetry: async (
    { organization, actorUserId, emailByUserId }: TrialAccessTelemetryContext,
    {
      deploymentId,
      role,
      userIds,
    }: {
      deploymentId: DeploymentRequestId;
      role: ServiceGroupName | null;
      userIds: UserId[];
    }
  ): Promise<void> => {
    await Promise.allSettled(
      userIds.flatMap((userId) => {
        const email = emailByUserId.get(userId);
        if (!email) {
          return [];
        }
        return TelemetryApp.sendTelemetryEvent(
          role
            ? TelemetryHelper.buildTrialAccessGrantedEvent(
                organization,
                actorUserId,
                {
                  deployment_id: deploymentId,
                  role,
                  email,
                }
              )
            : TelemetryHelper.buildTrialAccessRemovedEvent(
                organization,
                actorUserId,
                {
                  deployment_id: deploymentId,
                  email,
                }
              )
        );
      })
    );
  },

  sendFreeTrialBundleWelcomeEmails: async ({
    endDate,
    products,
    newlyAddedUsers,
    adminEmail,
  }: {
    endDate: Date | null;
    products: PlatformIdentifier[];
    newlyAddedUsers: User[];
    adminEmail: string;
  }): Promise<void> => {
    if (!endDate || products.length === 0 || newlyAddedUsers.length === 0) {
      return;
    }

    try {
      const platformUrl = buildXtmPlatformTrialLink();
      const daysLeft = Math.max(
        0,
        Math.ceil((endDate.getTime() - Date.now()) / MS_PER_DAY)
      );
      const sortedProducts = sortProductsForMail(products);
      const productNames = formatProductNames(products);

      await Promise.all(
        newlyAddedUsers.map((addedUser) =>
          sendMail({
            to: addedUser.email,
            template: 'free_trial_bundle_user_added',
            params: {
              firstName: formatName(addedUser.first_name),
              adminEmail,
              productNames,
              products: sortedProducts,
              daysLeft,
              platformUrl,
            },
          })
        )
      );
    } catch (error) {
      logApp.error('Unable to send free_trial_bundle_user_added mail', {
        error,
      });
    }
  },

  sendBundleWelcomeEmailsForGrant: async (
    deploymentRequestsWithGroupName: DeploymentRequestWithServiceGroupName[],
    user: User
  ): Promise<void> => {
    const productsByBundleId = new Map<
      DeploymentRequestId,
      PlatformIdentifier[]
    >();
    deploymentRequestsWithGroupName.forEach((deploymentRequest) => {
      if (
        !deploymentRequest.parent_id ||
        !deploymentRequest.platform_identifier
      ) {
        return;
      }
      const products =
        productsByBundleId.get(deploymentRequest.parent_id) ?? [];
      products.push(deploymentRequest.platform_identifier);
      productsByBundleId.set(deploymentRequest.parent_id, products);
    });

    await Promise.all(
      Array.from(productsByBundleId.entries()).map(
        async ([bundleId, products]) => {
          const bundleDeploymentRequest =
            await DeploymentRequestDomain.loadDeploymentRequestBy({
              id: bundleId,
            });
          if (!bundleDeploymentRequest) {
            return;
          }

          const [requester] = await UserDomain.loadUsers([
            bundleDeploymentRequest.user_requester_id,
          ]);
          // Unreachable: user_requester_id is non-nullable and a foreign key to User.
          // This guard only narrows the `User | undefined` from the array destructuring.
          if (!requester) {
            return;
          }

          await ServiceGroupHelper.sendFreeTrialBundleWelcomeEmails({
            endDate: bundleDeploymentRequest.end_date,
            products,
            newlyAddedUsers: [user],
            adminEmail: requester.email,
          });
        }
      )
    );
  },

  removeAuth0Groups: async (
    userIds: UserId[],
    platformId: string | null
  ): Promise<void> => {
    if (!platformId) {
      throw new Error(ErrorCode.InvalidPlatformId);
    }

    const users = await UserDomain.loadUsers(userIds);

    await Promise.all(
      users.filter(UserHelper.hasAuth0Account).map(({ email }) =>
        auth0Client.updateUserRBACInstance(email, {
          [platformId]: { groups: [] },
        })
      )
    );
  },
};
