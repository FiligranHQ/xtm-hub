import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  GRAPHQL_RESOLVE_INFO,
} from '../../../../../tests/tests.const';
import {
  PlatformIdentifier,
  UnregisterPlatformInput,
} from '../../../../__generated__/resolvers-types';
import { NotFoundErrorCode } from '../../../../utils/error/error.code';
import { ErrorType } from '../../../../utils/error/error.type';
import { registrationApp } from '../../registration.app';
import registrationResolver from '../../registration.resolver';

describe('mutation.unregisterPlatform', () => {
  it('should call registrationApp.unregisterPlatform and return { success: true }', async () => {
    // Given
    const input: UnregisterPlatformInput = {
      platformId: uuidv4(),
      identifier: PlatformIdentifier.Opencti,
    };
    vi.spyOn(registrationApp, 'unregisterPlatform').mockResolvedValue(
      undefined
    );

    // When
    const result = await registrationResolver.Mutation!.unregisterPlatform!(
      {},
      { input },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(registrationApp.unregisterPlatform).toHaveBeenCalledWith(input);
    expect(result).toMatchObject({ success: true });
  });

  it('should map to NotFound for ServiceInstanceNotFound error', async () => {
    // Given
    const input: UnregisterPlatformInput = {
      platformId: uuidv4(),
      identifier: PlatformIdentifier.Opencti,
    };
    vi.spyOn(registrationApp, 'unregisterPlatform').mockRejectedValue(
      new Error(NotFoundErrorCode.ServiceInstanceNotFound)
    );

    // When
    const call = registrationResolver.Mutation!.unregisterPlatform!(
      {},
      { input },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    await expect(call).rejects.toMatchObject({ name: ErrorType.NotFound });
  });
});
