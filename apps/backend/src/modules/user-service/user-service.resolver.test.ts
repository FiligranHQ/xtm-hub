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
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { UserServiceId } from '../../model/kanel/public/UserService';
import { UserWithOrganizationsAndRole } from '../../model/user';
import {
  ForbiddenErrorCode,
  NotFoundErrorCode,
} from '../../utils/error/error.code';
import { ErrorType } from '../../utils/error/error.type';
import { UserDomain } from '../organization-management/user/user-domain/user.domain';
import { UserServiceApp } from './user-service.app';
import { UserServiceDomain } from './user-service.domain';
import userServiceResolver from './user-service.resolver';

describe('userService field resolvers', () => {
  describe('userService.user', () => {
    it('should load user details by user_id', async () => {
      // Given
      const userId = TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID;
      const expected = { id: userId, email: 'user@test.com' };
      vi.spyOn(UserDomain, 'loadUserDetails').mockResolvedValue(
        expected as unknown as UserWithOrganizationsAndRole
      );

      // When
      const result = await userServiceResolver.UserService!.user!(
        { user_id: userId } as unknown as UserService,
        {},
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      // Then
      expect(UserDomain.loadUserDetails).toHaveBeenCalledWith({
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
      ).mockResolvedValue(
        expected as unknown as Awaited<
          ReturnType<typeof UserServiceDomain.loadUserServiceCapabilities>
        >
      );

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

describe('user service from subscription GraphQL query', () => {
  it('should delegate to UserServiceDomain', async () => {
    // Given
    const subscriptionId = uuidv4() as SubscriptionId;
    const paginationArgs = {
      first: 10,
      after: null,
      orderMode: OrderingMode.Asc,
      orderBy: UserServiceOrdering.Email,
    };
    const userServiceId = uuidv4() as UserServiceId;
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
    vi.spyOn(
      UserServiceDomain,
      'loadUserServiceBySubscription'
    ).mockReturnValue(expected as unknown as Promise<UserServiceConnection>);

    // When
    const result = await userServiceResolver.Query!
      .userServiceFromSubscription!(
      {},
      { ...paginationArgs, subscription_id: subscriptionId },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(
      UserServiceDomain.loadUserServiceBySubscription
    ).toHaveBeenCalledWith(paginationArgs, subscriptionId);
    expect(result).toEqual(expected);
  });
});

describe('add user service GraphQL mutation', () => {
  it('should delegate to UserServiceApp', async () => {
    // Given
    const subscriptionId = uuidv4() as SubscriptionId;
    const serviceInstanceId = uuidv4() as ServiceInstanceId;
    const input = {
      email: ['user@test.com'],
      capabilities: ['MANAGE_ACCESS'],
      subscription_id: subscriptionId,
    };
    const expected = [] as unknown as Awaited<
      ReturnType<typeof UserServiceApp.addUserService>
    >;
    vi.spyOn(UserServiceApp, 'addUserService').mockResolvedValue(expected);

    // When
    const result = await userServiceResolver.Mutation!.addUserService!(
      {},
      { input, service_instance_id: serviceInstanceId },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(UserServiceApp.addUserService).toHaveBeenCalledWith(
      contextSimpleUserFiligran2.user,
      subscriptionId,
      input.email,
      input.capabilities,
      serviceInstanceId
    );
    expect(result).toEqual(expected);
  });

  it('should map to ForbiddenAccess for EditCapabilitiesCantRemoveLastManageAccess error', async () => {
    // Given
    const subscriptionId = uuidv4() as SubscriptionId;
    vi.spyOn(UserServiceApp, 'addUserService').mockRejectedValue(
      new Error(ForbiddenErrorCode.EditCapabilitiesCantRemoveLastManageAccess)
    );

    // When
    const call = userServiceResolver.Mutation!.addUserService!(
      {},
      {
        input: {
          subscription_id: subscriptionId,
          email: ['user@test.com'],
          capabilities: [],
        },
        service_instance_id: uuidv4() as ServiceInstanceId,
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

describe('delete user service GraphQL mutation', () => {
  it('should delegate to UserServiceApp', async () => {
    // Given
    const userServiceId = uuidv4() as UserServiceId;
    const serviceInstanceId = uuidv4() as ServiceInstanceId;
    const expected = {
      userServiceIds: [userServiceId],
    };
    vi.spyOn(UserServiceApp, 'deleteUserServices').mockResolvedValue(
      expected as unknown as Awaited<
        ReturnType<typeof UserServiceApp.deleteUserServices>
      >
    );

    // When
    const result = await userServiceResolver.Mutation!.deleteUserServices!(
      {},
      {
        input: { userServiceIds: [userServiceId] },
        service_instance_id: serviceInstanceId,
      },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(UserServiceApp.deleteUserServices).toHaveBeenCalledWith(
      [userServiceId],
      serviceInstanceId
    );
    expect(result).toMatchObject({ userServiceIds: [userServiceId] });
  });

  it('should map to NotFound for SubscriptionNotFound error', async () => {
    // Given
    vi.spyOn(UserServiceApp, 'deleteUserServices').mockRejectedValue(
      new Error(NotFoundErrorCode.SubscriptionNotFound)
    );

    // When
    const call = userServiceResolver.Mutation!.deleteUserServices!(
      {},
      {
        input: { userServiceIds: [uuidv4() as UserServiceId] },
        service_instance_id: uuidv4() as ServiceInstanceId,
      },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    await expect(call).rejects.toMatchObject({ name: ErrorType.NotFound });
  });
});
