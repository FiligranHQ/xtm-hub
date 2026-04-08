import { v4 as uuidv4 } from 'uuid';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { contextSimple2, INFO } from '../../../../../tests/tests.const';
import { RefreshUserPlatformTokenResponse } from '../../../../__generated__/resolvers-types';
import { UnknownErrorCode } from '../../../../utils/error/error.code';
import { registrationApp } from '../../registration.app';
import registrationResolver from '../../registration.resolver';

describe('Mutation.refreshUserPlatformToken', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call registrationApp.refreshUserPlatformToken with the context user id and return the token', async () => {
    // Given
    const newToken = uuidv4();
    const tokenResponse: RefreshUserPlatformTokenResponse = {
      token: newToken,
    };
    vi.spyOn(registrationApp, 'refreshUserPlatformToken').mockResolvedValue(
      tokenResponse
    );

    // When
    const result = await registrationResolver.Mutation!
      .refreshUserPlatformToken!({}, {}, contextSimple2, INFO);

    // Then
    expect(registrationApp.refreshUserPlatformToken).toHaveBeenCalledWith(
      contextSimple2.user.id
    );
    expect(result).toMatchObject({ token: newToken });
  });

  it('should throw a mapped GraphQL error with RefreshUserPlatformTokenUnknownError when the app throws', async () => {
    // Given
    vi.spyOn(registrationApp, 'refreshUserPlatformToken').mockRejectedValue(
      new Error('UNEXPECTED')
    );

    // When
    const call = registrationResolver.Mutation!.refreshUserPlatformToken!(
      {},
      {},
      contextSimple2,
      INFO
    );

    // Then
    await expect(call).rejects.toThrow(
      UnknownErrorCode.RefreshUserPlatformTokenUnknownError
    );
  });
});
