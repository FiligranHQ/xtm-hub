import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  GRAPHQL_RESOLVE_INFO,
  SERVICES,
} from '../../../../tests/tests.const';
import { SubscriptionModel } from '../../../__generated__/resolvers-types';
import { UserServiceId } from '../../../model/kanel/public/UserService';
import { ForbiddenErrorCode } from '../../../utils/error/error.code';
import { ErrorType } from '../../../utils/error/error.type';
import { serviceCapabilityApp } from './service-capability.app';
import serviceCapabilityResolver from './service-capability.resolver';

describe('edit service capability GraphQL mutation', () => {
  it('should delegate to serviceCapabilityApp', async () => {
    // Given
    const userServiceId = uuidv4() as UserServiceId;
    const serviceInstanceId = SERVICES.INSTANCES.INTEGRATIONS.ID;
    const capabilities = ['MANAGE_ACCESS'];
    const expected = { id: uuidv4() } as unknown as SubscriptionModel;
    vi.spyOn(serviceCapabilityApp, 'editServiceCapability').mockResolvedValue(
      expected
    );

    // When
    const result = await serviceCapabilityResolver.Mutation!
      .editServiceCapability!(
      {},
      {
        input: { user_service_id: userServiceId, capabilities },
        serviceInstanceId,
      },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(serviceCapabilityApp.editServiceCapability).toHaveBeenCalledWith(
      userServiceId,
      capabilities,
      serviceInstanceId
    );
    expect(result).toEqual(expected);
  });

  it('should map to ForbiddenAccess for EditCapabilitiesCantRemoveLastManageAccess error', async () => {
    // Given
    const userServiceId = uuidv4() as UserServiceId;
    const serviceInstanceId = SERVICES.INSTANCES.INTEGRATIONS.ID;
    vi.spyOn(serviceCapabilityApp, 'editServiceCapability').mockRejectedValue(
      new Error(ForbiddenErrorCode.EditCapabilitiesCantRemoveLastManageAccess)
    );

    // When
    const call = serviceCapabilityResolver.Mutation!.editServiceCapability!(
      {},
      {
        input: { user_service_id: userServiceId, capabilities: [] },
        serviceInstanceId,
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
