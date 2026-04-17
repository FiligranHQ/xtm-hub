import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  GRAPHQL_RESOLVE_INFO,
  TEST_ORGANIZATIONS,
} from '../../../../../tests/tests.const';
import {
  IsPlatformRegisteredInput,
  IsPlatformRegisteredResponse,
  PlatformRegistrationStatus,
} from '../../../../__generated__/resolvers-types';
import { BadRequestErrorCode } from '../../../../utils/error/error.code';
import { ErrorType } from '../../../../utils/error/error.type';
import { registrationApp } from '../../registration.app';
import registrationResolver from '../../registration.resolver';

describe('query.isPlatformRegistered', () => {
  it('should return the response from registrationApp on success', async () => {
    // Given
    const input: IsPlatformRegisteredInput = { platformId: uuidv4() };
    const appResponse: IsPlatformRegisteredResponse = {
      status: PlatformRegistrationStatus.Registered,
      platformTitle: 'My Platform',
      organization: { id: TEST_ORGANIZATIONS.FILIGRAN.ID },
    };
    vi.spyOn(registrationApp, 'isPlatformRegistered').mockResolvedValue(
      appResponse
    );

    // When
    const result = await registrationResolver.Query!.isPlatformRegistered!(
      {},
      { input },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(registrationApp.isPlatformRegistered).toHaveBeenCalledWith(input);
    expect(result).toMatchObject({
      status: PlatformRegistrationStatus.Registered,
      platformTitle: 'My Platform',
      organization: { id: TEST_ORGANIZATIONS.FILIGRAN.ID },
    });
  });

  it('should map to BadRequest for InvalidPlatformId error', async () => {
    // Given
    const input: IsPlatformRegisteredInput = { platformId: uuidv4() };
    vi.spyOn(registrationApp, 'isPlatformRegistered').mockRejectedValue(
      new Error(BadRequestErrorCode.InvalidPlatformId)
    );

    // When
    const call = registrationResolver.Query!.isPlatformRegistered!(
      {},
      { input },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    await expect(call).rejects.toMatchObject({ name: ErrorType.BadRequest });
  });
});
