import { v4 as uuidv4 } from 'uuid';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  INFO,
} from '../../../../../tests/tests.const';
import {
  PlatformIdentifier,
  UnregisterPlatformInput,
} from '../../../../__generated__/resolvers-types';
import { UnknownErrorCode } from '../../../../utils/error/error.code';
import { registrationApp } from '../../registration.app';
import registrationResolver from '../../registration.resolver';

describe('mutation.unregisterPlatform', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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
      INFO
    );

    // Then
    expect(registrationApp.unregisterPlatform).toHaveBeenCalledWith(input);
    expect(result).toMatchObject({ success: true });
  });

  it('should throw a mapped GraphQL error with UnregisterPlatformUnknownError when the app throws', async () => {
    // Given
    const input: UnregisterPlatformInput = {
      platformId: uuidv4(),
      identifier: PlatformIdentifier.Opencti,
    };
    vi.spyOn(registrationApp, 'unregisterPlatform').mockRejectedValue(
      new Error('UNEXPECTED')
    );

    // When
    const call = registrationResolver.Mutation!.unregisterPlatform!(
      {},
      { input },
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    await expect(call).rejects.toThrow(
      UnknownErrorCode.UnregisterPlatformUnknownError
    );
  });
});
