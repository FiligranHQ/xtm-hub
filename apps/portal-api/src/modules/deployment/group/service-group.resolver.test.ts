import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  INFO,
  SERVICES,
} from '../../../../tests/tests.const';
import { Success } from '../../../__generated__/resolvers-types';
import { ServiceGroupId } from '../../../model/kanel/public/ServiceGroup';
import { UserId } from '../../../model/kanel/public/User';
import { ErrorType } from '../../../utils/error/error.type';
import { ServiceGroupApp } from './service-group.app';
import serviceGroupResolver from './service-group.resolver';

describe('ServiceGroup.users', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load group users by service group id', async () => {
    // Given
    const groupId = uuidv4() as ServiceGroupId;
    const expected = [{ id: uuidv4(), email: 'user@test.com' }];
    vi.spyOn(ServiceGroupApp, 'loadGroupUsers').mockResolvedValue(
      expected as never
    );

    // When
    const result = await serviceGroupResolver.ServiceGroup!.users!(
      { id: groupId } as unknown as never,
      {},
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    expect(ServiceGroupApp.loadGroupUsers).toHaveBeenCalledWith(groupId);
    expect(result).toEqual(expected);
  });
});

describe('Query.serviceGroups', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load groups for given serviceInstanceId and return result', async () => {
    // Given
    const serviceInstanceId = SERVICES.INSTANCES.VAULT.ID;
    const expected = [{ id: uuidv4(), name: 'Group A' }] as never;
    vi.spyOn(ServiceGroupApp, 'loadGroups').mockResolvedValue(expected);

    // When
    const result = await serviceGroupResolver.Query!.serviceGroups!(
      {},
      { serviceInstanceId },
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    expect(ServiceGroupApp.loadGroups).toHaveBeenCalledWith({
      serviceInstanceId,
    });
    expect(result).toEqual(expected);
  });

  it('should throw mapped error when ServiceGroupApp throws', async () => {
    // Given
    const serviceInstanceId = SERVICES.INSTANCES.VAULT.ID;
    vi.spyOn(ServiceGroupApp, 'loadGroups').mockRejectedValue(
      new Error('UNEXPECTED')
    );

    // When
    const call = serviceGroupResolver.Query!.serviceGroups!(
      {},
      { serviceInstanceId },
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    await expect(call).rejects.toMatchObject({ name: ErrorType.UnknownError });
  });
});

describe('Mutation.updateServiceGroups', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should decode user IDs from global IDs and delegate to ServiceGroupApp.updateGroups', async () => {
    // Given
    const groupId = uuidv4() as ServiceGroupId;
    const rawUserId1 = uuidv4() as UserId;
    const rawUserId2 = uuidv4() as UserId;
    const globalUserId1 = toGlobalId('User', rawUserId1);
    const globalUserId2 = toGlobalId('User', rawUserId2);
    const expected: Success = { success: true };
    vi.spyOn(ServiceGroupApp, 'updateGroups').mockResolvedValue(expected);

    // When
    const result = await serviceGroupResolver.Mutation!.updateServiceGroups!(
      {},
      {
        input: {
          groups: [{ id: groupId, userIds: [globalUserId1, globalUserId2] }],
        },
      },
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    expect(ServiceGroupApp.updateGroups).toHaveBeenCalledWith([
      { id: groupId, userIds: [rawUserId1, rawUserId2] },
    ]);
    expect(result).toMatchObject({ success: true });
  });

  it('should throw mapped error when ServiceGroupApp throws', async () => {
    // Given
    const groupId = uuidv4() as ServiceGroupId;
    const globalUserId = toGlobalId('User', uuidv4());
    vi.spyOn(ServiceGroupApp, 'updateGroups').mockRejectedValue(
      new Error('UNEXPECTED')
    );

    // When
    const call = serviceGroupResolver.Mutation!.updateServiceGroups!(
      {},
      { input: { groups: [{ id: groupId, userIds: [globalUserId] }] } },
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    await expect(call).rejects.toMatchObject({ name: ErrorType.UnknownError });
  });
});
