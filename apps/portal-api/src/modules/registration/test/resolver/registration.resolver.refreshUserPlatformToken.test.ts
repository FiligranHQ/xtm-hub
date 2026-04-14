import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  INFO,
} from '../../../../../tests/tests.const';
import { RefreshUserPlatformTokenResponse } from '../../../../__generated__/resolvers-types';
import { NotFoundErrorCode } from '../../../../utils/error/error.code';
import { ErrorType } from '../../../../utils/error/error.type';
import { registrationApp } from '../../registration.app';
import registrationResolver from '../../registration.resolver';

describe('mutation.refreshUserPlatformToken', () => {
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
      .refreshUserPlatformToken!({}, {}, contextSimpleUserFiligran2, INFO);

    // Then
    expect(registrationApp.refreshUserPlatformToken).toHaveBeenCalledWith(
      contextSimpleUserFiligran2.user.id
    );
    expect(result).toMatchObject({ token: newToken });
  });

  it('should map to NotFound for ServiceContractNotFound error', async () => {
    // Given
    vi.spyOn(registrationApp, 'refreshUserPlatformToken').mockRejectedValue(
      new Error(NotFoundErrorCode.ServiceContractNotFound)
    );

    // When
    const call = registrationResolver.Mutation!.refreshUserPlatformToken!(
      {},
      {},
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    await expect(call).rejects.toMatchObject({ name: ErrorType.NotFound });
  });
});
