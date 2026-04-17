import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  GRAPHQL_RESOLVE_INFO,
  TEST_ORGANIZATIONS,
} from '../../../tests/tests.const';
import {
  OrderingMode,
  PageInfo,
  SubscriptionModel,
  UserService,
  UserServiceConnection,
  UserServiceEdge,
  UserServiceOrdering,
} from '../../__generated__/resolvers-types';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';
import { UserServiceId } from '../../model/kanel/public/UserService';
import {
  ForbiddenErrorCode,
  NotFoundErrorCode,
} from '../../utils/error/error.code';
import { ErrorType } from '../../utils/error/error.type';
import * as usersDomain from '../organization-management/users/user-domain/users.domain';
import { UserServiceApp } from './user-service.app';
import { UserServiceDomain } from './user-service.domain';
import userServiceResolver from './user-service.resolver';

describe('userService field resolvers', () => {
  describe('userService.user', () => {
    it('should load user details by user_id', async () => {
      // Given
      const userId = TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID;
      const expected = { id: userId, email: 'user@test.com' };
      vi.spyOn(usersDomain, 'loadUserDetails').mockResolvedValue(
        expected as never
      );

      // When
      const result = await userServiceResolver.UserService!.user!(
        { user_id: userId } as unknown as UserService,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      // Then
      expect(usersDomain.loadUserDetails).toHaveBeenCalledWith({
        'User.id': userId,
      });
      expect(result).toEqual(expected);
    });
  });

  describe('userService.subscription', () => {
    it('should load subscription by user service id', async () => {
      // Given
      const userServiceId = uuidv4() as UserServiceId;
      const expected = { id: uuidv4() } as unknown as SubscriptionModel;
      vi.spyOn(
        UserServiceDomain,
        'loadSubscriptionByUserService'
      ).mockResolvedValue(expected);

      // When
      const result = await userServiceResolver.UserService!.subscription!(
        { id: userServiceId } as unknown as UserService,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      // Then
      expect(
        UserServiceDomain.loadSubscriptionByUserService
      ).toHaveBeenCalledWith(userServiceId);
      expect(result).toEqual(expected);
    });
  });

  describe('userService.user_service_capability', () => {
    it('should load user service capabilities by user service id', async () => {
      // Given
      const userServiceId = uuidv4() as UserServiceId;
      const expected = [{ id: uuidv4() }];
      vi.spyOn(
        UserServiceDomain,
        'loadUserServiceCapabilities'
      ).mockResolvedValue(expected as never);

      // When
      const result = await userServiceResolver.UserService!
        .user_service_capability!(
        { id: userServiceId } as unknown as UserService,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      // Then
      expect(
        UserServiceDomain.loadUserServiceCapabilities
      ).toHaveBeenCalledWith(userServiceId);
      expect(result).toEqual(expected);
    });
  });
});

describe('query.userServiceOwned', () => {
  it('should delegate to UserServiceDomain.loadUserServiceByUser with context user', async () => {
    // Given
    const paginationArgs = {
      first: 10,
      after: null,
      orderMode: OrderingMode.Asc,
      orderBy: UserServiceOrdering.Email,
    };
    const userServiceId = uuidv4() as UserServiceId;
    const subscriptionId = uuidv4() as SubscriptionId;
    const userService: UserService = {
      id: userServiceId,
      subscription_id: subscriptionId,
      user_id: uuidv4(),
    };
    const edge: UserServiceEdge = {
      cursor: userServiceId,
      node: userService,
    };
    const pageInfo: PageInfo = {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: userServiceId,
      endCursor: userServiceId,
    };
    const expected: UserServiceConnection = {
      edges: [edge],
      pageInfo,
      totalCount: 1,
    };
    vi.spyOn(UserServiceDomain, 'loadUserServiceByUser').mockReturnValue(
      expected as never
    );

    // When
    const result = await userServiceResolver.Query!.userServiceOwned!(
      {},
      paginationArgs,
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(UserServiceDomain.loadUserServiceByUser).toHaveBeenCalledWith(
      contextSimpleUserFiligran2.user,
      paginationArgs
    );
    expect(result).toEqual(expected);
  });
});

describe('query.userServiceFromSubscription', () => {
  it('should decode subscription_id from global ID and delegate to UserServiceDomain', async () => {
    // Given
    const rawSubscriptionId = uuidv4() as SubscriptionId;
    const globalSubscriptionId = toGlobalId('Subscription', rawSubscriptionId);
    const paginationArgs = {
      first: 10,
      after: null,
      orderMode: OrderingMode.Asc,
      orderBy: UserServiceOrdering.Email,
    };
    const userServiceId = uuidv4() as UserServiceId;
    const userService: UserService = {
      id: userServiceId,
      subscription_id: rawSubscriptionId,
      user_id: uuidv4(),
    };
    const edge: UserServiceEdge = {
      cursor: userServiceId,
      node: userService,
    };
    const pageInfo: PageInfo = {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: userServiceId,
      endCursor: userServiceId,
    };
    const expected: UserServiceConnection = {
      edges: [edge],
      pageInfo,
      totalCount: 1,
    };
    vi.spyOn(
      UserServiceDomain,
      'loadUserServiceBySubscription'
    ).mockReturnValue(expected as never);

    // When
    const result = await userServiceResolver.Query!
      .userServiceFromSubscription!(
      {},
      { ...paginationArgs, subscription_id: globalSubscriptionId },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(
      UserServiceDomain.loadUserServiceBySubscription
    ).toHaveBeenCalledWith(paginationArgs, rawSubscriptionId);
    expect(result).toEqual(expected);
  });
});

describe('mutation.addYourselfInUserService', () => {
  it('should delegate to UserServiceApp and return result', async () => {
    // Given
    const input = {
      serviceInstanceId: 'instance-1' as never,
      email: ['user@test.com'],
    };
    const expected = [{ id: uuidv4() }] as never;
    vi.spyOn(UserServiceApp, 'addYourselfInUserService').mockResolvedValue(
      expected
    );

    // When
    const result = await userServiceResolver.Mutation!
      .addYourselfInUserService!(
      {},
      { input },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(UserServiceApp.addYourselfInUserService).toHaveBeenCalledWith(
      contextSimpleUserFiligran2.user.selected_organization_id,
      input.serviceInstanceId,
      input.email,
      []
    );
    expect(result).toEqual(expected);
  });

  it('should map to ForbiddenAccess for UserIsNotInOrganization error', async () => {
    // Given
    const input = {
      serviceInstanceId: 'instance-1' as never,
      email: ['user@test.com'],
    };
    vi.spyOn(UserServiceApp, 'addYourselfInUserService').mockRejectedValue(
      new Error(ForbiddenErrorCode.UserIsNotInOrganization)
    );

    // When
    const call = userServiceResolver.Mutation!.addYourselfInUserService!(
      {},
      { input },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    await expect(call).rejects.toMatchObject({
      name: ErrorType.ForbiddenAccess,
    });
  });
});

describe('mutation.addUserService', () => {
  it('should decode subscriptionId from global ID and delegate to UserServiceApp', async () => {
    // Given
    const rawSubscriptionId = uuidv4() as SubscriptionId;
    const globalSubscriptionId = toGlobalId('Subscription', rawSubscriptionId);
    const input = {
      subscriptionId: globalSubscriptionId,
      email: ['user@test.com'],
      capabilities: ['MANAGE_ACCESS'],
    };
    const expected = [] as never;
    vi.spyOn(UserServiceApp, 'addUserService').mockResolvedValue(expected);

    // When
    const result = await userServiceResolver.Mutation!.addUserService!(
      {},
      { input },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(UserServiceApp.addUserService).toHaveBeenCalledWith(
      contextSimpleUserFiligran2.user,
      rawSubscriptionId,
      input.email,
      input.capabilities
    );
    expect(result).toEqual(expected);
  });

  it('should map to ForbiddenAccess for EditCapabilitiesCantRemoveLastManageAccess error', async () => {
    // Given
    const rawSubscriptionId = uuidv4() as SubscriptionId;
    const globalSubscriptionId = toGlobalId('Subscription', rawSubscriptionId);
    vi.spyOn(UserServiceApp, 'addUserService').mockRejectedValue(
      new Error(ForbiddenErrorCode.EditCapabilitiesCantRemoveLastManageAccess)
    );

    // When
    const call = userServiceResolver.Mutation!.addUserService!(
      {},
      {
        input: {
          subscriptionId: globalSubscriptionId,
          email: ['user@test.com'],
          capabilities: [],
        },
      },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    await expect(call).rejects.toMatchObject({
      name: ErrorType.ForbiddenAccess,
    });
  });
});

describe('mutation.deleteUserService', () => {
  it('should decode subscriptionId from global ID and delegate to UserServiceApp', async () => {
    // Given
    const rawSubscriptionId = uuidv4() as SubscriptionId;
    const globalSubscriptionId = toGlobalId('Subscription', rawSubscriptionId);
    const email = 'user@test.com';
    const expected = {
      id: uuidv4(),
      user_id: 'some-user-id' as UserId,
      subscription_id: rawSubscriptionId,
    };
    vi.spyOn(UserServiceApp, 'deleteUserService').mockResolvedValue(
      expected as never
    );

    // When
    const result = await userServiceResolver.Mutation!.deleteUserService!(
      {},
      { input: { email, subscriptionId: globalSubscriptionId } },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(UserServiceApp.deleteUserService).toHaveBeenCalledWith(
      email,
      rawSubscriptionId
    );
    expect(result).toMatchObject({ subscription_id: rawSubscriptionId });
  });

  it('should map to NotFound for SubscriptionNotFound error', async () => {
    // Given
    const rawSubscriptionId = uuidv4() as SubscriptionId;
    const globalSubscriptionId = toGlobalId('Subscription', rawSubscriptionId);
    vi.spyOn(UserServiceApp, 'deleteUserService').mockRejectedValue(
      new Error(NotFoundErrorCode.SubscriptionNotFound)
    );

    // When
    const call = userServiceResolver.Mutation!.deleteUserService!(
      {},
      {
        input: { email: 'user@test.com', subscriptionId: globalSubscriptionId },
      },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    await expect(call).rejects.toMatchObject({ name: ErrorType.NotFound });
  });
});
